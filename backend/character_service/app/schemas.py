from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# инвентарь/черты
class Item(BaseModel):
    """Элемент инвентаря или черты персонажа. Используется на вход и на выход"""
    id: Optional[str] = None
    type: str
    value: str


# заклинания
class SpellsOut(BaseModel):
    """Список id известных персонажу заклинаний"""
    ids: List[str] = Field(default_factory=list)


class SpellAdd(BaseModel):
    """Данные для добавления заклинания персонажу"""
    spell_id: str


class SpellAddOut(BaseModel):
    """Результат добавления заклинания"""
    id: int
    spells: SpellsOut


# создание персонажа
class CharacterCreate(BaseModel):
    """Данные для создания персонажа"""
    name: str = Field(min_length=1, max_length=80)
    race: str = Field(min_length=1, max_length=60)
    character_class: str = Field(min_length=1, max_length=60)
    level: int = Field(default=1, ge=1)
    age: Optional[int] = None
    weight: int
    height: int
    appearance: str
    hp_current: int
    hp_max: int
    ac: int
    initiative: int


# персонаж
class CharacterBase(BaseModel):
    """Общие поля персонажа, переиспользуемые в CharacterOut и CharacterUpdateOut"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    race: str
    character_class: str
    level: int
    hp_current: int
    hp_max: int
    ac: int
    initiative: int
    age: Optional[int] = None
    weight: int
    height: int
    appearance: str


class CharacterOut(CharacterBase):
    """Полный лист персонажа в ответе API"""
    room_id: int
    inspiration: int
    inventory: List[Item]
    feats: List[Item]
    spells: SpellsOut
    created_at: datetime
    updated_at: datetime


class CharacterUpdateOut(CharacterBase):
    """Персонаж в ответе на обновление профиля (без служебных и игровых полей)"""
    updated_at: datetime


# список персонажей в комнате
class CharacterListItem(BaseModel):
    """Персонаж в списке персонажей комнаты, только основные поля"""
    id: int
    name: str
    user_id: int
    level: int
    hp_current: int
    hp_max: int
    ac: int


class CharactersListResponse(BaseModel):
    """Список персонажей комнаты с общим количеством"""
    items: List[CharacterListItem]
    total: int


# навыки
class SkillItem(BaseModel):
    """Владение навыком персонажа. Используется и в списках, и как результат обновления"""
    skill_id: int
    level: int
    value: int


class SkillsListResponse(BaseModel):
    """Список навыков персонажа с общим количеством"""
    items: List[SkillItem]
    total: int


class SkillUpdate(BaseModel):
    """Данные для изменения уровня владения навыком"""
    level: int = Field(ge=0, le=2)


# детальный просмотр персонажа
class CharacterDetail(BaseModel):
    """Детальная информация о персонаже, включая навыки, инвентарь, черты и заклинания"""
    id: int
    user_id: int
    name: str
    race: str
    character_class: str
    level: int

    hp_current: int
    hp_max: int
    ac: int
    initiative: int

    inspiration: int

    age: Optional[int] = None
    weight: int
    height: int
    appearance: str

    skills: List[SkillItem]
    inventory: List[Item]
    spells: SpellsOut
    feats: List[Item]

    created_at: datetime
    updated_at: datetime


# персонаж обновление
class CharacterUpdate(BaseModel):
    """Поля для обновления персонажа"""
    name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    race: Optional[str] = Field(default=None, min_length=1, max_length=60)
    character_class: Optional[str] = Field(default=None, min_length=1, max_length=60)
    age: Optional[int] = None
    weight: Optional[int] = None
    height: Optional[int] = None
    appearance: Optional[str] = None


# обновление инвентарь/черты
class InventoryUpdate(BaseModel):
    """Новый набор предметов инвентаря персонажа"""
    inventory: List[Item]


class InventoryOut(BaseModel):
    """Инвентарь персонажа"""
    id: int
    inventory: List[Item]


class FeatsUpdate(BaseModel):
    """Новый набор черт персонажа"""
    feats: List[Item]


class FeatsOut(BaseModel):
    """Черты персонажа"""
    id: int
    feats: List[Item]


# lvl up / lvl down
class LevelChangeOut(BaseModel):
    """Результат изменения уровня персонажа"""
    id: int
    level: int
    hp_max: int
    hp_current: int


# hp
class HpUpdate(BaseModel):
    """Изменение текущего HP персонажа"""
    delta: int


class HpOut(BaseModel):
    """Текущее и максимальное HP персонажа"""
    id: int
    hp_current: int
    hp_max: int


# вдохновение
class InspirationGrant(BaseModel):
    """Данные для начисления вдохновения персонажу"""
    amount: int = Field(default=1, ge=1)


class InspirationOut(BaseModel):
    """Текущее количество очков вдохновения персонажа"""
    id: int
    inspiration: int
