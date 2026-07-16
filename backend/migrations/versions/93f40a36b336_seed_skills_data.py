"""seed skills data

Revision ID: 93f40a36b336
Revises: b6f171af01ac
Create Date: 2026-07-15 06:56:59.228518

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "<...>"
down_revision: Union[str, Sequence[str], None] = "b6f171af01ac"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


skills_table = sa.table(
    "skills",
    sa.column("id", sa.Integer),
    sa.column("name", sa.String),
    sa.column("type", sa.Enum("ability", "saving_throw", "skill", name="skill_type")),
    sa.column("parent_id", sa.Integer),
    sa.column("order_index", sa.Integer),
)

SEED_DATA = [
    # Сила
    {"id": 1, "name": "Сила", "type": "ability", "parent_id": None, "order_index": 1},
    {"id": 2, "name": "Спасбросок Силы", "type": "saving_throw", "parent_id": 1, "order_index": 1},
    {"id": 3, "name": "Атлетика", "type": "skill", "parent_id": 1, "order_index": 1},

    # Ловкость
    {"id": 4, "name": "Ловкость", "type": "ability", "parent_id": None, "order_index": 2},
    {"id": 5, "name": "Спасбросок Ловкости", "type": "saving_throw", "parent_id": 4, "order_index": 1},
    {"id": 6, "name": "Акробатика", "type": "skill", "parent_id": 4, "order_index": 1},
    {"id": 7, "name": "Ловкость рук", "type": "skill", "parent_id": 4, "order_index": 2},
    {"id": 8, "name": "Скрытность", "type": "skill", "parent_id": 4, "order_index": 3},

    # Телосложение
    {"id": 9, "name": "Телосложение", "type": "ability", "parent_id": None, "order_index": 3},
    {"id": 10, "name": "Спасбросок Телосложения", "type": "saving_throw", "parent_id": 9, "order_index": 1},

    # Интеллект
    {"id": 11, "name": "Интеллект", "type": "ability", "parent_id": None, "order_index": 4},
    {"id": 12, "name": "Спасбросок Интеллекта", "type": "saving_throw", "parent_id": 11, "order_index": 1},
    {"id": 13, "name": "Анализ", "type": "skill", "parent_id": 11, "order_index": 1},
    {"id": 14, "name": "История", "type": "skill", "parent_id": 11, "order_index": 2},
    {"id": 15, "name": "Магия", "type": "skill", "parent_id": 11, "order_index": 3},
    {"id": 16, "name": "Природа", "type": "skill", "parent_id": 11, "order_index": 4},
    {"id": 17, "name": "Религия", "type": "skill", "parent_id": 11, "order_index": 5},

    # Мудрость
    {"id": 18, "name": "Мудрость", "type": "ability", "parent_id": None, "order_index": 5},
    {"id": 19, "name": "Спасбросок Мудрости", "type": "saving_throw", "parent_id": 18, "order_index": 1},
    {"id": 20, "name": "Восприятие", "type": "skill", "parent_id": 18, "order_index": 1},
    {"id": 21, "name": "Выживание", "type": "skill", "parent_id": 18, "order_index": 2},
    {"id": 22, "name": "Медицина", "type": "skill", "parent_id": 18, "order_index": 3},
    {"id": 23, "name": "Проницательность", "type": "skill", "parent_id": 18, "order_index": 4},
    {"id": 24, "name": "Уход за животными", "type": "skill", "parent_id": 18, "order_index": 5},

    # Харизма
    {"id": 25, "name": "Харизма", "type": "ability", "parent_id": None, "order_index": 6},
    {"id": 26, "name": "Спасбросок Харизмы", "type": "saving_throw", "parent_id": 25, "order_index": 1},
    {"id": 27, "name": "Выступление", "type": "skill", "parent_id": 25, "order_index": 1},
    {"id": 28, "name": "Запугивание", "type": "skill", "parent_id": 25, "order_index": 2},
    {"id": 29, "name": "Обман", "type": "skill", "parent_id": 25, "order_index": 3},
    {"id": 30, "name": "Убеждение", "type": "skill", "parent_id": 25, "order_index": 4},
]


def upgrade() -> None:
    """Upgrade schema."""
    op.bulk_insert(skills_table, SEED_DATA)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DELETE FROM skills")