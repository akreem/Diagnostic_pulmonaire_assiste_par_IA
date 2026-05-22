from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.medical_image import MedicalImageStatus


class DashboardBreakdownItem(BaseModel):
    label: str
    value: int


class DashboardRecentAnalysis(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_filename: str
    status: MedicalImageStatus
    created_at: datetime
    ai_prediction: str | None = None
    ai_confidence: float | None = None
    ai_latency_ms: float | None = None
    is_ambiguous: bool = False


class DashboardStats(BaseModel):
    total_exams: int
    analyzed_count: int
    normal_count: int
    suspect_count: int
    critical_count: int
    pending_count: int
    ambiguous_count: int
    average_confidence: float | None = None
    average_latency_ms: float | None = None
    severity_breakdown: list[DashboardBreakdownItem]
    status_breakdown: list[DashboardBreakdownItem]
    recent_analyses: list[DashboardRecentAnalysis]
