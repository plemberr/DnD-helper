from common.db import Base
from sqlalchemy import Integer, String, DateTime, func, Column, Text


class Rooms(Base):
    """Модель игровой комнаты."""

    __tablename__ = 'rooms'

    id = Column(Integer, primary_key=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    cover_image_url = Column(String(255), nullable=True)
    player_limit = Column(Integer, server_default='6')
    created_at = Column(DateTime, server_default=func.now())
    master_id = Column(Integer, nullable=False)
