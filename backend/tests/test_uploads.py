from io import BytesIO
from pathlib import Path

from pydicom import dcmread
from fastapi.testclient import TestClient
from pydicom.dataset import FileDataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, SecondaryCaptureImageStorage, generate_uid
from sqlalchemy import select

from app.core.config import settings
from app.db.session import SessionLocal
from app.main import app
from app.models.audit_log import AuditLog
from app.models.medical_image import MedicalImage
from app.models.patient_identity_map import PatientIdentityMap
from app.services.crypto import decrypt_text
from app.services.upload_storage import read_encrypted_upload

client = TestClient(app)


def error_code(response) -> str:
    return response.json()["detail"]["code"]


def create_admin_token(email: str = "admin-upload@example.com") -> str:
    client.post(
        "/auth/register",
        json={
            "email": email,
            "full_name": "Admin Upload",
            "password": "StrongPass123",
            "role": "admin",
        },
    )
    login = client.post(
        "/auth/login",
        json={"email": email, "password": "StrongPass123"},
    )
    return login.json()["access_token"]


def create_test_dicom(*, include_patient_id: bool = True, include_modality: bool = True) -> bytes:
    file_meta = FileMetaDataset()
    file_meta.MediaStorageSOPClassUID = SecondaryCaptureImageStorage
    file_meta.MediaStorageSOPInstanceUID = generate_uid()
    file_meta.TransferSyntaxUID = ExplicitVRLittleEndian

    dataset = FileDataset("scan.dcm", {}, file_meta=file_meta, preamble=b"\0" * 128)
    dataset.SOPClassUID = file_meta.MediaStorageSOPClassUID
    dataset.SOPInstanceUID = file_meta.MediaStorageSOPInstanceUID
    if include_patient_id:
        dataset.PatientID = "PATIENT-001"
        dataset.PatientName = "Jane Sensitive"
        dataset.PatientBirthDate = "19700101"
        dataset.PatientAddress = "1 Private Street"
    if include_modality:
        dataset.Modality = "CR"

    buffer = BytesIO()
    dataset.save_as(buffer, write_like_original=False)
    return buffer.getvalue()


def register_and_login() -> str:
    admin_token = create_admin_token()
    client.post(
        "/auth/register",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "uploader@example.com",
            "full_name": "Dr Upload",
            "password": "StrongPass123",
            "role": "doctor",
        },
    )
    login = client.post(
        "/auth/login",
        json={"email": "uploader@example.com", "password": "StrongPass123"},
    )
    return login.json()["access_token"]


def register_and_login_admin() -> str:
    return create_admin_token()


def test_authenticated_user_can_upload_png_batch(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()
    png_content = b"\x89PNG\r\n\x1a\n" + b"scan-data"

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("scan.png", png_content, "image/png"))],
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["images"][0]["original_filename"] == "scan.png"
    assert payload["images"][0]["status"] == "validated"

    with SessionLocal() as db:
        image = db.get(MedicalImage, payload["images"][0]["id"])
        assert image is not None
        assert image.file_size_bytes == len(png_content)
        stored_path = Path(image.storage_path)

    assert stored_path.exists()
    assert stored_path.read_bytes() != png_content


def test_authenticated_user_can_upload_valid_dicom(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()
    dicom_content = create_test_dicom()

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("scan.dcm", dicom_content, "application/dicom"))],
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["images"][0]["status"] == "anonymized"

    with SessionLocal() as db:
        image = db.get(MedicalImage, payload["images"][0]["id"])
        assert image is not None
        mapping = db.scalar(select(PatientIdentityMap).where(PatientIdentityMap.medical_image_id == image.id))
        assert mapping is not None
        anonymized_content = read_encrypted_upload(image.storage_path)

    stored_dataset = dcmread(BytesIO(anonymized_content), stop_before_pixels=True)
    assert stored_dataset.PatientID == mapping.anonymous_patient_id
    assert str(stored_dataset.PatientName) == "ANONYMIZED"
    assert "PatientBirthDate" not in stored_dataset.dir()
    assert "PatientAddress" not in stored_dataset.dir()
    assert "PATIENT-001" not in anonymized_content.decode("latin-1", errors="ignore")
    assert decrypt_text(mapping.encrypted_original_patient_id) == "PATIENT-001"
    assert "PATIENT-001" not in mapping.encrypted_original_patient_id


def test_upload_requires_authentication():
    response = client.post(
        "/upload",
        files=[("files", ("scan.png", b"\x89PNG\r\n\x1a\nscan-data", "image/png"))],
    )

    assert response.status_code == 401


