import zlib
from io import BytesIO
from binascii import crc32

from fastapi.testclient import TestClient
from pydicom.dataset import FileDataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, SecondaryCaptureImageStorage, generate_uid

from app.core.config import settings
from app.db.session import SessionLocal
from app.main import app
from app.models.medical_image import MedicalImage, MedicalImageStatus
from app.services.report_pdf import _bytes_to_pdf_image
from app.services.upload_storage import encrypt_and_store_upload

client = TestClient(app)


def create_admin_token(email: str) -> str:
    client.post(
        "/auth/register",
        json={
            "email": email,
            "full_name": "Dr Report",
            "password": "StrongPass123",
            "role": "admin",
        },
    )
    response = client.post("/auth/login", json={"email": email, "password": "StrongPass123"})
    return response.json()["access_token"]


def create_user_token(admin_token: str, email: str) -> str:
    client.post(
        "/auth/register",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": email,
            "full_name": "Dr Other",
            "password": "StrongPass123",
            "role": "doctor",
        },
    )
    response = client.post("/auth/login", json={"email": email, "password": "StrongPass123"})
    return response.json()["access_token"]


def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    crc = crc32(chunk_type + data) & 0xFFFFFFFF
    return len(data).to_bytes(4, "big") + chunk_type + data + crc.to_bytes(4, "big")


def tiny_rgb_png() -> bytes:
    ihdr = (1).to_bytes(4, "big") + (1).to_bytes(4, "big") + bytes([8, 2, 0, 0, 0])
    idat = zlib.compress(b"\x00\xff\x00\x00")
    return b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", idat) + png_chunk(b"IEND", b"")


def tiny_jpeg_header(components: int) -> bytes:
    component_specs = b"".join(bytes([index + 1, 0x11, 0]) for index in range(components))
    segment_length = 8 + (3 * components)
    sof = (
        b"\xff\xc0"
        + segment_length.to_bytes(2, "big")
        + bytes([8])
        + (2).to_bytes(2, "big")
        + (2).to_bytes(2, "big")
        + bytes([components])
        + component_specs
    )
    return b"\xff\xd8" + sof + b"\xff\xd9"


def tiny_dicom() -> bytes:
    file_meta = FileMetaDataset()
    file_meta.MediaStorageSOPClassUID = SecondaryCaptureImageStorage
    file_meta.MediaStorageSOPInstanceUID = generate_uid()
    file_meta.TransferSyntaxUID = ExplicitVRLittleEndian

    dataset = FileDataset("report.dcm", {}, file_meta=file_meta, preamble=b"\0" * 128)
    dataset.SOPClassUID = file_meta.MediaStorageSOPClassUID
    dataset.SOPInstanceUID = file_meta.MediaStorageSOPInstanceUID
    dataset.Modality = "CR"
    dataset.PatientID = "ANON"
    dataset.Rows = 2
    dataset.Columns = 2
    dataset.SamplesPerPixel = 1
    dataset.PhotometricInterpretation = "MONOCHROME2"
    dataset.BitsAllocated = 8
    dataset.BitsStored = 8
    dataset.HighBit = 7
    dataset.PixelRepresentation = 0
    dataset.PixelData = bytes([0, 80, 160, 255])

    buffer = BytesIO()
    dataset.save_as(buffer, write_like_original=False)
    return buffer.getvalue()


def add_image(owner_user_id: int) -> MedicalImage:
    stored_source = encrypt_and_store_upload(tiny_dicom(), ".dcm")
    stored_heatmap = encrypt_and_store_upload(tiny_rgb_png(), ".png")
    image = MedicalImage(
        owner_user_id=owner_user_id,
        original_filename="report.dcm",
        stored_filename=stored_source.stored_filename,
        storage_path=stored_source.storage_path,
        content_type="application/dicom",
        file_extension=".dcm",
        file_size_bytes=stored_source.encrypted_size_bytes,
        encrypted_size_bytes=stored_source.encrypted_size_bytes,
        checksum_sha256=str(owner_user_id).rjust(64, "0"),
        status=MedicalImageStatus.analyzed,
        ai_prediction="PNEUMONIA",
        ai_confidence=0.86,
        ai_latency_ms=142.0,
        ai_gradcam_path=stored_heatmap.storage_path,
    )
    with SessionLocal() as db:
        db.add(image)
        db.commit()
        db.refresh(image)
        return image


def test_user_can_download_own_pdf_report(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    token = create_admin_token("report-owner@example.com")
    user = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    image = add_image(user["id"])

    response = client.get(f"/report/{image.id}/pdf", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment" in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF-1.4")
    assert b"PulmoDiag AI" in response.content
    assert response.content.count(b"/Subtype /Image") == 2
    assert b"/ImSource" in response.content
    assert b"/ImHeatmap" in response.content
    assert b"(Image source) Tj" in response.content
    assert b"(Heatmap Grad-CAM) Tj" in response.content
    assert b"PulmoDiag AI | Rapport confidentiel | Page 1/1" in response.content


def test_user_cannot_download_another_users_pdf_report(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_storage_dir", str(tmp_path))
    owner_token = create_admin_token("report-owner-2@example.com")
    other_token = create_user_token(owner_token, "report-other@example.com")
    owner = client.get("/auth/me", headers={"Authorization": f"Bearer {owner_token}"}).json()
    image = add_image(owner["id"])

    response = client.get(f"/report/{image.id}/pdf", headers={"Authorization": f"Bearer {other_token}"})

    assert response.status_code == 404


def test_pdf_jpeg_sources_keep_matching_color_space():
    grayscale = _bytes_to_pdf_image("Gray", tiny_jpeg_header(1))
    rgb = _bytes_to_pdf_image("Rgb", tiny_jpeg_header(3))
    cmyk = _bytes_to_pdf_image("Cmyk", tiny_jpeg_header(4))

    assert grayscale is not None
    assert grayscale.color_space == "/DeviceGray"
    assert rgb is not None
    assert rgb.color_space == "/DeviceRGB"
    assert cmyk is not None
    assert cmyk.color_space == "/DeviceCMYK"
    assert cmyk.decode == "[1 0 1 0 1 0 1 0]"
