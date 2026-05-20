from datetime import datetime

from pydantic import BaseModel


class PatientIdentityRead(BaseModel):
    anonymous_patient_id: str
    original_patient_id: str
    medical_image_id: int
    created_at: datetime


class PatientIdentitySummary(BaseModel):
    anonymous_patient_id: str
    medical_image_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
