from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.analysis_history import AnalysisHistoryStatus


class AnalysisHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_user_id: int
    medical_image_id: int
    original_filename: str
    analysis_status: AnalysisHistoryStatus
    prediction: str | None = None
    confidence: float | None = None
    latency_ms: float | None = None
    severity: str | None = None
    is_ambiguous: bool = False
    error_message: str | None = None
    gradcam_path: str | None = None
    created_at: datetime
    completed_at: datetime | None = None