def test_upload_rejects_missing_files_with_catalog_error():
    token = register_and_login()

    response = client.post("/upload", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 400
    assert error_code(response) == "upload_no_files"


def test_upload_rejects_unsupported_file_type(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("notes.txt", b"not an image", "text/plain"))],
    )

    assert response.status_code == 415
    assert error_code(response) == "upload_unsupported_file_type"
    assert not list(tmp_path.iterdir())


def test_upload_rejects_files_over_configured_limit(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    monkeypatch.setattr(settings, "upload_max_file_size_bytes", 8)
    token = register_and_login()

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("scan.png", b"\x89PNG\r\n\x1a\nscan-data", "image/png"))],
    )

    assert response.status_code == 413
    assert error_code(response) == "upload_file_too_large"
    assert not list(tmp_path.iterdir())


def test_upload_rejects_empty_file(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("empty.png", b"", "image/png"))],
    )

    assert response.status_code == 415
    assert error_code(response) == "upload_empty_file"
    assert not list(tmp_path.iterdir())


def test_upload_rejects_invalid_jpeg_signature(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("scan.jpg", b"not-a-jpeg", "image/jpeg"))],
    )

    assert response.status_code == 415
    assert error_code(response) == "upload_invalid_jpeg_signature"
    assert not list(tmp_path.iterdir())


def test_upload_rejects_dicom_missing_preamble_marker(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("scan.dcm", b"not-a-dicom", "application/dicom"))],
    )

    assert response.status_code == 422
    assert error_code(response) == "dicom_missing_marker"
    assert not list(tmp_path.iterdir())


def test_upload_rejects_dicom_missing_required_metadata(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("scan.dcm", create_test_dicom(include_patient_id=False), "application/dicom"))],
    )

    assert response.status_code == 422
    assert error_code(response) == "dicom_missing_required_metadata"
    assert response.json()["detail"]["metadata"] == "PatientID"
    assert not list(tmp_path.iterdir())


def test_upload_rejects_corrupted_dicom_payload(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()
    corrupted_dicom = (b"\0" * 128) + b"DICM" + b"broken"

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("scan.dcm", corrupted_dicom, "application/dicom"))],
    )

    assert response.status_code == 422
    assert error_code(response) == "dicom_corrupted"
    assert not list(tmp_path.iterdir())


def test_upload_logs_validation_failures_without_sensitive_values(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("scan.dcm", create_test_dicom(include_modality=False), "application/dicom"))],
    )

    assert response.status_code == 422
    with SessionLocal() as db:
        rows = db.scalars(select(AuditLog).where(AuditLog.action == "validation_failed")).all()

    assert rows
    assert "PATIENT-001" not in str(rows)
    assert "scan.dcm" not in str(rows)


def test_upload_returns_controlled_storage_error(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()

    def fail_storage(_content: bytes, _extension: str):
        raise OSError("disk path leaked in server error")

    monkeypatch.setattr("app.api.uploads.encrypt_and_store_upload", fail_storage)

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("scan.png", b"\x89PNG\r\n\x1a\nscan-data", "image/png"))],
    )

    assert response.status_code == 500
    assert error_code(response) == "upload_storage_failed"
    assert "disk path" not in str(response.json())

    with SessionLocal() as db:
        rows = db.scalars(select(AuditLog).where(AuditLog.action == "upload_storage_failed")).all()

    assert rows
    assert "scan.png" not in str(rows)


def test_admin_can_reidentify_anonymized_patient(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()
    admin_token = register_and_login_admin()

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("scan.dcm", create_test_dicom(), "application/dicom"))],
    )

    assert response.status_code == 201
    with SessionLocal() as db:
        image_id = response.json()["images"][0]["id"]
        mapping = db.scalar(select(PatientIdentityMap).where(PatientIdentityMap.medical_image_id == image_id))
        assert mapping is not None
        anonymous_patient_id = mapping.anonymous_patient_id

    reidentify = client.get(
        f"/patient-identities/{anonymous_patient_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert reidentify.status_code == 200
    assert reidentify.json()["anonymous_patient_id"] == anonymous_patient_id
    assert reidentify.json()["original_patient_id"] == "PATIENT-001"

    audit_logs = client.get("/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert any(item["action"] == "patient_reidentified" for item in audit_logs.json())


def test_non_admin_cannot_reidentify_patient(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = register_and_login()

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("scan.dcm", create_test_dicom(), "application/dicom"))],
    )

    assert response.status_code == 201
    with SessionLocal() as db:
        image_id = response.json()["images"][0]["id"]
        mapping = db.scalar(select(PatientIdentityMap).where(PatientIdentityMap.medical_image_id == image_id))
        assert mapping is not None
        anonymous_patient_id = mapping.anonymous_patient_id

    reidentify = client.get(
        f"/patient-identities/{anonymous_patient_id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert reidentify.status_code == 403
