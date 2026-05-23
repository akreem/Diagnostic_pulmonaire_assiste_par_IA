import json
import logging
import sys
import time
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler
from pathlib import Path
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class JsonLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, object] = {
            "timestamp": datetime.fromtimestamp(record.created, timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key in (
            "request_id",
            "method",
            "path",
            "status_code",
            "duration_ms",
            "client",
            "user_agent",
        ):
            if hasattr(record, key):
                payload[key] = getattr(record, key)
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def configure_logging(level: str, log_file_path: str | None = None) -> None:
    root_logger = logging.getLogger()
    configured = getattr(configure_logging, "_configured", False)
    if configured:
        root_logger.setLevel(level.upper())
        return

    formatter = JsonLogFormatter()
    root_logger.handlers.clear()
    root_logger.setLevel(level.upper())

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)
    root_logger.addHandler(stream_handler)

    if log_file_path:
        path = Path(log_file_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = RotatingFileHandler(path, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8")
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)

    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(logger_name)
        logger.handlers.clear()
        logger.propagate = True

    logging.captureWarnings(True)
    setattr(configure_logging, "_configured", True)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    logger = logging.getLogger("app.request")

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", uuid4().hex)
        started_at = time.perf_counter()
        extra = {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
        }

        try:
            response = await call_next(request)
        except Exception:
            duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
            self.logger.exception("http_request_failed", extra={**extra, "duration_ms": duration_ms})
            raise

        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        response.headers["X-Request-ID"] = request_id
        self.logger.info(
            "http_request",
            extra={**extra, "status_code": response.status_code, "duration_ms": duration_ms},
        )
        return response
