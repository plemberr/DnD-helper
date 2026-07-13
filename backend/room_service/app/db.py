from common.db import Base, DatabaseSessionManager
from room_service.app.config import settings

db_manager = DatabaseSessionManager(settings.database_url, echo=False)

engine = db_manager.engine
AsyncSessionLocal = db_manager.sessionmaker
get_db = db_manager.get_db

__all__ = ["Base", "engine", "AsyncSessionLocal", "get_db"]
