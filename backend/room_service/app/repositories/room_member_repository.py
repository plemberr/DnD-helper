from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from room_service.app.models import Role, RoomMember


# получить члена комнаты по id
async def get_member(db: AsyncSession, room_id: int, user_id: int) -> Optional[RoomMember]:
    result = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


# список членов комнаты
async def list_members(db: AsyncSession, room_id: int) -> List[RoomMember]:
    result = await db.execute(
        select(RoomMember).where(RoomMember.room_id == room_id).order_by(RoomMember.joined_at.asc())
    )
    return list(result.scalars().all())


# добавить члена комнаты
async def add_member(
    db: AsyncSession,
    room_id: int,
    user_id: int,
    username: str,
    role: Role,
) -> RoomMember:
    member = RoomMember(room_id=room_id, user_id=user_id, username=username, role=role)
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member


# добавление co-master / удаление
async def update_member_role(db: AsyncSession, member: RoomMember, role: Role) -> RoomMember:
    member.role = role
    await db.commit()
    await db.refresh(member)
    return member


# удаление члена комнаты
async def remove_member(db: AsyncSession, member: RoomMember) -> None:
    await db.delete(member)
    await db.commit()
