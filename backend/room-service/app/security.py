import jwt

from app.config import PUBLIC_KEY, settings


def decode_token(token: str) -> dict:
    return jwt.decode(token, PUBLIC_KEY, algorithms=[settings.jwt_algorithm])
