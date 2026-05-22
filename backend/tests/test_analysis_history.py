from datetime import datetime, timezone

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.analysis_history import AnalysisHistory, AnalysisHistoryStatus
from app.models.medical_image import MedicalImage, MedicalImageStatus
from app.models.user import User, UserRole


def test_analysis_history_model_persists_result_metadata():
    with SessionLocal() as db:
        user = User(
            email="history@example.com",
            full_name="Dr History",
            password_hash="hashed",
            role=UserRole.doctor,
        )
        db.add(user)
        db.flush()

        image = MedicalImage(
            owner_user_id=user.id,
            original_filename="history.png",
            stored_filename="history.png.enc",
            storage_path="storage/uploads/history.png.enc",
            content_type="image/png",
            file_extension=".png",
            file_size_bytes=128,
            encrypted_size_bytes=192,
            checksum_sha256="h".rjust(64, "0"),
            status=MedicalImageStatus.analyzed,
        )
        db.add(image)
        db.flush()

        completed_at = datetime.now(timezone.utc)
        history = AnalysisHistory(
            owner_user_id=user.id,
            medical_image_id=image.id,
            original_filename=image.original_filename,
            analysis_status=AnalysisHistoryStatus.completed,
            prediction="PNEUMONIA",
            confidence=0.87,
            latency_ms=132.5,
            severity="critical",
            is_ambiguous=False,
            gradcam_path="storage/uploads/history-gradcam.png.enc",
            completed_at=completed_at,
        )
        db.add(history)
        db.commit()

        saved = db.scalar(select(AnalysisHistory).where(AnalysisHistory.medical_image_id == image.id))

    assert saved is not None
    assert saved.analysis_status == AnalysisHistoryStatus.completed
    assert saved.prediction == "PNEUMONIA"
    assert saved.confidence == 0.87
    assert saved.severity == "critical"
