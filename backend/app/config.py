"""Application settings loaded from environment variables and backend/.env."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the API and database."""

    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 60
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> list[str]:
        """Return the comma-separated frontend URLs as a clean list."""
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


settings = Settings()
