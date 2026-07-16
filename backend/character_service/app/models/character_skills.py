from common.db import Base
from sqlalchemy import Integer, Column, ForeignKey
from sqlalchemy import CheckConstraint

class CharacterSkills(Base):
    """Модель владения навыком персонажа"""

    __tablename__ = "character_skills"
    id = Column(Integer, primary_key=True)
    character_id = Column(Integer, ForeignKey('characters.id'), nullable=False)
    skill_id = Column(Integer, nullable=False)
    level = Column(Integer, nullable=False)
    value = Column(Integer, nullable=False)

    __table_args__ = (
        CheckConstraint("level IN (0, 1, 2)", name="check_level_range"),
    )