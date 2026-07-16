from common.db import Base
from sqlalchemy import Integer, String, DateTime, Column, ForeignKey, func
from enum import StrEnum
from sqlalchemy import Enum as SAEnum


class Role(StrEnum):
    """Роль участника комнаты."""

    co_master = 'co_master'
    master = 'master'
    player = 'player'


class RoomMember(Base):
    """Модель участника комнаты (мастер, co-мастер или игрок)."""

    __tablename__ = 'room_member'

    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey('rooms.id'), nullable=False)
    user_id = Column(Integer, nullable=False)
    character_id = Column(Integer, nullable=True)
    username = Column(String(255), nullable=False)
    role = Column(SAEnum(Role), nullable=False)
    joined_at = Column(DateTime, server_default=func.now())
