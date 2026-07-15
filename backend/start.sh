#!/bin/sh

set -e

echo "run migrations"
alembic upgrade head

echo "starting auth-service"

uvicorn auth_service.app.main:app \
    --host 0.0.0.0 \
    --port "${AUTH_SERVICE_PORT:-8001}" &

echo "starting room-service"

uvicorn room_service.app.main:app \
    --host 0.0.0.0 \
    --port "${ROOM_SERVICE_PORT:-8002}" &

echo "starting content-service"

uvicorn content_service.app.main:app \
    --host 0.0.0.0 \
    --port "${CONTENT_SERVICE_PORT:-8003}" &

echo "starting knowledge-service"

uvicorn knowledge_service.app.main:app \
    --host 0.0.0.0 \
    --port "${KNOWLEDGE_SERVICE_PORT:-8005}" &

wait