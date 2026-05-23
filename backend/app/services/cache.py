import logging
import socket
from urllib.parse import urlparse

from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisCache:
    def __init__(self, url: str | None):
        self.url = url or ""

    @property
    def enabled(self) -> bool:
        return bool(self.url)

    def get_text(self, key: str) -> str | None:
        if not self.enabled:
            return None
        try:
            response = self._execute("GET", key)
            return response.decode("utf-8") if isinstance(response, bytes) else None
        except Exception:
            logger.exception("Redis cache read failed for key %s", key)
            return None

    def set_text(self, key: str, value: str, ttl_seconds: int) -> None:
        if not self.enabled:
            return
        try:
            self._execute("SET", key, value, "EX", str(ttl_seconds))
        except Exception:
            logger.exception("Redis cache write failed for key %s", key)

    def delete(self, key: str) -> None:
        if not self.enabled:
            return
        try:
            self._execute("DEL", key)
        except Exception:
            logger.exception("Redis cache delete failed for key %s", key)

    def _execute(self, *parts: str) -> bytes | str | int | None:
        parsed = urlparse(self.url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 6379
        password = parsed.password
        db = parsed.path.lstrip("/") or "0"

        with socket.create_connection((host, port), timeout=0.25) as connection:
            if password:
                connection.sendall(self._command("AUTH", password))
                self._read_response(connection)
            if db != "0":
                connection.sendall(self._command("SELECT", db))
                self._read_response(connection)
            connection.sendall(self._command(*parts))
            return self._read_response(connection)

    @staticmethod
    def _command(*parts: str) -> bytes:
        payload = [f"*{len(parts)}\r\n".encode("utf-8")]
        for part in parts:
            encoded = part.encode("utf-8")
            payload.append(f"${len(encoded)}\r\n".encode("utf-8"))
            payload.append(encoded + b"\r\n")
        return b"".join(payload)

    def _read_response(self, connection: socket.socket) -> bytes | str | int | None:
        prefix = connection.recv(1)
        if prefix == b"+":
            return self._read_line(connection).decode("utf-8")
        if prefix == b":":
            return int(self._read_line(connection))
        if prefix == b"$":
            length = int(self._read_line(connection))
            if length == -1:
                return None
            data = self._read_exact(connection, length)
            self._read_exact(connection, 2)
            return data
        if prefix == b"-":
            raise RuntimeError(self._read_line(connection).decode("utf-8"))
        raise RuntimeError("Unsupported Redis response")

    @staticmethod
    def _read_line(connection: socket.socket) -> bytes:
        chunks: list[bytes] = []
        while True:
            chunk = connection.recv(1)
            if chunk == b"\r":
                connection.recv(1)
                return b"".join(chunks)
            chunks.append(chunk)

    @staticmethod
    def _read_exact(connection: socket.socket, length: int) -> bytes:
        chunks: list[bytes] = []
        remaining = length
        while remaining > 0:
            chunk = connection.recv(remaining)
            if not chunk:
                raise RuntimeError("Unexpected Redis connection close")
            chunks.append(chunk)
            remaining -= len(chunk)
        return b"".join(chunks)


cache_client = RedisCache(settings.redis_url)
