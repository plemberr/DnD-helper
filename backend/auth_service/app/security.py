import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

from auth_service.app.config import PRIVATE_KEY, PUBLIC_KEY, settings

# Используем только современный алгоритм Argon2
pwd_context = CryptContext(schemes=["argon2"])


def hash_password(password: str) -> str:
    """Хэширует пароль пользователя."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет, совпадает ли пароль с хэшем."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: int) -> tuple[str, int]:
    """Создает JWT access token и возвращает (token, expires_in)."""
    now = datetime.now(timezone.utc)
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)

    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + expires_delta,
        "type": "access",
    }

    token = jwt.encode(
        payload,
        PRIVATE_KEY,
        algorithm=settings.jwt_algorithm,
    )

    return token, int(expires_delta.total_seconds())


def decode_token(token: str) -> dict:
    """Проверяет JWT и возвращает его payload."""
    return jwt.decode(
        token,
        PUBLIC_KEY,
        algorithms=[settings.jwt_algorithm],
    )


def generate_refresh_token() -> tuple[str, str]:
    """Создает refresh token и его SHA-256 хэш."""
    raw_token = secrets.token_urlsafe(64)
    token_hash = hash_refresh_token(raw_token)

    return raw_token, token_hash


def hash_refresh_token(raw_token: str) -> str:
    """Хэширует refresh token перед сохранением в БД."""
    return hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()