# Auth Service — микросервис авторизации (JWT RS256, access + refresh)

Стек: **Python 3.12, FastAPI, SQLAlchemy 2.0 (async), PostgreSQL (asyncpg), Alembic, PyJWT (RS256), passlib (argon2id)**.

## Ручки API

- `POST /auth/register` — регистрация 
- `POST /auth/login` — логин по username или email
- `POST /auth/refresh` — обновление токенов с ротацией refresh-токена
- `POST /auth/logout` — отзыв конкретного refresh-токена, требует access-токен
- `GET /auth/me` — данные текущего пользователя по access-токену
- `PATCH /auth/me` — обновление профиля (username, avatar_url)
- `PATCH /auth/me/password` — смена пароля

Access-токен живёт 15 минут, refresh — 30 дней (настраивается в `.env`).

## 1. Генерация RSA-ключей (RS256)

JWT (access-токены) подписывается приватным ключом и проверяется публичным. Ключи кладутся в папку `keys/`

```bash
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

Пути к ключам настраиваются в `.env` (`JWT_PRIVATE_KEY_PATH`, `JWT_PUBLIC_KEY_PATH`).

---

## 2. Миграции (Alembic)

Схема БД управляется миграциями — `Base.metadata.create_all`.

```bash
pip install -r requirements.txt 
alembic upgrade head # применить все миграции
```

`alembic upgrade head` также автоматически выполняется при старте контейнера в Docker.

---

## 3. Запуск через Docker

Поднимает PostgreSQL, применяет миграции и стартует сервис. Ключи должны быть сгенерированы заранее.

```bash
docker compose up --build
```

Сервис на `http://localhost:8000`, документация Swagger на `http://localhost:8000/docs`.

---

## 4. Структура проекта

```
auth-service/
├── app/
│   ├── main.py                 # точка входа FastAPI
│   ├── config.py               # настройки (.env), загрузка RSA-ключей 
│   ├── schemas.py              # Pydantic-схемы запросов/ответов
│   ├── security.py             # хэширование паролей (argon2id/bcrypt), JWT, refresh-токены
│   ├── crud.py                 # операции с БД
│   ├── dependencies.py         # get_current_user (проверка access-токена)
│   ├── routers/
│   │   └── auth.py             # /auth/register /login /refresh /logout /me (GET+PATCH) /me/password
│   ├── db/
│   │   ├── database.py         # базовый класс для БД
│   │   └── session.py          # функция get_db, сессия с БД
│   └── models/
│       ├── refresh_tokens.py   # моделька refresh_tokens
│       └── users.py            # моделька users
│
├── migrations/                 # Alembic
│   ├── env.py
│   └── versions/
│       └── 0001_initial_schema.py
│
├── keys/                       # private.pem / public.pem
├── alembic.ini
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 5. Схема БД

**users**

| Поле | Тип | Прим. |
|---|---|---|
| id | int, PK | |
| username | varchar(50), UK | |
| email | varchar(255), UK | |
| hashed_password | varchar(255) | argon2id / bcrypt |
| avatar_url | varchar(255) | null |
| created_at | timestamp | |

**refresh_tokens**

| Поле | Тип | Прим. |
|---|---|---|
| id | int, PK | |
| user_id | int, FK → users.id | ON DELETE CASCADE |
| token_hash | varchar(255), UK | SHA-256 |
| expires_at | timestamp | |
| revoked_reason | varchar(50), null | logout / rotated / reuse_detected / password_changed / admin |
| created_at | timestamp | |
| replaced_by | int, FK → refresh_tokens.id, null | цепочка ротации |
