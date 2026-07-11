from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app.models import Folder


async def create(db: AsyncSession, room_id: int, name: str, parent_folder_id: int | None) -> Folder:
    folder = Folder(room_id=room_id, name=name, parent_folder_id=parent_folder_id)
    db.add(folder)
    await db.commit()
    await db.refresh(folder)
    return folder


async def list_by_room(db: AsyncSession, room_id: int, parent_folder_id: int | None = None, filter_parent: bool = False) -> list[Folder]:
    query = select(Folder).where(Folder.room_id == room_id)
    if filter_parent:
        query = query.where(Folder.parent_folder_id == parent_folder_id)
    result = await db.execute(query.order_by(Folder.name))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, folder_id: int) -> Folder | None:
    return (await db.execute(select(Folder).where(Folder.id == folder_id))).scalar_one_or_none()


async def update(db: AsyncSession, folder: Folder, name: str | None, parent_folder_id: int | None, parent_set: bool) -> Folder:
    if name is not None:
        folder.name = name
    if parent_set:
        folder.parent_folder_id = parent_folder_id
    await db.commit()
    await db.refresh(folder)
    return folder


async def delete(db: AsyncSession, folder: Folder) -> None:
    await db.delete(folder)
    await db.commit()
