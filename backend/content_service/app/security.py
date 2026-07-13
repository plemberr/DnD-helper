import jwt

from content_service.app.config import PUBLIC_KEY, settings


def decode_token(token: str) -> dict:
    """
    Декодирует и проверяет подпись JWT-токена, выпущенного auth_service.
    :param token: access-токен из заголовка Authorization
    :return: payload токена
    """
    return jwt.decode(token, PUBLIC_KEY, algorithms=[settings.jwt_algorithm])