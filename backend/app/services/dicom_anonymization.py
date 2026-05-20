from dataclasses import dataclass
from io import BytesIO
from uuid import uuid4

import pydicom


@dataclass(frozen=True)
class DicomAnonymizationResult:
    content: bytes
    original_patient_id: str
    anonymous_patient_id: str
    removed_fields: tuple[str, ...]


SENSITIVE_DICOM_KEYWORDS = (
    "PatientName",
    "PatientBirthDate",
    "PatientAddress",
    "PatientTelephoneNumbers",
    "PatientAge",
    "PatientSex",
    "PatientComments",
    "OtherPatientIDs",
    "OtherPatientNames",
    "PatientMotherBirthName",
    "EthnicGroup",
    "Occupation",
    "InsurancePlanIdentification",
    "InstitutionName",
    "InstitutionAddress",
    "ReferringPhysicianName",
    "PerformingPhysicianName",
    "OperatorsName",
    "AccessionNumber",
    "StudyID",
    "StudyDate",
    "StudyTime",
    "SeriesDate",
    "SeriesTime",
    "AcquisitionDate",
    "AcquisitionTime",
    "ContentDate",
    "ContentTime",
    "DeviceSerialNumber",
    "ProtocolName",
)


def anonymize_dicom_content(content: bytes) -> DicomAnonymizationResult:
    dataset = pydicom.dcmread(BytesIO(content))
    original_patient_id = str(dataset.PatientID)
    anonymous_patient_id = f"ANON-{uuid4().hex[:16].upper()}"
    removed_fields: list[str] = []

    dataset.remove_private_tags()
    dataset.PatientID = anonymous_patient_id
    dataset.PatientName = "ANONYMIZED"
    dataset.PatientIdentityRemoved = "YES"
    dataset.DeidentificationMethod = "PFD Sprint 2 automatic DICOM metadata anonymization"

    for keyword in SENSITIVE_DICOM_KEYWORDS:
        if keyword in {"PatientName"}:
            continue
        if keyword in dataset.dir():
            delattr(dataset, keyword)
            removed_fields.append(keyword)

    buffer = BytesIO()
    dataset.save_as(buffer, write_like_original=False)
    return DicomAnonymizationResult(
        content=buffer.getvalue(),
        original_patient_id=original_patient_id,
        anonymous_patient_id=anonymous_patient_id,
        removed_fields=tuple(removed_fields),
    )
