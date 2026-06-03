from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_consent
from app.db.session import get_db
from app.models.medical_image import MedicalImage
from app.models.user import User
from app.services.report_pdf import generate_report_pdf
from app.services.upload_storage import read_encrypted_upload

router = APIRouter()


@router.get("/{image_id}/pdf")
def download_report_pdf(
    image_id: int,
    current_user: User = Depends(require_consent),
    db: Session = Depends(get_db),
) -> Response:
    image = db.scalar(
        select(MedicalImage).where(
            MedicalImage.id == image_id,
            MedicalImage.owner_user_id == current_user.id,
        )
    )
    if image is None:
        raise HTTPException(status_code=404, detail="Report not found")

    source_image = None
    heatmap_image = None
    try:
        source_image = read_encrypted_upload(image.storage_path)
    except Exception:
        source_image = None
    if image.ai_gradcam_path:
        try:
            heatmap_image = read_encrypted_upload(image.ai_gradcam_path)
        except Exception:
            heatmap_image = None

    pdf = generate_report_pdf(image, current_user, source_image=source_image, heatmap_image=heatmap_image)
    filename = f"analysis-report-{image.id}.pdf"
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
