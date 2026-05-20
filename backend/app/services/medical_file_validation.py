from dataclasses import dataclass
from io import BytesIO

import pydicom
from pydicom.errors import InvalidDicomError

from app.services.upload_errors import UploadErrorCode


class MedicalFileValidationError(ValueError):
    def __init__(self, code: UploadErrorCode, extra: str | None = None) -> None:
        self.code = code
        self.extra = extra
        super().__init__(extra or code.value)


@dataclass(frozen=True)
class MedicalFileValidationResult:
    file_type: str
    metadata_keys: tuple[str, ...]


REQUIRED_DICOM_METADATA = ("Modality", "PatientID")


def validate_medical_file_content(extension: str, content: bytes) -> MedicalFileValidationResult:
    if extension == ".dcm":
        return validate_dicom_content(content)

    if extension == ".png":
        return MedicalFileValidationResult(file_type="png", metadata_keys=())

    if extension in {".jpg", ".jpeg"}:
        return MedicalFileValidationResult(file_type="jpeg", metadata_keys=())

    raise MedicalFileValidationError("Unsupported medical file type.", "unsupported_file_type")


def validate_dicom_content(content: bytes) -> MedicalFileValidationResult:
    if len(content) < 132 or content[128:132] != b"DICM":
        raise MedicalFileValidationError(UploadErrorCode.missing_dicom_marker)

    try:
        dataset = pydicom.dcmread(BytesIO(content), stop_before_pixels=True)
    except (InvalidDicomError, OSError, EOFError, ValueError) as exc:
        raise MedicalFileValidationError(UploadErrorCode.corrupted_dicom) from exc

    if not getattr(dataset, "file_meta", None) or not getattr(dataset.file_meta, "TransferSyntaxUID", None):
        raise MedicalFileValidationError(UploadErrorCode.corrupted_dicom)

    missing_metadata = [name for name in REQUIRED_DICOM_METADATA if not getattr(dataset, name, None)]
    if missing_metadata:
        readable_missing = ", ".join(missing_metadata)
        raise MedicalFileValidationError(UploadErrorCode.missing_required_metadata, readable_missing)

    return MedicalFileValidationResult(
        file_type="dicom",
        metadata_keys=tuple(REQUIRED_DICOM_METADATA),
    )
