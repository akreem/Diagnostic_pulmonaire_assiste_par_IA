import json
import logging

from fastapi.testclient import TestClient

from app.core.logging_config import JsonLogFormatter
from app.main import app


@app.get("/__test__/unhandled-error")
def raise_unhandled_error():
    raise RuntimeError("boom")


def test_unhandled_api_errors_return_structured_payload():
    client = TestClient(app, raise_server_exceptions=False)

    response = client.get("/__test__/unhandled-error")

    assert response.status_code == 500
    assert response.json()["detail"]["code"] == "internal_server_error"
    assert response.json()["detail"]["message_fr"] == "Erreur serveur inattendue."


def test_request_logging_adds_request_id_header():
    client = TestClient(app)

    response = client.get("/health", headers={"X-Request-ID": "test-request-id"})

    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "test-request-id"


def test_json_log_formatter_outputs_structured_logs():
    record = logging.LogRecord(
        name="app.test",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="centralized log",
        args=(),
        exc_info=None,
    )
    record.request_id = "req-123"
    record.status_code = 200

    payload = json.loads(JsonLogFormatter().format(record))

    assert payload["level"] == "INFO"
    assert payload["logger"] == "app.test"
    assert payload["message"] == "centralized log"
    assert payload["request_id"] == "req-123"
    assert payload["status_code"] == 200
