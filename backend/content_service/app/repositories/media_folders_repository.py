from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app.models import MediaFolder


async def create(db: AsyncSession, room_id: int, name: str) -> MediaFolder:
    folder = MediaFolder(room_id=room_id, name=name)
    db.add(folder)
    await db.commit()
    await db.refresh(folder)
    return folder


async def list_by_room(db: AsyncSession, room_id: int) -> list[MediaFolder]:
    result = await db.execute(select(MediaFolder).where(MediaFolder.room_id == room_id).order_by(MediaFolder.name))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, folder_id: int) -> MediaFolder | None:
    return (await db.execute(select(MediaFolder).where(MediaFolder.id == folder_id))).scalar_one_or_none()


async def update(db: AsyncSession, folder: MediaFolder, name: str | None) -> MediaFolder:
    if name is not None:
        folder.name = name
    await db.commit()
    await db.refresh(folder)
    return folder


async def delete(db: AsyncSession, folder: MediaFolder) -> None:
    await db.delete(folder)
    await db.commit()
