from fastapi.testclient import TestClient

from app.db.session import SessionLocal
from app.main import app
from app.models.medical_image import MedicalImage, MedicalImageStatus

client = TestClient(app)


def create_admin_token(email: str) -> str:
    client.post(
        "/auth/register",
        json={
            "email": email,
            "full_name": "Dr Result",
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


def add_result(owner_user_id: int) -> MedicalImage:
    image = MedicalImage(
        owner_user_id=owner_user_id,
        original_filename="result.png",
        stored_filename=f"result-{owner_user_id}.png.enc",
        storage_path=f"storage/uploads/result-{owner_user_id}.png.enc",
        content_type="image/png",
        file_extension=".png",
        file_size_bytes=128,
        encrypted_size_bytes=192,
        checksum_sha256=str(owner_user_id).rjust(64, "0"),
        status=MedicalImageStatus.analyzed,
        ai_prediction="PNEUMONIA",
        ai_confidence=0.82,
        ai_latency_ms=140.0,
        is_ambiguous=False,
    )
    with SessionLocal() as db:
        db.add(image)
        db.commit()
        db.refresh(image)
        return image


def test_user_can_read_own_result_by_id():
    token = create_admin_token("result-owner@example.com")
    user = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    image = add_result(user["id"])

    response = client.get(f"/results/{image.id}", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == image.id
    assert payload["ai_prediction"] == "PNEUMONIA"
    assert payload["ai_confidence"] == 0.82


def test_user_cannot_read_another_users_result():
    owner_token = create_admin_token("result-owner-2@example.com")
    other_token = create_user_token(owner_token, "result-other@example.com")
    owner = client.get("/auth/me", headers={"Authorization": f"Bearer {owner_token}"}).json()
    image = add_result(owner["id"])

    response = client.get(f"/results/{image.id}", headers={"Authorization": f"Bearer {other_token}"})

    assert response.status_code == 404
