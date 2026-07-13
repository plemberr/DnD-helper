#!/bin/sh

set -e

echo "run migrations"
alembic upgrade head

echo "starting auth-service"

uvicorn auth_service.app.main:app \
    --host 0.0.0.0 \
    --port 8001 &

echo "starting room-service"

uvicorn room_service.app.main:app \
    --host 0.0.0.0 \
    --port 8002 &

echo "starting content-service"

uvicorn content_service.app.main:app \
    --host 0.0.0.0 \
    --port 8003 &

wait