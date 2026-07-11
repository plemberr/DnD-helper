from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from content_service.app.models import Document


async def create(db: AsyncSession, room_id: int, folder_id: int, title: str, content: str, created_by: int) -> Document:
    document = Document(room_id=room_id, folder_id=folder_id, title=title, content=content, created_by=created_by)
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return document


async def get_by_id(db: AsyncSession, document_id: int) -> Document | None:
    return (await db.execute(select(Document).where(Document.id == document_id))).scalar_one_or_none()


async def list_by_folder(db: AsyncSession, folder_id: int) -> list[Document]:
    result = await db.execute(
        select(Document).where(Document.folder_id == folder_id).order_by(Document.title)
    )
    return list(result.scalars().all()) # достать именно объекты Document и получить список


async def update(db: AsyncSession, document: Document, title: str | None, content: str | None, is_secret: bool | None) -> Document:
    if title is not None:
        document.title = title
    if content is not None:
        document.content = content
    if is_secret is not None:
        document.is_secret = is_secret
    await db.commit()
    await db.refresh(document)
    return document


async def delete(db: AsyncSession, document: Document) -> None:
    await db.delete(document)
    await db.commit()


async def search(db: AsyncSession, room_id: int, q: str, limit: int = 20) -> list[Document]:
    pattern = f"%{q}%"
    result = await db.execute(
        select(Document)
        .where(Document.room_id == room_id)
        .where(or_(Document.title.ilike(pattern), Document.content.ilike(pattern)))
        .limit(limit)
    )
    return list(result.scalars().all())
