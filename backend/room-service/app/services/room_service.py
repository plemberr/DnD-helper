from enum import member
from typing import Tuple

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas
from app.clients import auth_client
from app.models import JoinRequests, Role, Rooms, RoomMember, Status
from app.repositories import join_request_repository, room_member_repository, room_repository


# создание комнаты. При создании сразу назначаем мастера
async def create_room(db: AsyncSession, master_id: int, access_token: str, payload: schemas.RoomCreate) -> schemas.RoomOut:

    master_username = await auth_client.fetch_current_username(access_token)

    # создаём комнату
    room = await room_repository.create_room(
        db,
        title=payload.title,
        description=payload.description,
        player_limit=payload.player_limit,
        cover_image_url=payload.cover_image_url,
        master_id=master_id,
    )

    # добавляем мастера в неё с корректной ролью
    await room_member_repository.add_member(
        db, room_id=room.id, user_id=master_id, username=master_username, role=Role.master
    )

    return schemas.RoomOut(
        id=room.id,
        title=room.title,
        description=room.description,
        player_limit=room.player_limit,
        current_players=1,
        master_id=room.master_id,
        cover_image_url=room.cover_image_url,
        created_at=room.created_at,
    )


# получение комнаты и её членов по id
async def get_room_detail(db: AsyncSession, room_id: int) -> Tuple[Rooms, list]:
    room = await room_repository.get_room_by_id(db, room_id)
    if room is None:
        raise HTTPException(status_code=404, detail="Комната не найдена")

    members = await room_member_repository.list_members(db, room_id)
    return room, members


# комната
async def require_room(db: AsyncSession, room_id: int) -> Rooms:
    room = await room_repository.get_room_by_id(db, room_id)
    if room is None:
        raise HTTPException(status_code=404, detail="Комната не найдена")
    return room

# проверка на доступ мастера. Является ли юзер мастером
def require_master(room: Rooms, user_id: int) -> None:
    if room.master_id != user_id:
        raise HTTPException(status_code=403, detail="Недостаточно прав")


# отправка заявки на вступление
async def submit_join_request( db: AsyncSession, room: Rooms, user_id: int, access_token: str) -> JoinRequests:
    existing_member = await room_member_repository.get_member(db, room.id, user_id)
    # участник уже состоит в комнате
    if existing_member is not None:
        raise HTTPException(status_code=409, detail="Вы уже участник этой комнаты")

    # заявка уже отправлена
    pending = await join_request_repository.get_pending_request(db, room.id, user_id)
    if pending is not None:
        raise HTTPException(status_code=409, detail="Заявка уже существует")

    # проверка на кол-во свободных мест
    current_players = await room_repository.count_members(db, room.id)
    if current_players >= room.player_limit:
        raise HTTPException(status_code=409, detail="Комната заполнена")

    username = await auth_client.fetch_current_username(access_token)

    return await join_request_repository.create_request(db, room.id, user_id, username)


# проверка на изменение мастером статуса заявки
async def process_join_request( db: AsyncSession, room: Rooms, request: JoinRequests, new_status: Status) -> JoinRequests:
    # статус заявки не pending
    if request.status != Status.pending:
        raise HTTPException(status_code=400, detail="Заявка уже обработана")

    if new_status == Status.accepted:
        current_players = await room_repository.count_members(db, room.id)
        # если в комнате нет свободных мест
        if current_players >= room.player_limit:
            raise HTTPException(status_code=400, detail="Комната заполнена")

        # если заявка от пользователя, который ещё не состоит в комнате, добавляем его в комнату
        existing_member = await room_member_repository.get_member(db, room.id, request.user_id)
        if existing_member is None:
            await room_member_repository.add_member(
                db, room_id=room.id, user_id=request.user_id, username=request.username, role=Role.player
            )

    # если заявка отклонена, просто записываем в таблицу это
    return await join_request_repository.update_status(db, request, new_status)


# повышение до co-master
async def assign_co_master(db: AsyncSession, room: Rooms, target_user_id: int) -> RoomMember:
    member = await room_member_repository.get_member(db, room.id, target_user_id)
    # человек не найден в комнате
    if member is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден среди участников комнаты")

    # уже является co-master
    if member.role == Role.co_master:
        raise HTTPException(status_code=409, detail="Пользователь уже является co-мастером")

    return await room_member_repository.update_member_role(db, member, Role.co_master)


# снизить у co-master роль до пользователя
async def revoke_co_master(db: AsyncSession, room: Rooms, target_user_id: int) -> None:
    member = await room_member_repository.get_member(db, room.id, target_user_id)
    # пользователь или отсутствует в комнате или не co-master
    if member is None or member.role != Role.co_master:
        raise HTTPException(status_code=404, detail="Co-мастер не найден")

    await room_member_repository.update_member_role(db, member, Role.player)


# выгнать игрока
async def kick_member(db: AsyncSession, room: Rooms, target_user_id: int) -> None:
    member = await room_member_repository.get_member(db, room.id, target_user_id)
    # участник не найден в комнате
    if member is None:
        raise HTTPException(status_code=404, detail="Участник не найден")

    await room_member_repository.remove_member(db, member)


# покинуть комнату
async def leave_room(db: AsyncSession, room: Rooms, user_id: int) -> None:
    # мастер пытается выйти из комнаты
    if user_id == room.master_id:
        raise HTTPException(status_code=409, detail="Мастер не может покинуть комнату")

    member = await room_member_repository.get_member(db, room.id, user_id)

    # попытка выйти из комнаты, в которой не состоишь
    if member is None:
        raise HTTPException(status_code=404, detail="Вы не являетесь участником этой комнаты")

    await room_member_repository.remove_member(db, member)
