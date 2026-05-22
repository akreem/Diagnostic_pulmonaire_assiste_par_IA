from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.medical_image import MedicalImage
from app.models.user import User
from app.schemas.upload import MedicalImageRead

router = APIRouter()


@router.get("/{image_id}", response_model=MedicalImageRead)
def read_analysis_result(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MedicalImage:
    image = db.scalar(
        select(MedicalImage).where(
            MedicalImage.id == image_id,
            MedicalImage.owner_user_id == current_user.id,
        )
    )
    if image is None:
        raise HTTPException(status_code=404, detail="Result not found")
    return image
