from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_login_me_and_logout_flow():
    registration = client.post(
        "/auth/register",
        json={
            "email": "doctor@example.com",
            "full_name": "Dr Example",
            "password": "StrongPass123",
            "role": "doctor",
        },
    )
    assert registration.status_code == 201
    assert registration.json()["email"] == "doctor@example.com"

    login = client.post(
        "/auth/login",
        json={"email": "doctor@example.com", "password": "StrongPass123"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["role"] == "doctor"

    logout = client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout.status_code == 200
    assert logout.json()["status"] == "logged_out"


def test_login_failure_is_rejected():
    response = client.post(
        "/auth/login",
        json={"email": "missing@example.com", "password": "WrongPassword123"},
    )
    assert response.status_code == 401

