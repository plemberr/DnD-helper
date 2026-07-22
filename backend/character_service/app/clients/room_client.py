from typing import Optional

import httpx
from fastapi import HTTPException, status

from character_service.app.config import settings


async def fetch_room_detail(room_id: int) -> dict:
    """
    Запрашивает у room_service детальную информацию о комнате (включая список участников и их роли)
    :param room_id: id комнаты
    :return: словарь с данными комнаты
    """
    async with httpx.AsyncClient(timeout=settings.room_service_timeout_seconds) as client:
        try:
            response = await client.get(f"{settings.room_service_url}/api/rooms/{room_id}")
        except httpx.RequestError:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Room service недоступен")

    if response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комната не найдена")
    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Не удалось получить данные комнаты")

    return response.json()


async def get_user_role(room_id: int, user_id: int) -> Optional[str]:
    """
    Возвращает роль пользователя в комнате
    :param room_id: id комнаты
    :param user_id: id пользователя
    :return: роль пользователя (master, co_master, player и т.д.) или None, если он не участник комнаты
    """
    room = await fetch_room_detail(room_id)
    for member in room.get("members", []):
        if member.get("user_id") == user_id:
            return member.get("role")
    return None


async def ensure_room_exists(room_id: int) -> None:
    """
    Проверяет, что комната существует. Бросает HTTPException, если комната не найдена или недоступна
    :param room_id: id комнаты
    :return: ничего
    """
    await fetch_room_detail(room_id)


async def is_room_master(room_id: int, user_id: int) -> bool:
    """
    Проверяет, является ли пользователь мастером (или co-мастером) комнаты
    :param room_id: id комнаты
    :param user_id: id пользователя
    :return: True, если пользователь мастер или co-мастер комнаты
    """
    role = await get_user_role(room_id, user_id)
    return role in ("master", "co_master")
