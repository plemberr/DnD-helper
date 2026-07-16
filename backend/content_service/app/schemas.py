from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FolderCreate(BaseModel):
    """Данные для создания папки (документов или медиа)."""
    name: str
    parent_folder_id: int | None = None


class FolderUpdate(BaseModel):
    """Поля для обновления папки (обновляются только переданные)."""
    name: str | None = None
    parent_folder_id: int | None = None


class FolderOut(BaseModel):
    """Папка (документов или медиа) в ответе API."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    room_id: int
    name: str
    parent_folder_id: int | None = None
    created_at: datetime | None = None


class DocumentCreate(BaseModel):
    """Данные для создания документа."""
    title: str
    content: str


class DocumentUpdate(BaseModel):
    """Поля для обновления документа (обновляются только переданные)."""
    title: str | None = None
    content: str | None = None
    is_secret: bool | None = None


class DocumentOut(BaseModel):
    """Документ в ответе API."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    room_id: int
    folder_id: int | None
    title: str
    content: str
    is_secret: bool
    created_by: int
    created_at: datetime


class MediaFileOut(BaseModel):
    """Медиафайл (изображение или аудио) в ответе API."""
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


class FavoriteCreate(BaseModel):
    """Данные для добавления записи в избранное."""
    entity_type: str  # document | media
    entity_id: int


class FavoriteOut(BaseModel):
    """Запись избранного в ответе API."""
    model_config = ConfigDict(from_attributes=True)
    id: int | None = None
    entity_type: str
    entity_id: int
    title: str | None = None
    added_at: datetime | None = None


class SearchResultItem(BaseModel):
    """Элемент результата глобального поиска (документ или медиафайл)."""
    entity_type: str
    entity_id: int
    title: str
    snippet: str
