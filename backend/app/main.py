from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import audit_logs, auth, dashboard, health, history, patient_identities, results, uploads
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine


def create_app() -> FastAPI:
    Base.metadata.create_all(bind=engine)

    application = FastAPI(
        title="Pulmonary Diagnostic AI Platform API",
        version="0.1.0",
        description="Secure pulmonary diagnostic API with authentication, audit, and image upload workflows.",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(health.router)
    application.include_router(auth.router, prefix="/auth", tags=["auth"])
    application.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit"])
    application.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
    application.include_router(history.router, prefix="/history", tags=["history"])
    application.include_router(patient_identities.router, prefix="/patient-identities", tags=["patient-identities"])
    application.include_router(results.router, prefix="/results", tags=["results"])
    application.include_router(uploads.router, prefix="/upload", tags=["uploads"])
    return application


app = create_app()
