from common.db import Base
from sqlalchemy import Integer, DateTime, func, Column
from enum import StrEnum
from sqlalchemy import Enum as SAEnum

class EntityType(str, StrEnum):
    document = 'document'
    media = 'media'

class Favorite(Base):
    __tablename__ = 'favorites'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    entity_type = Column(SAEnum(EntityType), nullable=False)
    entity_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
