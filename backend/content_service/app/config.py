from pathlib import Path

from common.config import CommonSettings


class Settings(CommonSettings):
    """Конфигурация контент-сервиса."""

    jwt_algorithm: str = "RS256"
    jwt_public_key_path: str = "keys/public.pem"

    media_storage_path: str = "media_storage"
    media_public_base_url: str = "http://localhost:8002/media"

    room_service_url: str = "http://localhost:8002"
    room_service_timeout_seconds: float = 5.0


settings = Settings()


def _read_key(path: str) -> str:
    """Считывает публичный JWT-ключ из файла."""

    key_path = Path(path)
    if not key_path.is_file():
        raise FileNotFoundError(
            f"JWT public key не найден в '{key_path}'."
        )
    return key_path.read_text()


PUBLIC_KEY = _read_key(settings.jwt_public_key_path)