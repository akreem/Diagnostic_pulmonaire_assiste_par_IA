from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.medical_image import MedicalImage, MedicalImageStatus
from app.models.user import User
from app.schemas.dashboard import DashboardBreakdownItem, DashboardStats

router = APIRouter()


def severity_for(image: MedicalImage) -> str:
    if image.status != MedicalImageStatus.analyzed or not image.ai_prediction:
        return "Pending"
    if image.ai_prediction == "PNEUMONIA" and (image.ai_confidence or 0) >= 0.76:
        return "Critical"
    if image.ai_prediction == "PNEUMONIA" or image.is_ambiguous:
        return "Suspect"
    return "Normal"


@router.get("/stats", response_model=DashboardStats)
def read_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardStats:
    images = list(
        db.scalars(
            select(MedicalImage)
            .where(MedicalImage.owner_user_id == current_user.id)
            .order_by(MedicalImage.created_at.desc(), MedicalImage.id.desc())
        ).all()
    )

    severity_counts = {"Normal": 0, "Suspect": 0, "Critical": 0, "Pending": 0}
    status_counts = {status.value: 0 for status in MedicalImageStatus}
    confidences: list[float] = []
    latencies: list[float] = []

    for image in images:
        severity_counts[severity_for(image)] += 1
        status_counts[image.status.value] = status_counts.get(image.status.value, 0) + 1
        if image.ai_confidence is not None:
            confidences.append(image.ai_confidence)
        if image.ai_latency_ms is not None:
            latencies.append(image.ai_latency_ms)

    return DashboardStats(
        total_exams=len(images),
        analyzed_count=status_counts.get(MedicalImageStatus.analyzed.value, 0),
        normal_count=severity_counts["Normal"],
        suspect_count=severity_counts["Suspect"],
        critical_count=severity_counts["Critical"],
        pending_count=severity_counts["Pending"],
        ambiguous_count=sum(1 for image in images if image.is_ambiguous),
        average_confidence=round(sum(confidences) / len(confidences), 4) if confidences else None,
        average_latency_ms=round(sum(latencies) / len(latencies), 2) if latencies else None,
        severity_breakdown=[
            DashboardBreakdownItem(label=label, value=value)
            for label, value in severity_counts.items()
        ],
        status_breakdown=[
            DashboardBreakdownItem(label=label, value=value)
            for label, value in status_counts.items()
        ],
        recent_analyses=images[:5],
    )
