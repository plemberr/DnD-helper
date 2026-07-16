from common.db import Base
from sqlalchemy import Integer, DateTime, func, Column, ForeignKey, String
from enum import StrEnum
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import ARRAY

class Type(StrEnum):
    """Типы медиафайлов, поддерживаемые системой."""

    image = 'image'
    audio = 'audio'
    sound = 'sound'

class MediaFile(Base):
    """Модель медиафайла, загруженного в систему."""

    __tablename__ = 'media_files'
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, nullable=False)
    media_folder_id = Column(Integer, ForeignKey('media_folders.id'), nullable=False)
    type = Column(SAEnum(Type), nullable=False)
    file_url = Column(String(255), nullable=True)
    external_url = Column(String(255), nullable=True)
    thumbnail_url = Column(String(255), nullable=True)
    original_name = Column(String(150), nullable=False)
    size = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    uploaded_by = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


