"""create knowledge tables

Revision ID: b6f171af01ac
Revises: c02537c98474
Create Date: 2026-07-15 06:04:37.351036

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b6f171af01ac'
down_revision: Union[str, Sequence[str], None] = 'c02537c98474'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('skills',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=60), nullable=False),
    sa.Column('type', sa.Enum('ability', 'saving_throw', 'skill', name='skill_type'), nullable=False),
    sa.Column('parent_id', sa.Integer(), nullable=True),
    sa.Column('order_index', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['parent_id'], ['skills.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('skills')
    sa.Enum(name='skill_type').drop(op.get_bind(), checkfirst=True)
