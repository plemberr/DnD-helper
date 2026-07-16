from enum import StrEnum

from sqlalchemy import Integer, String, DateTime, func, Column, ForeignKey
from sqlalchemy import Enum as SAEnum

from common.db import Base

class RevokedReason(StrEnum):
    """Причины отзыва refresh-токена."""

    logout = "logout"
    rotated = "rotated"
    reuse_detected = "reuse_detected"
    password_changed = "password_changed"


class RefreshToken(Base):
    """Модель для хранения и управления refresh-токенами пользователей."""

    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_reason = Column(SAEnum(RevokedReason), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    replaced_by = Column(Integer, ForeignKey("refresh_tokens.id"), nullable=True)