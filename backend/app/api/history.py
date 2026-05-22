import csv
from datetime import datetime
from io import StringIO

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy import Select
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.analysis_history import AnalysisHistory, AnalysisHistoryStatus
from app.models.user import User
from app.schemas.history import AnalysisHistoryRead

router = APIRouter()


def build_history_query(
    current_user: User,
    status: AnalysisHistoryStatus | None = Query(default=None),
    prediction: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    ambiguous: bool | None = Query(default=None),
    search: str | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    *,
    ordered: bool = True,
) -> Select[tuple[AnalysisHistory]]:
    query = select(AnalysisHistory).where(AnalysisHistory.owner_user_id == current_user.id)

    if status is not None:
        query = query.where(AnalysisHistory.analysis_status == status)
    if prediction:
        query = query.where(AnalysisHistory.prediction == prediction.upper())
    if severity:
        query = query.where(AnalysisHistory.severity == severity.lower())
    if ambiguous is not None:
        query = query.where(AnalysisHistory.is_ambiguous == ambiguous)
    if search:
        query = query.where(AnalysisHistory.original_filename.ilike(f"%{search}%"))
    if date_from is not None:
        query = query.where(AnalysisHistory.created_at >= date_from)
    if date_to is not None:
        query = query.where(AnalysisHistory.created_at <= date_to)

    if ordered:
        query = query.order_by(AnalysisHistory.created_at.desc(), AnalysisHistory.id.desc())
    return query


@router.get("/export.csv")
def export_analysis_history_csv(
    status: AnalysisHistoryStatus | None = Query(default=None),
    prediction: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    ambiguous: bool | None = Query(default=None),
    search: str | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    query = build_history_query(
        current_user,
        status,
        prediction,
        severity,
        ambiguous,
        search,
        date_from,
        date_to,
    )
    rows = list(db.scalars(query).all())
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "medical_image_id",
            "original_filename",
            "analysis_status",
            "prediction",
            "confidence",
            "latency_ms",
            "severity",
            "is_ambiguous",
            "created_at",
            "completed_at",
            "error_message",
        ]
    )
    for row in rows:
        writer.writerow(
            [
                row.id,
                row.medical_image_id,
                row.original_filename,
                row.analysis_status.value,
                row.prediction or "",
                row.confidence if row.confidence is not None else "",
                row.latency_ms if row.latency_ms is not None else "",
                row.severity or "",
                row.is_ambiguous,
                row.created_at.isoformat(),
                row.completed_at.isoformat() if row.completed_at else "",
                row.error_message or "",
            ]
        )

    return Response(
        content=output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="analysis-history.csv"'},
    )


@router.get("", response_model=list[AnalysisHistoryRead])
def list_analysis_history(
    status: AnalysisHistoryStatus | None = Query(default=None),
    prediction: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    ambiguous: bool | None = Query(default=None),
    search: str | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AnalysisHistory]:
    query = build_history_query(
        current_user,
        status,
        prediction,
        severity,
        ambiguous,
        search,
        date_from,
        date_to,
    )
    return list(db.scalars(query).all())
