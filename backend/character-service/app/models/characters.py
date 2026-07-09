from common.db import Base
from sqlalchemy import Integer, String, DateTime, Column, func, Text
from sqlalchemy.dialects.postgresql import JSONB

class Character(Base):
    __tablename__ = "characters"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    name = Column(String(80), nullable=False)
    race = Column(String(60), nullable=False)
    character_class = Column(String(60), nullable=False)
    level = Column(Integer, default=1, nullable=False)
    hp_current = Column(Integer, nullable=False)
    hp_max = Column(Integer, nullable=False)
    ac = Column(Integer, nullable=False)
    initiative = Column(Integer, nullable=False)
    inspiration = Column(Integer, default=0, nullable=False)
    age = Column(Integer, nullable=True)
    weight = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    appearance = Column(Text, nullable=False)
    inventory = Column(JSONB, nullable=False, server_default='{}')
    feats = Column(JSONB, nullable=False, server_default='{}')
    spells = Column(JSONB, nullable=False, server_default='{}')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
