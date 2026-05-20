from datetime import datetime

from pydantic import BaseModel


class AuditLogRead(BaseModel):
    id: int
    actor_user_id: int | None
    action: str
    resource_type: str
    resource_id: str | None
    ip_address: str | None
    user_agent: str | None
    metadata_json: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}

