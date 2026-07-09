from pydantic_settings import BaseSettings, SettingsConfigDict

class CommonSettings(BaseSettings):

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://app_user:app_pass@localhost:5432/app_db"
