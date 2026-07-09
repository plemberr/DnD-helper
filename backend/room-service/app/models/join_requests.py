from common.db import Base
from sqlalchemy import Integer, String, DateTime, Column, ForeignKey, func
from enum import StrEnum
from sqlalchemy import Enum as SAEnum

class Status(StrEnum):
    pending = 'pending'
    accepted = 'accepted'
    rejected = 'rejected'

class JoinRequests(Base):
    __tablename__ = 'join_requests'
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey('rooms.id'), nullable=False)
    user_id = Column(Integer, nullable=False)
    character_id = Column(Integer, nullable=True)
    username = Column(String(120), nullable=False)
    status = Column(SAEnum(Status), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
