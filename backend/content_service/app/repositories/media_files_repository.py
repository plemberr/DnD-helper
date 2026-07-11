from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app.models import MediaFile, Type


async def create(
    db: AsyncSession,
    room_id: int,
    media_folder_id: int,
    type_: Type,
    uploaded_by: int,
    original_name: str,
    file_url: str | None = None,
    external_url: str | None = None,
    thumbnail_url: str | None = None,
    size: int | None = None,
    duration_seconds: int | None = None,
    tags: list[str] | None = None,
) -> MediaFile:
    media = MediaFile(
        room_id=room_id,
        media_folder_id=media_folder_id,
        type=type_,
        uploaded_by=uploaded_by,
        original_name=original_name,
        file_url=file_url,
        external_url=external_url,
        thumbnail_url=thumbnail_url,
        size=size,
        duration_seconds=duration_seconds,
        tags=tags,
    )
    db.add(media)
    await db.commit()
    await db.refresh(media)
    return media


async def get_by_id(db: AsyncSession, media_id: int) -> MediaFile | None:
    return (await db.execute(select(MediaFile).where(MediaFile.id == media_id))).scalar_one_or_none()


async def list_by_room(
    db: AsyncSession,
    room_id: int,
    type_: Type,
    folder_id: int | None = None,
    tags: list[str] | None = None,
    search: str | None = None,
) -> list[MediaFile]:
    query = select(MediaFile).where(MediaFile.room_id == room_id, MediaFile.type == type_)
    if folder_id is not None:
        query = query.where(MediaFile.media_folder_id == folder_id)
    if search:
        query = query.where(MediaFile.original_name.ilike(f"%{search}%"))
    if tags:
        query = query.where(MediaFile.tags.overlap(tags))
    result = await db.execute(query.order_by(MediaFile.created_at.desc()))
    return list(result.scalars().all())


async def delete(db: AsyncSession, media: MediaFile) -> None:
    await db.delete(media)
    await db.commit()
