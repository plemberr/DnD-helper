from common.db import Base
from sqlalchemy import Integer, String, DateTime, func, Column, ForeignKey

class Folder(Base):
    """Модель папки для организации документов."""

    __tablename__ = 'folders'
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, nullable=False)
    parent_folder_id = Column(Integer, ForeignKey('folders.id'), nullable=True)
    name = Column(String(120), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())