from datetime import datetime, timezone
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class AnalysisHistoryStatus(StrEnum):
    pending = "pending"
    completed = "completed"
    failed = "failed"


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    medical_image_id: Mapped[int] = mapped_column(ForeignKey("medical_images.id"), nullable=False, index=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    analysis_status: Mapped[AnalysisHistoryStatus] = mapped_column(
        Enum(AnalysisHistoryStatus),
        default=AnalysisHistoryStatus.pending,
        nullable=False,
        index=True,
    )
    prediction: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    latency_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    severity: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    is_ambiguous: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    gradcam_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
