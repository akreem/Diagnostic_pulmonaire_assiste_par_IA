from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_optional_current_user, require_admin
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.consent import UserConsent
from app.schemas.auth import LoginRequest, SetupStatus, TokenResponse, UserCreate, UserRead
from app.services.audit import write_audit_log, get_client_ip
from app.services.email import send_registration_confirmation

router = APIRouter()


def admin_exists(db: Session) -> bool:
    return db.scalar(select(User.id).where(User.role == UserRole.admin).limit(1)) is not None


@router.get("/setup-status", response_model=SetupStatus)
def read_setup_status(db: Session = Depends(get_db)) -> SetupStatus:
    return SetupStatus(has_admin=admin_exists(db))


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    payload: UserCreate,
    request: Request,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> User:
    has_admin = admin_exists(db)
    if has_admin:
        if current_user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        if current_user.role != UserRole.admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    elif payload.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Create an administrator account to initialize the app")

    existing_user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing_user:
        write_audit_log(
            db,
            request,
            action="register_failed",
            resource_type="user",
            metadata={"reason": "email_exists", "email": payload.email.lower()},
        )
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        role=payload.role,
        consent_granted=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    send_registration_confirmation(user.email)
    write_audit_log(db, request, action="register_success", resource_type="user", actor_user_id=user.id, resource_id=str(user.id))
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        write_audit_log(
            db,
            request,
            action="login_failed",
            resource_type="user",
            metadata={"email": payload.email.lower()},
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not payload.consent_granted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le consentement au traitement des données de santé est obligatoire pour se connecter."
        )

    user.last_login_at = datetime.now(timezone.utc)
    
    consent_recorded = False
    consent_id = None
    
    if not user.consent_granted:
        user.consent_granted = True
        consent_recorded = True

    db.add(user)
    db.commit()
    db.refresh(user)

    if consent_recorded:
        consent = UserConsent(
            user_id=user.id,
            is_granted=True,
            ip_address=get_client_ip(request),
            user_agent=request.headers.get("user-agent"),
        )
        db.add(consent)
        db.commit()
        db.refresh(consent)
        consent_id = consent.id

    write_audit_log(db, request, action="login_success", resource_type="user", actor_user_id=user.id, resource_id=str(user.id))
    
    if consent_recorded:
        write_audit_log(
            db,
            request,
            action="consent_granted",
            resource_type="user_consent",
            actor_user_id=user.id,
            resource_id=str(consent_id),
            metadata={"consent_type": "health_data_processing"},
        )

    token = create_access_token(subject=str(user.id), extra_claims={"role": user.role.value})
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.get("/users", response_model=list[UserRead])
def list_users(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.desc(), User.id.desc())).all())


@router.post("/logout")
def logout(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    write_audit_log(
        db,
        request,
        action="logout",
        resource_type="user",
        actor_user_id=current_user.id,
        resource_id=str(current_user.id),
    )
    return {"status": "logged_out"}


@router.post("/consent/withdraw", status_code=status.HTTP_200_OK)
def withdraw_consent(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    current_user.consent_granted = False
    db.add(current_user)

    from app.services.cache import cache_client
    from app.api.dashboard import dashboard_stats_cache_key

    consent = UserConsent(
        user_id=current_user.id,
        is_granted=False,
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)

    write_audit_log(
        db,
        request,
        action="consent_withdrawn",
        resource_type="user_consent",
        actor_user_id=current_user.id,
        resource_id=str(consent.id),
        metadata={"consent_type": "health_data_processing"}
    )
    cache_client.delete(dashboard_stats_cache_key(current_user.id))
    return {"status": "consent_withdrawn"}


@router.post("/consent/grant", status_code=status.HTTP_200_OK)
def grant_consent(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    current_user.consent_granted = True
    db.add(current_user)

    from app.services.cache import cache_client
    from app.api.dashboard import dashboard_stats_cache_key

    consent = UserConsent(
        user_id=current_user.id,
        is_granted=True,
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)

    write_audit_log(
        db,
        request,
        action="consent_granted",
        resource_type="user_consent",
        actor_user_id=current_user.id,
        resource_id=str(consent.id),
        metadata={"consent_type": "health_data_processing"}
    )
    cache_client.delete(dashboard_stats_cache_key(current_user.id))
    return {"status": "consent_granted"}
