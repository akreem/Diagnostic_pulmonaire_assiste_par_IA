from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.medical_image import MedicalImage, MedicalImageStatus
from app.models.patient_identity_map import PatientIdentityMap
from app.models.user import User
from app.schemas.upload import UploadBatchResponse
from app.services.audit import write_audit_log
from app.services.crypto import encrypt_text
from app.services.dicom_anonymization import DicomAnonymizationResult, anonymize_dicom_content
from app.services.medical_file_validation import MedicalFileValidationError, validate_medical_file_content
from app.services.upload_errors import UploadErrorCode, UploadValidationError, upload_error_detail
from app.services.upload_storage import encrypt_and_store_upload, validate_upload_file

router = APIRouter()


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

    images: list[MedicalImage] = []
    patient_mappings: list[tuple[MedicalImage, DicomAnonymizationResult]] = []
    try:
        for upload, content, safe_name, extension, anonymization_result in prepared_files:
            stored = encrypt_and_store_upload(content, extension)
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
                status=MedicalImageStatus.anonymized if anonymization_result else MedicalImageStatus.validated,
            )
            db.add(image)
            images.append(image)
            if anonymization_result:
                patient_mappings.append((image, anonymization_result))

        db.flush()
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
        db.refresh(image)
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
        if image.status == MedicalImageStatus.anonymized:
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
