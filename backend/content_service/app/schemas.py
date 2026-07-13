from datetime import datetime

from pydantic import BaseModel, ConfigDict


# document folders

class DocumentFolderCreate(BaseModel):
    """Данные для создания папки документов."""
    name: str
    parent_folder_id: int | None = None


class DocumentFolderUpdate(BaseModel):
    """Поля для обновления папки документов (обновляются только переданные)."""
    name: str | None = None
    parent_folder_id: int | None = None


class DocumentFolderOut(BaseModel):
    """Папка документов в ответе API."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    room_id: int
    parent_folder_id: int | None
    name: str
    created_at: datetime


# media folders

class MediaFolderCreate(BaseModel):
    """Данные для создания медиапапки."""
    name: str


class MediaFolderUpdate(BaseModel):
    """Поля для обновления медиапапки (обновляются только переданные)."""
    name: str | None = None


class MediaFolderOut(BaseModel):
    """Медиапапка в ответе API."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    room_id: int
    name: str


# documents

class DocumentCreate(BaseModel):
    """Данные для создания документа."""
    title: str
    content: str


class DocumentUpdate(BaseModel):
    """Поля для обновления документа (обновляются только переданные)."""
    title: str | None = None
    content: str | None = None
    is_secret: bool | None = None


class DocumentListItem(BaseModel):
    """Документ без содержимого — используется в списках."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    room_id: int
    folder_id: int | None
    title: str
    is_secret: bool
    created_by: int
    created_at: datetime


class DocumentOut(DocumentListItem):
    """Полный документ (с содержимым) — используется при получении одного документа."""
    content: str


# media files (images / audio)

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


# favorites

class FavoriteBase(BaseModel):
    """Общие поля, определяющие сущность избранного (документ или медиафайл)."""
    entity_type: str  # document | media
    entity_id: int


class FavoriteCreate(FavoriteBase):
    """Данные для добавления записи в избранное."""
    pass


class FavoriteOut(FavoriteBase):
    """Запись избранного в ответе API."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    added_at: datetime | None


class FavoriteListItem(FavoriteBase):
    """Запись избранного в списке — дополнительно содержит название сущности."""
    title: str
    added_at: datetime | None


# search

class SearchResultItem(BaseModel):
    """Элемент результата глобального поиска (документ или медиафайл)."""
    entity_type: str
    entity_id: int
    title: str
    snippet: str