from functools import lru_cache
from pathlib import Path

from common.config import CommonSettings


class Settings(CommonSettings):

    # БД из общего config

    # JWT
    jwt_algorithm: str = "RS256"
    jwt_public_key_path: str = "keys/public.pem"

    auth_service_url: str = "http://auth-service:8001"
    auth_service_timeout_seconds: float = 5.0


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


def _read_key(path: str) -> str:
    key_path = Path(path)
    if not key_path.is_file():
        raise FileNotFoundError(
            f"JWT ключ не найден в '{key_path}'. "
        )
    return key_path.read_text()


PUBLIC_KEY = _read_key(settings.jwt_public_key_path)
