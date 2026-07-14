import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

_USERNAME_RE = re.compile(r"^[A-Za-z0-9_.-]+$")


def _validate_password_strength(password: str) -> str:
    """
    Проверяет пароль на минимальные требования сложности.
    :param password: пароль в открытом виде
    :return: тот же пароль, если он прошёл проверку
    """
    if len(password) < 8:
        raise ValueError("Пароль должен содержать не менее 8 символов")
    if not re.search(r"[A-Za-z]", password) or not re.search(r"[0-9]", password):
        raise ValueError("Пароль должен содержать как минимум одну букву и одну цифру")
    return password


class UsernameFieldValidator:
    """Миксин с проверкой допустимых символов в username. Переиспользуется в UserCreate и UserUpdate."""

    @field_validator("username")
    @classmethod
    def _validate_username_charset(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not _USERNAME_RE.match(v):
            raise ValueError("Имя пользователя может содержать только буквы, цифры, '.', '_', '-'")
        return v


class UserCreate(UsernameFieldValidator, BaseModel):
    """Данные для регистрации нового пользователя."""
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def _password_strength(cls, v: str) -> str:
        return _validate_password_strength(v)


class UserPublic(BaseModel):
    """Публичные данные пользователя, безопасные для показа другим пользователям."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None


class UserOut(UserPublic):
    """Полные данные пользователя, возвращаемые ему самому."""
    created_at: datetime


class UserUpdate(UsernameFieldValidator, BaseModel):
    """Поля для обновления профиля пользователя (обновляются только переданные)."""
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    avatar_url: Optional[str] = Field(default=None, max_length=255)


class ChangePasswordRequest(BaseModel):
    """Данные для смены пароля текущего пользователя."""
    old_password: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def _password_strength(cls, v: str) -> str:
        return _validate_password_strength(v)


class LoginRequest(BaseModel):
    """Данные для входа: логин (username или email) и пароль."""
    login: str  # username or email
    password: str


class RefreshRequest(BaseModel):
    """Запрос на обновление пары токенов по refresh-токену."""
    refresh_token: str


class LogoutRequest(BaseModel):
    """Запрос на выход из системы (отзыв конкретного refresh-токена)."""
    refresh_token: str


class RefreshResponse(BaseModel):
    """Пара токенов, выдаваемая при обновлении сессии."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenResponse(RefreshResponse):
    """Пара токенов вместе с данными пользователя — выдаётся при регистрации и логине."""
    user: Optional[UserPublic] = None
