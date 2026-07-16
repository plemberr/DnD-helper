from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from room_service.app.models import Role, RoomMember


async def get_member(db: AsyncSession, room_id: int, user_id: int) -> Optional[RoomMember]:
    """
    Возвращает участника комнаты по id комнаты и id пользователя.
    :param db: сессия БД
    :param room_id: id комнаты
    :param user_id: id пользователя
    :return: найденный участник или None, если он не состоит в комнате
    """
    result = await db.execute(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def list_members(db: AsyncSession, room_id: int) -> List[RoomMember]:
    """
    Возвращает список участников комнаты.
    :param db: сессия БД
    :param room_id: id комнаты
    :return: список участников, отсортированный по дате вступления
    """
    result = await db.execute(
        select(RoomMember).where(RoomMember.room_id == room_id).order_by(RoomMember.joined_at.asc())
    )
    return list(result.scalars().all())


async def add_member(
    db: AsyncSession,
    room_id: int,
    user_id: int,
    username: str,
    role: Role,
) -> RoomMember:
    """
    Добавляет пользователя в число участников комнаты.
    :param db: сессия БД
    :param room_id: id комнаты
    :param user_id: id добавляемого пользователя
    :param username: имя пользователя
    :param role: назначаемая роль
    :return: созданный участник комнаты
    """
    member = RoomMember(room_id=room_id, user_id=user_id, username=username, role=role)
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member


async def update_member_role(db: AsyncSession, member: RoomMember, role: Role) -> RoomMember:
    """
    Изменяет роль участника комнаты.
    :param db: сессия БД
    :param member: изменяемый участник
    :param role: новая роль
    :return: обновлённый участник комнаты
    """
    member.role = role
    await db.commit()
    await db.refresh(member)
    return member


async def remove_member(db: AsyncSession, member: RoomMember) -> None:
    """
    Удаляет участника из комнаты.
    :param db: сессия БД
    :param member: удаляемый участник
    :return: ничего
    """
    await db.delete(member)
    await db.commit()
