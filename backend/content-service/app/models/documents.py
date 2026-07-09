from common.db import Base
from sqlalchemy import Integer, DateTime, func, Column, ForeignKey, String, Text, Boolean

class Document(Base):
    __tablename__ = 'documents'
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, nullable=False)
    folder_id = Column(Integer, ForeignKey('folders.id'), nullable=True)
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    is_secret = Column(Boolean, nullable=False, server_default='false')
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)