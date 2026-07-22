from typing import List, Tuple

import httpx
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from room_service.app import schemas
from room_service.app.config import settings
from room_service.app.models import JoinRequests, Role, Rooms, RoomMember, Status
from room_service.app.repositories import join_request_repository, room_member_repository, room_repository


async def _fetch_current_username(access_token: str) -> str:
    """
    Запрашивает у auth_service username пользователя по его access-токену.
    :param access_token: access-токен пользователя
    :return: username пользователя
    """
    async with httpx.AsyncClient(timeout=settings.auth_service_timeout_seconds) as client:
        try:
            response = await client.get(
                f"{settings.auth_service_url}/api/auth/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )
        except httpx.RequestError:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Auth service недоступен")

    if response.status_code == status.HTTP_401_UNAUTHORIZED:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token истек или невалиден")
    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Не удалось получить данные")

    return response.json()["username"]


async def create_room(db: AsyncSession, master_id: int, access_token: str, payload: schemas.RoomCreate) -> schemas.RoomOut:
    """
    Создаёт комнату и сразу добавляет создателя в число участников с ролью мастера.
    :param db: сессия БД
    :param master_id: id пользователя, создающего комнату (становится мастером)
    :param access_token: access-токен создателя, нужен для получения его username
    :param payload: данные создаваемой комнаты
    :return: созданная комната (RoomOut)
    """
    master_username = await _fetch_current_username(access_token)

    room = await room_repository.create_room(
        db,
        title=payload.title,
        description=payload.description,
        player_limit=payload.player_limit,
        cover_image_url=payload.cover_image_url,
        master_id=master_id,
    )

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


async def get_room_detail(db: AsyncSession, room_id: int) -> Tuple[Rooms, List[RoomMember]]:
    """
    Возвращает комнату вместе со списком её участников.
    :param db: сессия БД
    :param room_id: id комнаты
    :return: кортеж (комната, список участников)
    """
    room = await room_repository.get_room_by_id(db, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комната не найдена")

    members = await room_member_repository.list_members(db, room_id)
    return room, members


async def require_room(db: AsyncSession, room_id: int) -> Rooms:
    """
    Возвращает комнату по id или выбрасывает 404, если она не существует.
    :param db: сессия БД
    :param room_id: id комнаты
    :return: найденная комната
    """
    room = await room_repository.get_room_by_id(db, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комната не найдена")
    return room


def require_master(room: Rooms, user_id: int) -> None:
    """
    Проверяет, является ли пользователь мастером комнаты, иначе выбрасывает 403.
    :param room: проверяемая комната
    :param user_id: id проверяемого пользователя
    :return: ничего
    """
    if room.master_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")


async def submit_join_request(db: AsyncSession, room: Rooms, user_id: int, access_token: str) -> JoinRequests:
    """
    Отправляет заявку на вступление в комнату от лица пользователя.
    :param db: сессия БД
    :param room: комната, в которую подаётся заявка
    :param user_id: id пользователя, отправляющего заявку
    :param access_token: access-токен пользователя, нужен для получения его username
    :return: созданная заявка
    """
    existing_member = await room_member_repository.get_member(db, room.id, user_id)
    if existing_member is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Вы уже участник этой комнаты")

    pending = await join_request_repository.get_pending_request(db, room.id, user_id)
    if pending is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Заявка уже существует")

    current_players = await room_repository.count_members(db, room.id)
    if current_players >= room.player_limit:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Комната заполнена")

    username = await _fetch_current_username(access_token)

    return await join_request_repository.create_request(db, room.id, user_id, username)


async def process_join_request(db: AsyncSession, room: Rooms, request: JoinRequests, new_status: Status) -> JoinRequests:
    """
    Обрабатывает заявку на вступление мастером (принимает или отклоняет).
    При принятии добавляет пользователя в число участников комнаты, если для него ещё есть место.
    :param db: сессия БД
    :param room: комната, к которой относится заявка
    :param request: обрабатываемая заявка
    :param new_status: новый статус заявки (accepted или rejected)
    :return: обновлённая заявка
    """
    if request.status != Status.pending:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Заявка уже обработана")

    if new_status == Status.accepted:
        current_players = await room_repository.count_members(db, room.id)
        if current_players >= room.player_limit:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Комната заполнена")

        existing_member = await room_member_repository.get_member(db, room.id, request.user_id)
        if existing_member is None:
            await room_member_repository.add_member(
                db, room_id=room.id, user_id=request.user_id, username=request.username, role=Role.player
            )

    return await join_request_repository.update_status(db, request, new_status)


async def assign_co_master(db: AsyncSession, room: Rooms, target_user_id: int) -> RoomMember:
    """
    Повышает участника комнаты до co-мастера.
    :param db: сессия БД
    :param room: комната
    :param target_user_id: id участника, повышаемого до co-мастера
    :return: обновлённый участник комнаты
    """
    member = await room_member_repository.get_member(db, room.id, target_user_id)
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден среди участников комнаты")

    if member.role == Role.co_master:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Пользователь уже является co-мастером")

    return await room_member_repository.update_member_role(db, member, Role.co_master)


async def revoke_co_master(db: AsyncSession, room: Rooms, target_user_id: int) -> None:
    """
    Снижает роль co-мастера до обычного игрока.
    :param db: сессия БД
    :param room: комната
    :param target_user_id: id участника, у которого снимается роль co-мастера
    :return: ничего
    """
    member = await room_member_repository.get_member(db, room.id, target_user_id)
    if member is None or member.role != Role.co_master:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Co-мастер не найден")

    await room_member_repository.update_member_role(db, member, Role.player)


async def kick_member(db: AsyncSession, room: Rooms, target_user_id: int) -> None:
    """
    Исключает участника из комнаты.
    :param db: сессия БД
    :param room: комната
    :param target_user_id: id исключаемого участника
    :return: ничего
    """
    member = await room_member_repository.get_member(db, room.id, target_user_id)
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Участник не найден")

    await room_member_repository.remove_member(db, member)


async def leave_room(db: AsyncSession, room: Rooms, user_id: int) -> None:
    """
    Позволяет участнику покинуть комнату (мастер не может покинуть свою комнату).
    :param db: сессия БД
    :param room: комната
    :param user_id: id пользователя, покидающего комнату
    :return: ничего
    """
    if user_id == room.master_id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Мастер не может покинуть комнату")

    member = await room_member_repository.get_member(db, room.id, user_id)

    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Вы не являетесь участником этой комнаты")

    await room_member_repository.remove_member(db, member)
