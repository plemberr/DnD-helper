from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import JoinRequests, Status


# получить заявку на вступление по id
async def get_request_by_id(db: AsyncSession, request_id: int) -> Optional[JoinRequests]:
    result = await db.execute(select(JoinRequests).where(JoinRequests.id == request_id))
    return result.scalar_one_or_none()


# получить заявки со статусом pending
async def get_pending_request(db: AsyncSession, room_id: int, user_id: int) -> Optional[JoinRequests]:
    result = await db.execute(
        select(JoinRequests).where(
            JoinRequests.room_id == room_id,
            JoinRequests.user_id == user_id,
            JoinRequests.status == Status.pending,
        )
    )
    return result.scalar_one_or_none()


# список заявок
async def list_requests(
    db: AsyncSession,
    room_id: int,
    status: Optional[Status] = None,
) -> List[JoinRequests]:
    query = select(JoinRequests).where(JoinRequests.room_id == room_id)
    if status is not None:
        query = query.where(JoinRequests.status == status)
    query = query.order_by(JoinRequests.created_at.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


# отправить заявку на вступление
async def create_request(db: AsyncSession, room_id: int, user_id: int, username: str) -> JoinRequests:
    request = JoinRequests(
        room_id=room_id,
        user_id=user_id,
        username=username,
        status=Status.pending,
    )
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


# обновить статус заявки (отклонить, одобрить)
async def update_status(db: AsyncSession, request: JoinRequests, status: Status) -> JoinRequests:
    request.status = status
    await db.commit()
    await db.refresh(request)
    return request


# отозвать заявку на вступление
async def delete_request(db: AsyncSession, request: JoinRequests) -> None:
    await db.delete(request)
    await db.commit()
