from pathlib import Path

from common.config import CommonSettings


class Settings(CommonSettings):
    """Конфигурация сервиса персонажей."""

    jwt_algorithm: str = "RS256"
    jwt_public_key_path: str = "keys/public.pem"

    room_service_url: str = "http://localhost:8002"
    room_service_timeout_seconds: float = 5.0


settings = Settings()


def _read_key(path: str) -> str:
    """Считывает JWT-ключ из файла."""

    key_path = Path(path)
    if not key_path.is_file():
        raise FileNotFoundError(
            f"JWT ключ не найден в '{key_path}'. "
        )
    return key_path.read_text()


PUBLIC_KEY = _read_key(settings.jwt_public_key_path)