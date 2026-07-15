from pydantic import BaseModel, ConfigDict

from knowledge_service.app.models import Type


class SkillOut(BaseModel):
    """Навык, характеристика или спасбросок в ответе API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: Type
    parent_id: int | None
    order_index: int
