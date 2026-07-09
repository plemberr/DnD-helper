from common.db import Base
from sqlalchemy import Integer, Column, ForeignKey, String
from enum import StrEnum
from sqlalchemy import Enum as SAEnum

class Type(str, StrEnum):
    ability = "ability"
    saving_throw = "saving_throw"
    skill = "skill"

class Skill(Base):
    __tablename__ = 'skills'
    id = Column(Integer, primary_key=True)
    name = Column(String(60), nullable=False)
    type = Column(SAEnum(Type), nullable=False)
    parent_id = Column(Integer, ForeignKey('skills.id'), nullable=True)
    order_index = Column(Integer, nullable=False)