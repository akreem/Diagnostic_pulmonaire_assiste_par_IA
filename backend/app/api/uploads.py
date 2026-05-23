import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.analysis_history import AnalysisHistory, AnalysisHistoryStatus
from app.models.medical_image import MedicalImage, MedicalImageStatus
from app.models.notification import Notification
from app.models.patient_identity_map import PatientIdentityMap
from app.models.user import User
from app.schemas.upload import UploadBatchResponse
from app.api.dashboard import dashboard_stats_cache_key
from app.services.audit import write_audit_log
from app.services.cache import cache_client
from app.services.crypto import encrypt_text
from app.services.dicom_anonymization import DicomAnonymizationResult, anonymize_dicom_content
from app.services.medical_file_validation import MedicalFileValidationError, validate_medical_file_content
from app.services.upload_errors import UploadErrorCode, UploadValidationError, upload_error_detail
from app.services.upload_storage import encrypt_and_store_upload, validate_upload_file

router = APIRouter()
logger = logging.getLogger(__name__)


def analysis_severity(prediction: str | None, confidence: float | None, is_ambiguous: bool) -> str | None:
    if not prediction:
        return None
    if prediction == "PNEUMONIA" and (confidence or 0) >= 0.76:
        return "critical"
    if prediction == "PNEUMONIA" or is_ambiguous:
        return "suspect"
    return "normal"


