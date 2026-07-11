from common.db import Base, DatabaseSessionManager
from content_service.app.config import settings

db_manager = DatabaseSessionManager(settings.database_url, echo=False)

engine = db_manager.engine
AsyncSessionLocal = db_manager.sessionmaker # фабрика сессий
get_db = db_manager.get_db

__all__ = ["Base", "engine", "AsyncSessionLocal", "get_db"]
