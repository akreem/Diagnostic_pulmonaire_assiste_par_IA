from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.medical_image import MedicalImage
from app.models.notification import Notification
from app.models.analysis_history import AnalysisHistory

client = TestClient(app)


def register_and_login() -> str:
    # Register admin user
    client.post(
        "/auth/register",
        json={
            "email": "admin-e2e@example.com",
            "full_name": "Admin E2E",
            "password": "StrongPass123",
            "role": "admin",
        },
    )
    # Login admin user
    admin_login = client.post(
        "/auth/login",
        json={"email": "admin-e2e@example.com", "password": "StrongPass123"},
    )
    admin_token = admin_login.json()["access_token"]
    
    # Register doctor user via admin
    client.post(
        "/auth/register",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "doctor-e2e@example.com",
            "full_name": "Dr E2E",
            "password": "StrongPass123",
            "role": "doctor",
        },
    )
    # Login doctor user
    doctor_login = client.post(
        "/auth/login",
        json={"email": "doctor-e2e@example.com", "password": "StrongPass123"},
    )
    return doctor_login.json()["access_token"]


def test_e2e_upload_and_ai_inference():
    # 1. Obtain authenticated token for E2E user
    token = register_and_login()
    
    # 2. Locate and load real test image
    image_path = Path("/app/tests/person1_virus_9.jpeg")
    assert image_path.exists(), "The integration test image person1_virus_9.jpeg must exist in /app/tests/"
    image_bytes = image_path.read_bytes()
    
    # 3. Perform file upload
    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=[("files", ("person1_virus_9.jpeg", image_bytes, "image/jpeg"))],
    )
    
    # 4. Assert response payload details
    assert response.status_code == 201
    payload = response.json()
    assert "images" in payload
    assert len(payload["images"]) == 1
    
    uploaded_image = payload["images"][0]
    assert uploaded_image["original_filename"] == "person1_virus_9.jpeg"
    assert uploaded_image["status"] == "analyzed"
    assert uploaded_image["ai_analysis_status"] == "completed"
    assert uploaded_image["ai_error_message"] is None
    assert uploaded_image["ai_prediction"] in ("PNEUMONIA", "NORMAL")
    assert uploaded_image["ai_confidence"] is not None
    assert 0.0 <= uploaded_image["ai_confidence"] <= 1.0
    assert uploaded_image["ai_latency_ms"] is not None
    assert uploaded_image["ai_gradcam_path"] is not None
    
    image_id = uploaded_image["id"]
    
    # 5. Query DB models to confirm proper persistence
    with SessionLocal() as db:
        image_db = db.get(MedicalImage, image_id)
        assert image_db is not None
        assert image_db.ai_prediction == uploaded_image["ai_prediction"]
        
        history_db = db.query(AnalysisHistory).filter(AnalysisHistory.medical_image_id == image_id).first()
        assert history_db is not None
        assert history_db.analysis_status.value == "completed"
        assert history_db.prediction == uploaded_image["ai_prediction"]
        assert history_db.confidence == uploaded_image["ai_confidence"]
        assert history_db.gradcam_path == uploaded_image["ai_gradcam_path"]
        
        # Pneumonia trigger logic check
        if uploaded_image["ai_prediction"] == "PNEUMONIA" and uploaded_image["ai_confidence"] >= 0.76:
            notification = db.query(Notification).filter(Notification.resource_id == str(image_id)).first()
            assert notification is not None
            assert notification.category == "critical"
            
    # 6. Verify image and heatmap decryption download flows
    img_retrieval = client.get(
        f"/upload/{image_id}/image",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert img_retrieval.status_code == 200
    assert img_retrieval.headers["content-type"] == "image/jpeg"
    assert len(img_retrieval.content) == len(image_bytes)
    
    heatmap_retrieval = client.get(
        f"/upload/{image_id}/gradcam",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert heatmap_retrieval.status_code == 200
    assert heatmap_retrieval.headers["content-type"] == "image/png"
    assert len(heatmap_retrieval.content) > 0
    
    # 7. Verify PDF report generation layout
    report_retrieval = client.get(
        f"/report/{image_id}/pdf",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert report_retrieval.status_code == 200
    assert report_retrieval.headers["content-type"] == "application/pdf"
    assert len(report_retrieval.content) > 0
