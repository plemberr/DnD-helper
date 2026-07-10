import httpx
from fastapi import HTTPException

from room_service.app.config import settings


# получение username по токену
async def fetch_current_username(access_token: str) -> str:
    async with httpx.AsyncClient(timeout=settings.auth_service_timeout_seconds) as client:
        try:
            # отправка запроса get me
            response = await client.get(
                f"{settings.auth_service_url}/auth/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Auth service недоступен")

    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Access token истек или невалиден")
    if response.status_code != 200:
        raise HTTPException(status_code=503, detail="Не удалось получить данные")

    return response.json()["username"]
