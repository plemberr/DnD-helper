from pathlib import Path

from common.config import CommonSettings


class Settings(CommonSettings):
    """Конфигурация сервиса аутентификации."""

    jwt_algorithm: str = "RS256"
    jwt_private_key_path: str = "keys/private.pem"
    jwt_public_key_path: str = "keys/public.pem"

    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30


settings = Settings()


def _read_key(path: str) -> str:
    """Считывает JWT-ключ из файла."""

    key_path = Path(path)
    if not key_path.is_file():
        raise FileNotFoundError(
            f"JWT ключ не найден в '{key_path}'. "
        )
    return key_path.read_text()


PRIVATE_KEY = _read_key(settings.jwt_private_key_path)
PUBLIC_KEY = _read_key(settings.jwt_public_key_path)