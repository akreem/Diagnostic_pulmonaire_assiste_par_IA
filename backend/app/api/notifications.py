from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.notification import Notification
from app.models.user import User, UserRole
from app.schemas.notification import NotificationCreate, NotificationPreference, NotificationRead

router = APIRouter()


@router.get("", response_model=list[NotificationRead])
def list_notifications(
    unread_only: bool = Query(default=False),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Notification]:
    statement = select(Notification).where(Notification.owner_user_id == current_user.id)
    if unread_only:
        statement = statement.where(Notification.is_read.is_(False))
    statement = statement.order_by(Notification.created_at.desc(), Notification.id.desc()).offset(offset).limit(limit)
    return list(db.scalars(statement).all())


@router.get("/preferences", response_model=NotificationPreference)
def get_notification_preferences(current_user: User = Depends(get_current_user)) -> NotificationPreference:
    return NotificationPreference(notifications_enabled=current_user.notifications_enabled)


@router.put("/preferences", response_model=NotificationPreference)
def update_notification_preferences(
    payload: NotificationPreference,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NotificationPreference:
    current_user.notifications_enabled = payload.notifications_enabled
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return NotificationPreference(notifications_enabled=current_user.notifications_enabled)


@router.post("", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Notification:
    owner_user_id = payload.recipient_user_id or current_user.id
    if owner_user_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required to notify another user")
    if payload.recipient_user_id is not None and db.get(User, payload.recipient_user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient user not found")

    notification = Notification(
        owner_user_id=owner_user_id,
        title=payload.title,
        message=payload.message,
        category=payload.category.lower(),
        resource_type=payload.resource_type,
        resource_id=payload.resource_id,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Notification:
    notification = db.scalar(
        select(Notification).where(Notification.id == notification_id, Notification.owner_user_id == current_user.id)
    )
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.patch("/{notification_id}/unread", response_model=NotificationRead)
def mark_notification_unread(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Notification:
    notification = db.scalar(
        select(Notification).where(Notification.id == notification_id, Notification.owner_user_id == current_user.id)
    )
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.is_read = False
    notification.read_at = None
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
