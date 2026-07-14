from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from room_service.app.models import Role, Status


class RoomCreate(BaseModel):
    """Данные для создания комнаты."""
    title: str = Field(min_length=1, max_length=120)
    description: Optional[str] = None
    player_limit: int = Field(default=6, ge=1, le=50)
    cover_image_url: Optional[str] = Field(default=None, max_length=255)


class RoomUpdate(BaseModel):
    """Поля для обновления комнаты (обновляются только переданные)."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = None
    player_limit: Optional[int] = Field(default=None, ge=1, le=50)
    cover_image_url: Optional[str] = Field(default=None, max_length=255)


class RoomUpdateOut(BaseModel):
    """Комната в ответе после обновления без счётчика игроков и id мастера."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    player_limit: int
    cover_image_url: Optional[str] = None
    created_at: datetime


class RoomOut(RoomUpdateOut):
    """Комната в ответе после создания дополнительно содержит число игроков и id мастера."""
    current_players: int
    master_id: int


class RoomListItem(BaseModel):
    """Комната в списке комнат."""
    id: int
    title: str
    description: Optional[str] = None
    player_limit: int
    current_players: int
    master_name: str
    cover_image_url: Optional[str] = None
    created_at: datetime
    is_full: bool


class RoomsListResponse(BaseModel):
    """Список комнат с пагинацией."""
    items: List[RoomListItem]
    total: int
    limit: int
    offset: int


class MemberOut(BaseModel):
    """Участник комнаты в ответе API."""
    user_id: int
    username: str
    role: Role


class RoomDetail(BaseModel):
    """Подробная информация о комнате вместе со списком её участников."""
    id: int
    title: str
    description: Optional[str] = None
    player_limit: int
    cover_image_url: Optional[str] = None
    created_at: datetime
    members: List[MemberOut]


class MembersListResponse(BaseModel):
    """Список участников комнаты."""
    items: List[MemberOut]


class CoMasterAssign(BaseModel):
    """Запрос на назначение участника co-мастером."""
    user_id: int


class CoMasterOut(BaseModel):
    """Результат назначения/снятия co-мастера."""
    room_id: int
    user_id: int
    role: Role


class JoinRequestOut(BaseModel):
    """Заявка на вступление — используется при её создании и обработке мастером."""
    id: int
    room_id: int
    user_id: int
    status: Status


class JoinRequestListItem(JoinRequestOut):
    """Заявка на вступление в списке заявок — дополнительно содержит имя и дату подачи."""
    username: str
    created_at: datetime


class JoinRequestsListResponse(BaseModel):
    """Список заявок на вступление."""
    items: List[JoinRequestListItem]


class JoinRequestUpdate(BaseModel):
    """Запрос на изменение статуса заявки мастером."""
    status: Status
