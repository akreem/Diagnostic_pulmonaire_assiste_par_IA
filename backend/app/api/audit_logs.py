from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit import AuditLogRead

router = APIRouter()


@router.get("", response_model=list[AuditLogRead])
def list_audit_logs(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
    limit: int = 100,
) -> list[AuditLog]:
    statement = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(min(limit, 500))
    return list(db.scalars(statement))

