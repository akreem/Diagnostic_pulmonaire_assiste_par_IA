from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.db.session import SessionLocal
from app.main import app
from app.models.medical_image import MedicalImage, MedicalImageStatus

client = TestClient(app)


def create_token(email: str = "stats@example.com") -> str:
    client.post(
        "/auth/register",
        json={
            "email": email,
            "full_name": "Dr Stats",
            "password": "StrongPass123",
            "role": "admin",
        },
    )
    response = client.post("/auth/login", json={"email": email, "password": "StrongPass123"})
    return response.json()["access_token"]


def add_image(owner_user_id: int, filename: str, **overrides) -> MedicalImage:
    defaults = {
        "owner_user_id": owner_user_id,
        "original_filename": filename,
        "stored_filename": f"{filename}.enc",
        "storage_path": f"storage/uploads/{filename}.enc",
        "content_type": "image/png",
        "file_extension": ".png",
        "file_size_bytes": 128,
        "encrypted_size_bytes": 192,
        "checksum_sha256": filename.rjust(64, "0")[-64:],
        "status": MedicalImageStatus.analyzed,
        "created_at": datetime.now(timezone.utc),
    }
    defaults.update(overrides)
    image = MedicalImage(**defaults)
    with SessionLocal() as db:
        db.add(image)
        db.commit()
        db.refresh(image)
        return image


def test_dashboard_stats_summarizes_current_user_images():
    token = create_token()
    current_user = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    now = datetime.now(timezone.utc)

    add_image(
        current_user["id"],
        "normal.png",
        ai_prediction="NORMAL",
        ai_confidence=0.91,
        ai_latency_ms=120.0,
        created_at=now,
    )
    add_image(
        current_user["id"],
        "critical.png",
        ai_prediction="PNEUMONIA",
        ai_confidence=0.88,
        ai_latency_ms=180.0,
        created_at=now + timedelta(minutes=1),
    )
    add_image(
        current_user["id"],
        "pending.png",
        status=MedicalImageStatus.validated,
        ai_prediction=None,
        ai_confidence=None,
        created_at=now - timedelta(minutes=1),
    )

    response = client.get("/dashboard/stats", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["total_exams"] == 3
    assert payload["analyzed_count"] == 2
    assert payload["normal_count"] == 1
    assert payload["critical_count"] == 1
    assert payload["pending_count"] == 1
    assert payload["average_confidence"] == 0.895
    assert payload["average_latency_ms"] == 150.0
    assert payload["recent_analyses"][0]["original_filename"] == "critical.png"