@router.post("", response_model=UploadBatchResponse, status_code=status.HTTP_201_CREATED)
async def upload_medical_images(
    request: Request,
    files: list[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UploadBatchResponse:
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=upload_error_detail(UploadErrorCode.no_files))

    prepared_files: list[tuple[UploadFile, bytes, str, str, DicomAnonymizationResult | None]] = []
    for upload in files:
        content = await upload.read()
        try:
            safe_name, extension = validate_upload_file(upload.filename or "upload", upload.content_type, content)
        except UploadValidationError as exc:
            status_code = (
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                if exc.code == UploadErrorCode.file_too_large
                else status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
            )
            write_audit_log(
                db,
                request,
                action="upload_rejected",
                resource_type="medical_image",
                actor_user_id=current_user.id,
                metadata={"reason": exc.code.value, "content_type": upload.content_type},
            )
            raise HTTPException(status_code=status_code, detail=upload_error_detail(exc.code)) from exc
        try:
            validate_medical_file_content(extension, content)
        except MedicalFileValidationError as exc:
            detail = upload_error_detail(exc.code)
            if exc.extra:
                detail["metadata"] = exc.extra
            write_audit_log(
                db,
                request,
                action="validation_failed",
                resource_type="medical_image",
                actor_user_id=current_user.id,
                metadata={
                    "reason": exc.code.value,
                    "content_type": upload.content_type,
                },
            )
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail) from exc

        anonymization_result = anonymize_dicom_content(content) if extension == ".dcm" else None
        content_for_storage = anonymization_result.content if anonymization_result else content
        prepared_files.append((upload, content_for_storage, safe_name, extension, anonymization_result))

    from app.services.ai_client import ai_client, AIServiceError

    images: list[MedicalImage] = []
    patient_mappings: list[tuple[MedicalImage, DicomAnonymizationResult]] = []
    try:
        for upload, content, safe_name, extension, anonymization_result in prepared_files:
            stored = encrypt_and_store_upload(content, extension)
            
            # Call AI Model
            ai_prediction = None
            ai_confidence = None
            ai_latency_ms = None
            ai_gradcam_path = None
            ai_error_message = None
            is_ambiguous = False
            
            # Because files are encrypted at rest, we must send the unencrypted raw `content`
            # directly to the AI service rather than pointing it to the encrypted storage_path.
            try:
                ai_result = await ai_client.predict(safe_name, content)
                ai_prediction = ai_result.get("prediction")
                ai_confidence = ai_result.get("confidence")
                ai_latency_ms = ai_result.get("latency_ms")
                # Threshold for ambiguous logic (e.g. confidence < 0.6)
                if ai_confidence and ai_confidence < 0.60:
                    is_ambiguous = True

                # Call Grad-CAM for explainability
                try:
                    gradcam_result = await ai_client.get_gradcam(safe_name, content)
                    gradcam_b64 = gradcam_result.get("gradcam_base64")
                    if gradcam_b64:
                        import base64
                        gradcam_bytes = base64.b64decode(gradcam_b64)
                        stored_gradcam = encrypt_and_store_upload(gradcam_bytes, ".png")
                        ai_gradcam_path = stored_gradcam.storage_path
                except Exception as e:
                    logger.exception("Grad-CAM generation failed for %s", safe_name)

            except AIServiceError as e:
                ai_error_message = str(e)
                # Log the error but don't fail the upload completely
                write_audit_log(
                    db,
                    request,
                    action="ai_prediction_failed",
                    resource_type="medical_image",
                    actor_user_id=current_user.id,
                    metadata={"error": str(e)}
                )

            image = MedicalImage(
                owner_user_id=current_user.id,
                original_filename=safe_name,
                stored_filename=stored.stored_filename,
                storage_path=stored.storage_path,
                content_type=upload.content_type or "application/octet-stream",
                file_extension=extension,
                file_size_bytes=len(content),
                encrypted_size_bytes=stored.encrypted_size_bytes,
                checksum_sha256=stored.checksum_sha256,
                status=MedicalImageStatus.analyzed if ai_prediction else (MedicalImageStatus.anonymized if anonymization_result else MedicalImageStatus.validated),
                ai_prediction=ai_prediction,
                ai_confidence=ai_confidence,
                ai_latency_ms=ai_latency_ms,
                ai_gradcam_path=ai_gradcam_path,
                is_ambiguous=is_ambiguous
            )
            image._ai_error_message = ai_error_message
            db.add(image)
            images.append(image)
            if anonymization_result:
                patient_mappings.append((image, anonymization_result))

        db.flush()
        for image in images:
            ai_error_message = getattr(image, "_ai_error_message", None)
            severity = analysis_severity(image.ai_prediction, image.ai_confidence, image.is_ambiguous)
            analysis_status = (
                AnalysisHistoryStatus.failed
                if ai_error_message
                else AnalysisHistoryStatus.completed
                if image.ai_prediction
                else AnalysisHistoryStatus.pending
            )
            db.add(
                AnalysisHistory(
                    owner_user_id=current_user.id,
                    medical_image_id=image.id,
                    original_filename=image.original_filename,
                    analysis_status=analysis_status,
                    prediction=image.ai_prediction,
                    confidence=image.ai_confidence,
                    latency_ms=image.ai_latency_ms,
                    severity=severity,
                    is_ambiguous=image.is_ambiguous,
                    error_message=ai_error_message,
                    gradcam_path=image.ai_gradcam_path,
                    completed_at=datetime.now(timezone.utc) if analysis_status != AnalysisHistoryStatus.pending else None,
                )
            )
            if severity == "critical" and current_user.notifications_enabled:
                confidence_percent = round((image.ai_confidence or 0) * 100)
                db.add(
                    Notification(
                        owner_user_id=current_user.id,
                        title="Cas critique detecte",
                        message=f"{image.original_filename} presente une suspicion de pneumonie avec {confidence_percent}% de confiance.",
                        category="critical",
                        resource_type="medical_image",
                        resource_id=str(image.id),
                    )
                )
        for image, anonymization_result in patient_mappings:
            db.add(
                PatientIdentityMap(
                    medical_image_id=image.id,
                    created_by_user_id=current_user.id,
                    anonymous_patient_id=anonymization_result.anonymous_patient_id,
                    encrypted_original_patient_id=encrypt_text(anonymization_result.original_patient_id),
                )
            )
        db.commit()
        cache_client.delete(dashboard_stats_cache_key(current_user.id))
    except Exception as exc:
        db.rollback()
        write_audit_log(
            db,
            request,
            action="upload_storage_failed",
            resource_type="medical_image",
            actor_user_id=current_user.id,
            metadata={"reason": UploadErrorCode.storage_failed.value},
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=upload_error_detail(UploadErrorCode.storage_failed),
        ) from exc

    for image in images:
        ai_error_message = getattr(image, "_ai_error_message", None)
        db.refresh(image)
        image._ai_error_message = ai_error_message
        write_audit_log(
            db,
            request,
            action="upload_success",
            resource_type="medical_image",
            actor_user_id=current_user.id,
            resource_id=str(image.id),
            metadata={
                "content_type": image.content_type,
                "size_bytes": image.file_size_bytes,
            },
        )
        if image.status == MedicalImageStatus.anonymized or image.status == MedicalImageStatus.analyzed:
            write_audit_log(
                db,
                request,
                action="dicom_anonymized",
                resource_type="medical_image",
                actor_user_id=current_user.id,
                resource_id=str(image.id),
                metadata={"content_type": image.content_type},
            )

    return UploadBatchResponse(images=images)


from fastapi.responses import Response


@router.get("/{image_id}/image", response_class=Response)
async def get_medical_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image = db.query(MedicalImage).filter(
        MedicalImage.id == image_id,
        MedicalImage.owner_user_id == current_user.id,
    ).first()

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        from app.services.upload_storage import read_encrypted_upload

        image_bytes = read_encrypted_upload(image.storage_path)
        return Response(content=image_bytes, media_type=image.content_type)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read encrypted image")


@router.get("/{image_id}/gradcam", response_class=Response)
async def get_gradcam_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image = db.query(MedicalImage).filter(
        MedicalImage.id == image_id,
        MedicalImage.owner_user_id == current_user.id
    ).first()
    
    if not image or not image.ai_gradcam_path:
        raise HTTPException(status_code=404, detail="Grad-CAM not found")
        
    try:
        from app.services.upload_storage import read_encrypted_upload
        img_bytes = read_encrypted_upload(image.ai_gradcam_path)
        return Response(content=img_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to read encrypted heatmap")
