import base64
import hashlib
import secrets

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.config import settings


def get_encryption_key() -> bytes:
    return hashlib.sha256(settings.secret_key.encode("utf-8")).digest()


def encrypt_bytes(content: bytes) -> bytes:
    nonce = secrets.token_bytes(12)
    encrypted_content = AESGCM(get_encryption_key()).encrypt(nonce, content, None)
    return nonce + encrypted_content


def decrypt_bytes(content: bytes) -> bytes:
    nonce = content[:12]
    encrypted_content = content[12:]
    return AESGCM(get_encryption_key()).decrypt(nonce, encrypted_content, None)


def encrypt_text(value: str) -> str:
    return base64.urlsafe_b64encode(encrypt_bytes(value.encode("utf-8"))).decode("ascii")


def decrypt_text(value: str) -> str:
    encrypted_value = base64.urlsafe_b64decode(value.encode("ascii"))
    return decrypt_bytes(encrypted_value).decode("utf-8")
