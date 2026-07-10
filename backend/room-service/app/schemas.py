from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models import Role, Status


class RoomCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: Optional[str] = None
    player_limit: int = Field(default=6, ge=1, le=50)
    cover_image_url: Optional[str] = Field(default=None, max_length=255)


class RoomUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = None
    player_limit: Optional[int] = Field(default=None, ge=1, le=50)
    cover_image_url: Optional[str] = Field(default=None, max_length=255)


# ответ о создании комнаты
class RoomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    player_limit: int
    current_players: int
    master_id: int
    cover_image_url: Optional[str] = None
    created_at: datetime


# ответ обновления комнаты
class RoomUpdateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    player_limit: int
    cover_image_url: Optional[str] = None
    created_at: datetime


# комната
class RoomListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    player_limit: int
    current_players: int
    master_name: str
    cover_image_url: Optional[str] = None
    created_at: datetime
    is_full: bool

# список комнат
class RoomsListResponse(BaseModel):
    items: List[RoomListItem]
    total: int
    limit: int
    offset: int


class MemberOut(BaseModel):
    user_id: int
    username: str
    role: Role


class RoomDetail(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    player_limit: int
    cover_image_url: Optional[str] = None
    created_at: datetime
    members: List[MemberOut]


# список участников
class MembersListResponse(BaseModel):
    items: List[MemberOut]



class CoMasterAssign(BaseModel):
    user_id: int


class CoMasterOut(BaseModel):
    room_id: int
    user_id: int
    role: Role


# отправка заявки
class JoinRequestOut(BaseModel):
    id: int
    room_id: int
    user_id: int
    status: Status


# заявка в листе заявок
class JoinRequestListItem(BaseModel):
    id: int
    room_id: int
    user_id: int
    username: str
    status: Status
    created_at: datetime


class JoinRequestsListResponse(BaseModel):
    items: List[JoinRequestListItem]


class JoinRequestUpdate(BaseModel):
    status: Status


# изменение заявки
class JoinRequestProcessedOut(BaseModel):
    id: int
    room_id: int
    user_id: int
    status: Status
