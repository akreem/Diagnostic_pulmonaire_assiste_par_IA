from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.patient_identity_map import PatientIdentityMap
from app.models.user import User
from app.schemas.patient_identity import PatientIdentityRead, PatientIdentitySummary
from app.services.audit import write_audit_log
from app.services.crypto import decrypt_text

router = APIRouter()


@router.get("", response_model=list[PatientIdentitySummary])
def list_patient_identities(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
    limit: int = 100,
) -> list[PatientIdentityMap]:
    statement = select(PatientIdentityMap).order_by(PatientIdentityMap.created_at.desc()).limit(min(limit, 500))
    return list(db.scalars(statement))


@router.get("/{anonymous_patient_id}", response_model=PatientIdentityRead)
def reidentify_patient(
    anonymous_patient_id: str,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> PatientIdentityRead:
    mapping = db.scalar(
        select(PatientIdentityMap).where(PatientIdentityMap.anonymous_patient_id == anonymous_patient_id)
    )
    if not mapping:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anonymous patient ID not found")

    write_audit_log(
        db,
        request,
        action="patient_reidentified",
        resource_type="patient_identity_map",
        actor_user_id=current_user.id,
        resource_id=str(mapping.id),
        metadata={"anonymous_patient_id": mapping.anonymous_patient_id},
    )

    return PatientIdentityRead(
        anonymous_patient_id=mapping.anonymous_patient_id,
        original_patient_id=decrypt_text(mapping.encrypted_original_patient_id),
        medical_image_id=mapping.medical_image_id,
        created_at=mapping.created_at,
    )
