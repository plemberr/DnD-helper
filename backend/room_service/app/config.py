from pathlib import Path

from common.config import CommonSettings


class Settings(CommonSettings):
    """Конфигурация room-сервиса."""

    jwt_algorithm: str = "RS256"
    jwt_public_key_path: str = "keys/public.pem"

    auth_service_timeout_seconds: float = 5.0

    @property
    def auth_service_url(self) -> str:
        return f"http://localhost:{self.auth_service_port}"


settings = Settings()


def _read_key(path: str) -> str:
    """Считывает публичный JWT-ключ из файла."""

    key_path = Path(path)
    if not key_path.is_file():
        raise FileNotFoundError(
            f"JWT ключ не найден в '{key_path}'. "
        )
    return key_path.read_text()


PUBLIC_KEY = _read_key(settings.jwt_public_key_path)
