import hashlib
import re
import uuid
from dataclasses import dataclass
from pathlib import Path

from app.core.config import settings
from app.services.crypto import decrypt_bytes, encrypt_bytes
from app.services.upload_errors import UploadErrorCode, UploadValidationError

ALLOWED_EXTENSIONS = {".dcm", ".png", ".jpg", ".jpeg"}
ALLOWED_CONTENT_TYPES = {
    "application/dicom",
    "application/octet-stream",
    "image/jpeg",
    "image/png",
}


@dataclass(frozen=True)
class StoredUpload:
    stored_filename: str
    storage_path: str
    encrypted_size_bytes: int
    checksum_sha256: str


def sanitize_filename(filename: str) -> str:
    cleaned = Path(filename).name.strip()
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", cleaned)
    return cleaned or "upload"


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def validate_upload_file(filename: str, content_type: str | None, content: bytes) -> tuple[str, str]:
    safe_name = sanitize_filename(filename)
    extension = get_file_extension(safe_name)
    normalized_content_type = content_type or "application/octet-stream"

    if extension not in ALLOWED_EXTENSIONS:
        raise UploadValidationError(UploadErrorCode.unsupported_file_type)

    if normalized_content_type not in ALLOWED_CONTENT_TYPES:
        raise UploadValidationError(UploadErrorCode.unsupported_content_type)

    if not content:
        raise UploadValidationError(UploadErrorCode.empty_file)

    if len(content) > settings.upload_max_file_size_bytes:
        raise UploadValidationError(UploadErrorCode.file_too_large)

    if extension == ".png" and not content.startswith(b"\x89PNG\r\n\x1a\n"):
        raise UploadValidationError(UploadErrorCode.invalid_png_signature)

    if extension in {".jpg", ".jpeg"} and not content.startswith(b"\xff\xd8"):
        raise UploadValidationError(UploadErrorCode.invalid_jpeg_signature)

    return safe_name, extension


def encrypt_and_store_upload(content: bytes, extension: str) -> StoredUpload:
    storage_dir = Path(settings.upload_storage_dir)
    storage_dir.mkdir(parents=True, exist_ok=True)

    stored_filename = f"{uuid.uuid4().hex}{extension}.enc"
    target = storage_dir / stored_filename
    target.write_bytes(encrypt_bytes(content))

    return StoredUpload(
        stored_filename=stored_filename,
        storage_path=str(target),
        encrypted_size_bytes=target.stat().st_size,
        checksum_sha256=hashlib.sha256(content).hexdigest(),
    )


def read_encrypted_upload(path: str) -> bytes:
    return decrypt_bytes(Path(path).read_bytes())
