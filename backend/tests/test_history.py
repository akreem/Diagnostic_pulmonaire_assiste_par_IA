from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.db.session import SessionLocal
from app.main import app
from app.models.analysis_history import AnalysisHistory, AnalysisHistoryStatus
from app.models.medical_image import MedicalImage, MedicalImageStatus

client = TestClient(app)


def create_admin_token(email: str = "history-admin@example.com") -> str:
    client.post(
        "/auth/register",
        json={
            "email": email,
            "full_name": "Dr History",
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
            "full_name": "Dr Filter",
            "password": "StrongPass123",
            "role": "doctor",
        },
    )
    response = client.post("/auth/login", json={"email": email, "password": "StrongPass123"})
    return response.json()["access_token"]


def add_history(owner_user_id: int, filename: str, **overrides) -> AnalysisHistory:
    with SessionLocal() as db:
        image = MedicalImage(
            owner_user_id=owner_user_id,
            original_filename=filename,
            stored_filename=f"{filename}.enc",
            storage_path=f"storage/uploads/{filename}.enc",
            content_type="image/png",
            file_extension=".png",
            file_size_bytes=128,
            encrypted_size_bytes=192,
            checksum_sha256=filename.rjust(64, "0")[-64:],
            status=MedicalImageStatus.analyzed,
        )
        db.add(image)
        db.flush()

        defaults = {
            "owner_user_id": owner_user_id,
            "medical_image_id": image.id,
            "original_filename": filename,
            "analysis_status": AnalysisHistoryStatus.completed,
            "prediction": "PNEUMONIA",
            "confidence": 0.84,
            "latency_ms": 130.0,
            "severity": "critical",
            "is_ambiguous": False,
            "created_at": datetime.now(timezone.utc),
            "completed_at": datetime.now(timezone.utc),
        }
        defaults.update(overrides)
        history = AnalysisHistory(**defaults)
        db.add(history)
        db.commit()
        db.refresh(history)
        return history


def test_history_endpoint_filters_current_user_results():
    token = create_admin_token()
    user = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    now = datetime.now(timezone.utc)

    matching = add_history(user["id"], "critical-case.png", created_at=now)
    add_history(
        user["id"],
        "normal-case.png",
        prediction="NORMAL",
        severity="normal",
        is_ambiguous=False,
        created_at=now - timedelta(days=1),
    )
    add_history(
        user["id"],
        "failed-case.png",
        analysis_status=AnalysisHistoryStatus.failed,
        prediction=None,
        severity=None,
        error_message="AI unavailable",
        created_at=now - timedelta(days=2),
    )

    response = client.get(
        "/history?status=completed&prediction=PNEUMONIA&severity=critical&search=critical",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["page"] == 1
    assert payload["page_size"] == 20
    assert [item["id"] for item in payload["items"]] == [matching.id]
    assert payload["items"][0]["original_filename"] == "critical-case.png"


def test_history_endpoint_does_not_return_other_users_records():
    admin_token = create_admin_token()
    other_token = create_user_token(admin_token, "history-other@example.com")
    admin_user = client.get("/auth/me", headers={"Authorization": f"Bearer {admin_token}"}).json()
    other_user = client.get("/auth/me", headers={"Authorization": f"Bearer {other_token}"}).json()

    add_history(admin_user["id"], "owner-case.png")
    add_history(other_user["id"], "other-case.png")

    response = client.get("/history", headers={"Authorization": f"Bearer {other_token}"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert len(payload["items"]) == 1
    assert payload["items"][0]["original_filename"] == "other-case.png"


def test_history_endpoint_paginates_on_server():
    token = create_admin_token()
    user = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    now = datetime.now(timezone.utc)

    for index in range(5):
        add_history(user["id"], f"page-{index}.png", created_at=now - timedelta(minutes=index))

    response = client.get("/history?page=2&page_size=2", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 5
    assert payload["page"] == 2
    assert payload["page_size"] == 2
    assert payload["total_pages"] == 3
    assert [item["original_filename"] for item in payload["items"]] == ["page-2.png", "page-3.png"]


def test_history_csv_export_respects_filters_and_user_scope():
    admin_token = create_admin_token()
    other_token = create_user_token(admin_token, "history-csv-other@example.com")
    admin_user = client.get("/auth/me", headers={"Authorization": f"Bearer {admin_token}"}).json()
    other_user = client.get("/auth/me", headers={"Authorization": f"Bearer {other_token}"}).json()

    add_history(admin_user["id"], "owner-critical.csv.png")
    add_history(admin_user["id"], "owner-normal.csv.png", prediction="NORMAL", severity="normal")
    add_history(other_user["id"], "other-critical.csv.png")

    response = client.get(
        "/history/export.csv?prediction=PNEUMONIA&severity=critical",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "attachment" in response.headers["content-disposition"]
    body = response.text
    assert "original_filename" in body
    assert "owner-critical.csv.png" in body
    assert "owner-normal.csv.png" not in body
    assert "other-critical.csv.png" not in body
