from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from content_service.app.config import settings
from content_service.app.routers import document_folders, documents, favorites, media, media_folders, search

app = FastAPI(
    title="Content Service",
    description="Медиатека, папки/документы, избранное, глобальный поиск (админка мастера).",
    version="0.1.0",
)

app.include_router(document_folders.router)
app.include_router(documents.router)
app.include_router(media_folders.router)
app.include_router(media.router)
app.include_router(favorites.router)
app.include_router(search.router)

app.mount("/media", StaticFiles(directory=settings.media_storage_path), name="media")


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
