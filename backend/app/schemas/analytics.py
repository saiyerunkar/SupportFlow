from pydantic import BaseModel


class MetricPoint(BaseModel):
    label: str
    value: int


class FragilityRow(BaseModel):
    component: str
    linked_tickets: int
    high_priority_count: int
    last_occurrence: str | None = None