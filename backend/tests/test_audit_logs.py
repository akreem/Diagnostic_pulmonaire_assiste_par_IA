from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_admin_can_read_audit_logs():
    client.post(
        "/auth/register",
        json={
            "email": "admin@example.com",
            "full_name": "Admin Example",
            "password": "StrongPass123",
            "role": "admin",
        },
    )
    login = client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": "StrongPass123"},
    )
    token = login.json()["access_token"]

    response = client.get("/audit-logs", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert any(item["action"] == "login_success" for item in response.json())

