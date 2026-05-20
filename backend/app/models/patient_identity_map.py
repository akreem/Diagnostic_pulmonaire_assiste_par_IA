from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class PatientIdentityMap(Base):
    __tablename__ = "patient_identity_maps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    medical_image_id: Mapped[int] = mapped_column(ForeignKey("medical_images.id"), nullable=False, index=True)
    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    anonymous_patient_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    encrypted_original_patient_id: Mapped[str] = mapped_column(String(512), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
