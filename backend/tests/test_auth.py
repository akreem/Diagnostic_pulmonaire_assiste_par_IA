from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def create_admin_token(email: str = "admin@example.com") -> str:
    client.post(
        "/auth/register",
        json={
            "email": email,
            "full_name": "Admin Example",
            "password": "StrongPass123",
            "role": "admin",
        },
    )
    login = client.post("/auth/login", json={"email": email, "password": "StrongPass123"})
    return login.json()["access_token"]


def test_setup_status_and_first_admin_registration():
    setup_status = client.get("/auth/setup-status")
    assert setup_status.status_code == 200
    assert setup_status.json() == {"has_admin": False}

    registration = client.post(
        "/auth/register",
        json={
            "email": "admin@example.com",
            "full_name": "Admin Example",
            "password": "StrongPass123",
            "role": "admin",
        },
    )
    assert registration.status_code == 201
    assert registration.json()["role"] == "admin"

    setup_status = client.get("/auth/setup-status")
    assert setup_status.json() == {"has_admin": True}


def test_first_public_registration_must_be_admin():
    registration = client.post(
        "/auth/register",
        json={
            "email": "doctor@example.com",
            "full_name": "Dr Example",
            "password": "StrongPass123",
            "role": "doctor",
        },
    )
    assert registration.status_code == 403


def test_admin_can_register_user_then_user_can_login():
    admin_token = create_admin_token()
    registration = client.post(
        "/auth/register",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "doctor@example.com",
            "full_name": "Dr Example",
            "password": "StrongPass123",
            "role": "doctor",
        },
    )
    assert registration.status_code == 201

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


def test_admin_can_list_users():
    admin_token = create_admin_token()
    client.post(
        "/auth/register",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "doctor@example.com",
            "full_name": "Dr Example",
            "password": "StrongPass123",
            "role": "doctor",
        },
    )

    response = client.get("/auth/users", headers={"Authorization": f"Bearer {admin_token}"})

    assert response.status_code == 200
    assert [user["email"] for user in response.json()] == ["doctor@example.com", "admin@example.com"]


def test_non_admin_cannot_list_users():
    admin_token = create_admin_token()
    client.post(
        "/auth/register",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "doctor@example.com",
            "full_name": "Dr Example",
            "password": "StrongPass123",
            "role": "doctor",
        },
    )
    login = client.post("/auth/login", json={"email": "doctor@example.com", "password": "StrongPass123"})

    response = client.get("/auth/users", headers={"Authorization": f"Bearer {login.json()['access_token']}"})

    assert response.status_code == 403


def test_public_registration_closes_after_admin_exists():
    create_admin_token()

    registration = client.post(
        "/auth/register",
        json={
            "email": "doctor@example.com",
            "full_name": "Dr Example",
            "password": "StrongPass123",
            "role": "doctor",
        },
    )
    assert registration.status_code == 401


def test_login_failure_is_rejected():
    response = client.post(
        "/auth/login",
        json={"email": "missing@example.com", "password": "WrongPassword123"},
    )
    assert response.status_code == 401
