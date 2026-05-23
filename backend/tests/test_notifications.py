from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def create_admin_token(email: str = "notifications-admin@example.com") -> str:
    client.post(
        "/auth/register",
        json={
            "email": email,
            "full_name": "Dr Notify",
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
            "full_name": "Dr Recipient",
            "password": "StrongPass123",
            "role": "doctor",
        },
    )
    response = client.post("/auth/login", json={"email": email, "password": "StrongPass123"})
    return response.json()["access_token"]


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_user_can_create_and_list_own_notifications():
    token = create_admin_token()

    response = client.post(
        "/notifications",
        headers=auth_header(token),
        json={
            "title": "Analyse terminee",
            "message": "Le rapport PDF est disponible.",
            "category": "success",
            "resource_type": "medical_image",
            "resource_id": "42",
        },
    )

    assert response.status_code == 201
    created = response.json()
    assert created["title"] == "Analyse terminee"
    assert created["category"] == "success"
    assert created["is_read"] is False

    list_response = client.get("/notifications", headers=auth_header(token))

    assert list_response.status_code == 200
    items = list_response.json()
    assert len(items) == 1
    assert items[0]["id"] == created["id"]
    assert items[0]["resource_type"] == "medical_image"


def test_notifications_are_scoped_to_current_user():
    admin_token = create_admin_token()
    other_token = create_user_token(admin_token, "notifications-other@example.com")

    client.post(
        "/notifications",
        headers=auth_header(admin_token),
        json={"title": "Owner only", "message": "Visible only to owner"},
    )

    response = client.get("/notifications", headers=auth_header(other_token))

    assert response.status_code == 200
    assert response.json() == []


def test_admin_can_create_notification_for_recipient():
    admin_token = create_admin_token()
    recipient_token = create_user_token(admin_token, "notifications-recipient@example.com")
    recipient = client.get("/auth/me", headers=auth_header(recipient_token)).json()

    response = client.post(
        "/notifications",
        headers=auth_header(admin_token),
        json={
            "recipient_user_id": recipient["id"],
            "title": "Controle qualite",
            "message": "Une analyse requiert votre attention.",
            "category": "warning",
        },
    )

    assert response.status_code == 201
    assert response.json()["owner_user_id"] == recipient["id"]

    list_response = client.get("/notifications?unread_only=true", headers=auth_header(recipient_token))

    assert list_response.status_code == 200
    items = list_response.json()
    assert len(items) == 1
    assert items[0]["title"] == "Controle qualite"


def test_non_admin_cannot_create_notification_for_another_user():
    admin_token = create_admin_token()
    sender_token = create_user_token(admin_token, "notifications-sender@example.com")
    recipient_token = create_user_token(admin_token, "notifications-blocked-recipient@example.com")
    recipient = client.get("/auth/me", headers=auth_header(recipient_token)).json()

    response = client.post(
        "/notifications",
        headers=auth_header(sender_token),
        json={
            "recipient_user_id": recipient["id"],
            "title": "Blocked",
            "message": "This should not be delivered.",
        },
    )

    assert response.status_code == 403


def test_user_can_mark_notifications_read_and_unread():
    token = create_admin_token()
    create_response = client.post(
        "/notifications",
        headers=auth_header(token),
        json={"title": "A relire", "message": "Une analyse attend une relecture."},
    )
    notification_id = create_response.json()["id"]

    read_response = client.patch(f"/notifications/{notification_id}/read", headers=auth_header(token))

    assert read_response.status_code == 200
    assert read_response.json()["is_read"] is True
    assert read_response.json()["read_at"] is not None

    unread_response = client.patch(f"/notifications/{notification_id}/unread", headers=auth_header(token))

    assert unread_response.status_code == 200
    assert unread_response.json()["is_read"] is False
    assert unread_response.json()["read_at"] is None


def test_user_can_disable_notification_preference():
    token = create_admin_token()

    initial = client.get("/notifications/preferences", headers=auth_header(token))
    updated = client.put(
        "/notifications/preferences",
        headers=auth_header(token),
        json={"notifications_enabled": False},
    )

    assert initial.status_code == 200
    assert initial.json()["notifications_enabled"] is True
    assert updated.status_code == 200
    assert updated.json()["notifications_enabled"] is False
