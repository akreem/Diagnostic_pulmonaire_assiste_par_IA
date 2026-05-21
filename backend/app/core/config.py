from functools import cached_property

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", protected_namespaces=("settings_",))

    database_url: str = "postgresql+psycopg://pfd:pfd_dev_password@localhost:5432/pfd"
    secret_key: str = "change-me-in-development"
    access_token_expire_minutes: int = 60
    audit_log_retention_days: int = 365
    backend_cors_origins: str = "http://localhost:5173"
    upload_max_file_size_bytes: int = 50 * 1024 * 1024
    upload_storage_dir: str = "storage/uploads"
    model_service_url: str = "http://localhost:8001"

    @cached_property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


settings = Settings()
