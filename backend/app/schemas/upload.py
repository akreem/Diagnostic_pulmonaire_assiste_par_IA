from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.medical_image import MedicalImageStatus


class MedicalImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_filename: str
    content_type: str
    file_extension: str
    file_size_bytes: int
    status: MedicalImageStatus
    created_at: datetime


class UploadBatchResponse(BaseModel):
    images: list[MedicalImageRead]
