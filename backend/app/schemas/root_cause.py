import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ReleaseCreate(BaseModel):
    name: str
    description: str | None = None


class ReleaseRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SprintCreate(BaseModel):
    name: str


class SprintRead(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComponentCreate(BaseModel):
    name: str
    description: str | None = None


class ComponentRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IncidentCreate(BaseModel):
    title: str
    description: str | None = None


class IncidentRead(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)