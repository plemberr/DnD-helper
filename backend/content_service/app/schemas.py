from datetime import datetime
from typing import Generic, TypeVar # создание схемы Page

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int


# document folders

class DocumentFolderCreate(BaseModel):
    name: str
    parent_folder_id: int | None = None


class DocumentFolderUpdate(BaseModel):
    name: str | None = None
    parent_folder_id: int | None = None


class DocumentFolderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    room_id: int
    parent_folder_id: int | None
    name: str
    created_at: datetime


# media folders

class MediaFolderCreate(BaseModel):
    name: str


class MediaFolderUpdate(BaseModel):
    name: str | None = None


class MediaFolderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    room_id: int
    name: str


# documents

class DocumentCreate(BaseModel):
    title: str
    content: str


class DocumentUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    is_secret: bool | None = None


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    room_id: int
    folder_id: int | None
    title: str
    content: str
    is_secret: bool
    created_by: int
    created_at: datetime


class DocumentListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    room_id: int
    folder_id: int | None
    title: str
    is_secret: bool
    created_by: int
    created_at: datetime


# media files (images / audio)

class MediaFileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    room_id: int
    type: str
    url: str | None
    thumbnail_url: str | None = None
    duration_seconds: int | None = None
    folder_id: int | None
    tags: list[str] | None
    is_favorite: bool = False
    created_at: datetime


# favorites

class FavoriteCreate(BaseModel):
    entity_type: str  # document | media
    entity_id: int


class FavoriteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    entity_type: str
    entity_id: int
    added_at: datetime | None


class FavoriteListItem(BaseModel):
    entity_type: str
    entity_id: int
    title: str
    added_at: datetime | None


# search

class SearchResultItem(BaseModel):
    entity_type: str
    entity_id: int
    title: str
    snippet: str
