from sqlalchemy import Integer, String, DateTime, func, Column, ForeignKey
from common.db import Base
import enum
from sqlalchemy import Enum as SAEnum

class RevokedReason(str, enum.Enum):
    logout = 'logout'
    rotated = 'rotated'
    reuse_detected = 'reuse_detected'
    password_changed = 'password_changed'
    admin = 'admin'

class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    token_hash = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_reason = Column(SAEnum(RevokedReason), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    replaced_by = Column(Integer, ForeignKey('refresh_tokens.id'), nullable=True)