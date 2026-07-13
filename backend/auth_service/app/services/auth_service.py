from sqlalchemy.ext.asyncio import AsyncSession

from auth_service.app import schemas, security
from auth_service.app.models import User
from auth_service.app.repositories import refresh_token_repository


async def issue_tokens(
    db: AsyncSession,
    user: User,
) -> schemas.TokenResponse:
    """
    Создание access, refresh токенов для пользователя.
    """

    access_token, expires_in = security.create_access_token(user.id)

    _, refresh_token = await refresh_token_repository.create_refresh_token_record(
        db,
        user.id,
    )

    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        user=schemas.UserPublic.model_validate(user),
    )