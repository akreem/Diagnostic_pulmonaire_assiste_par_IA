import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_consent
from app.core.config import settings
from app.db.session import get_db
from app.models.medical_image import MedicalImage, MedicalImageStatus
from app.models.user import User
from app.schemas.dashboard import DashboardBreakdownItem, DashboardStats
from app.services.cache import cache_client

router = APIRouter()
logger = logging.getLogger(__name__)
CACHE_KEY_PREFIX = "dashboard:stats:user"


def severity_for(image: MedicalImage) -> str:
    if image.status != MedicalImageStatus.analyzed or not image.ai_prediction:
        return "Pending"
    if image.ai_prediction == "PNEUMONIA" and (image.ai_confidence or 0) >= 0.76:
        return "Critical"
    if image.ai_prediction == "PNEUMONIA" or image.is_ambiguous:
        return "Suspect"
    return "Normal"


def dashboard_stats_cache_key(user_id: int) -> str:
    return f"{CACHE_KEY_PREFIX}:{user_id}"


def build_dashboard_stats(current_user: User, db: Session) -> DashboardStats:
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


@router.get("/stats", response_model=DashboardStats)
def read_dashboard_stats(
    current_user: User = Depends(require_consent),
    db: Session = Depends(get_db),
) -> DashboardStats:
    cache_key = dashboard_stats_cache_key(current_user.id)
    cached = cache_client.get_text(cache_key)
    if cached:
        try:
            return DashboardStats.model_validate_json(cached)
        except Exception:
            logger.exception("Invalid cached dashboard stats for user %s", current_user.id)

    stats = build_dashboard_stats(current_user, db)
    cache_client.set_text(cache_key, stats.model_dump_json(), settings.dashboard_cache_ttl_seconds)
    return stats
