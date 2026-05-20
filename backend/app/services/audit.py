from fastapi import Request
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def get_client_ip(request: Request) -> str | None:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else None


def write_audit_log(
    db: Session,
    request: Request,
    action: str,
    resource_type: str,
    actor_user_id: int | None = None,
    resource_id: str | None = None,
    metadata: dict | None = None,
) -> AuditLog:
    entry = AuditLog(
        actor_user_id=actor_user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
        metadata_json=metadata,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

