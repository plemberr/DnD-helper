from datetime import datetime
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ORMModel(BaseModel):
    """Базовая модель для схем, которые собираются напрямую из ORM-объектов (Character и т.п.)"""
    model_config = ConfigDict(from_attributes=True)


class IdMixin(ORMModel):
    """Примешивает id — используется во всех "точечных" ответах об изменении персонажа"""
    id: int


class PaginatedResponse(BaseModel, Generic[T]):
    """Список элементов с общим количеством. Переиспользуется для любых списков с пагинацией"""
    items: List[T]
    total: int


# инвентарь/черты
class Item(BaseModel):
    """Элемент инвентаря или черты персонажа. Используется на вход и на выход"""
    id: Optional[str] = None
    type: str
    value: str


class InventoryUpdate(BaseModel):
    """Новый набор предметов инвентаря персонажа"""
    inventory: List[Item]


class InventoryOut(IdMixin):
    """Инвентарь персонажа"""
    inventory: List[Item]


class FeatsUpdate(BaseModel):
    """Новый набор черт персонажа"""
    feats: List[Item]


class FeatsOut(IdMixin):
    """Черты персонажа"""
    feats: List[Item]


# заклинания
class SpellsOut(ORMModel):
    """Список id известных персонажу заклинаний"""
    ids: List[str] = Field(default_factory=list)


class SpellAdd(BaseModel):
    """Данные для добавления заклинания персонажу"""
    spell_id: str


class SpellAddOut(IdMixin):
    """Результат добавления заклинания"""
    spells: SpellsOut


# создание/обновление персонажа
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


class CharacterUpdate(BaseModel):
    """Поля для обновления персонажа"""
    name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    race: Optional[str] = Field(default=None, min_length=1, max_length=60)
    character_class: Optional[str] = Field(default=None, min_length=1, max_length=60)
    level: Optional[int] = Field(default=None, ge=1)
    age: Optional[int] = None
    weight: Optional[int] = None
    height: Optional[int] = None
    appearance: Optional[str] = None


# персонаж (ответы собираются напрямую из ORM-модели Character через from_attributes)
class CharacterBase(ORMModel):
    """Общие поля персонажа, переиспользуемые во всех ответах о персонаже"""
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


class CharacterUpdateOut(CharacterBase):
    """Персонаж в ответе на обновление профиля (без служебных и игровых полей)"""
    updated_at: datetime


class CharacterOut(CharacterBase):
    """Полный лист персонажа в ответе API"""
    room_id: int
    inspiration: int
    inventory: List[Item]
    feats: List[Item]
    spells: SpellsOut
    created_at: datetime
    updated_at: datetime


# навыки
class SkillItem(ORMModel):
    """Владение навыком персонажа. Используется и в списках, и как результат обновления"""
    skill_id: int
    level: int
    value: int


class SkillUpdate(BaseModel):
    """Данные для изменения уровня владения навыком"""
    level: int = Field(ge=0, le=2)


# детальный просмотр персонажа: те же поля, что и в CharacterOut, плюс список навыков
class CharacterDetail(CharacterOut):
    """Детальная информация о персонаже, включая навыки, инвентарь, черты и заклинания"""
    skills: List[SkillItem] = Field(default_factory=list)


# список персонажей в комнате
class CharacterListItem(ORMModel):
    """Персонаж в списке персонажей комнаты, только основные поля"""
    id: int
    name: str
    user_id: int
    level: int
    hp_current: int
    hp_max: int
    ac: int


class CharactersListResponse(PaginatedResponse[CharacterListItem]):
    """Список персонажей комнаты с общим количеством"""


class SkillsListResponse(PaginatedResponse[SkillItem]):
    """Список навыков персонажа с общим количеством"""


# hp
class HpFields(BaseModel):
    hp_current: int
    hp_max: int


class HpUpdate(BaseModel):
    """Изменение текущего HP персонажа"""
    delta: int


class HpOut(IdMixin, HpFields):
    """Текущее и максимальное HP персонажа"""


# вдохновение
class InspirationGrant(BaseModel):
    """Данные для начисления вдохновения персонажу"""
    amount: int = Field(default=1, ge=1)


class InspirationOut(IdMixin):
    """Текущее количество очков вдохновения персонажа"""
    inspiration: int
