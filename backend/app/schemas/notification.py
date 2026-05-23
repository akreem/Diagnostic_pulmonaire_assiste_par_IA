from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    message: str = Field(min_length=1, max_length=4000)
    category: str = Field(default="info", min_length=1, max_length=40)
    resource_type: str | None = Field(default=None, max_length=80)
    resource_id: str | None = Field(default=None, max_length=100)
    recipient_user_id: int | None = None


class NotificationPreference(BaseModel):
    notifications_enabled: bool


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_user_id: int
    title: str
    message: str
    category: str
    resource_type: str | None = None
    resource_id: str | None = None
    is_read: bool
    created_at: datetime
    read_at: datetime | None = None
