from common.db import Base
from sqlalchemy import Integer, Column, String

class MediaFolder(Base):
    """Модель папки для хранения и группировки медиафайлов."""

    __tablename__ = 'media_folders'
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, nullable=False)
    name = Column(String(120), nullable=False)