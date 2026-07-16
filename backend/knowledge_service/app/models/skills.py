from common.db import Base
from sqlalchemy import Integer, Column, ForeignKey, String
from enum import StrEnum
from sqlalchemy import Enum as SAEnum


class Type(StrEnum):
    """Тип навыка/характеристики персонажа."""

    ability = "ability"
    saving_throw = "saving_throw"
    skill = "skill"


class Skill(Base):
    """Модель навыка, характеристики или спасброска из справочника."""

    __tablename__ = 'skills'
    id = Column(Integer, primary_key=True)
    name = Column(String(60), nullable=False)
    type = Column(SAEnum(Type, name="skill_type"), nullable=False)
    parent_id = Column(Integer, ForeignKey('skills.id'), nullable=True)
    order_index = Column(Integer, nullable=False)
