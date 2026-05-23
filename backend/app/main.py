import logging

from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text

from app.api import audit_logs, auth, dashboard, health, history, notifications, patient_identities, report, results, uploads
from app.core.config import settings
from app.core.logging_config import RequestLoggingMiddleware, configure_logging
from app.db.base import Base
from app.db.session import engine

configure_logging(settings.log_level, settings.log_file_path)
logger = logging.getLogger(__name__)


def ensure_runtime_schema() -> None:
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return
    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "notifications_enabled" in user_columns:
        return

    default_value = "true" if engine.dialect.name == "postgresql" else "1"
    with engine.begin() as connection:
        connection.execute(text(f"ALTER TABLE users ADD COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT {default_value}"))


def create_app() -> FastAPI:
    ensure_runtime_schema()

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
    application.add_middleware(RequestLoggingMiddleware)

    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled API error on %s %s", request.method, request.url.path, exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={
                "detail": {
                    "code": "internal_server_error",
                    "message": "Unexpected server error",
                    "message_fr": "Erreur serveur inattendue.",
                    "suggestion_fr": "Veuillez reessayer. Si le probleme persiste, contactez l'administrateur.",
                }
            },
        )

    application.include_router(health.router)
    application.include_router(auth.router, prefix="/auth", tags=["auth"])
    application.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit"])
    application.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
    application.include_router(history.router, prefix="/history", tags=["history"])
    application.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
    application.include_router(patient_identities.router, prefix="/patient-identities", tags=["patient-identities"])
    application.include_router(report.router, prefix="/report", tags=["report"])
    application.include_router(results.router, prefix="/results", tags=["results"])
    application.include_router(uploads.router, prefix="/upload", tags=["uploads"])
    return application


app = create_app()
