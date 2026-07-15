from pydantic_settings import BaseSettings, SettingsConfigDict

class CommonSettings(BaseSettings):

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://app_user:app_pass@localhost:5432/app_db"

    auth_service_port: int = 8001
    room_service_port: int = 8002
    content_service_port: int = 8003
    character_service_port: int = 8004
