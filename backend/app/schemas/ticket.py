import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TicketCreate(BaseModel):
    title: str
    description: str
    ticket_type: str = "customer"
    category: str
    priority: str = "medium"
    status: str = "new"
    customer_id: uuid.UUID
    assigned_agent_id: uuid.UUID | None = None
    release_id: uuid.UUID | None = None
    sprint_id: uuid.UUID | None = None
    component_id: uuid.UUID | None = None
    incident_id: uuid.UUID | None = None
    related_ticket_id: uuid.UUID | None = None


class TicketUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    ticket_type: str | None = None
    category: str | None = None
    priority: str | None = None
    status: str | None = None
    assigned_agent_id: uuid.UUID | None = None
    release_id: uuid.UUID | None = None
    sprint_id: uuid.UUID | None = None
    component_id: uuid.UUID | None = None
    incident_id: uuid.UUID | None = None
    related_ticket_id: uuid.UUID | None = None


class TicketRead(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    ticket_type: str
    category: str
    priority: str
    status: str

    customer_id: uuid.UUID
    assigned_agent_id: uuid.UUID | None
    release_id: uuid.UUID | None
    sprint_id: uuid.UUID | None
    component_id: uuid.UUID | None
    incident_id: uuid.UUID | None
    related_ticket_id: uuid.UUID | None

    customer_name: str | None = None
    assigned_agent_name: str | None = None
    release_name: str | None = None
    sprint_name: str | None = None
    component_name: str | None = None
    incident_title: str | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)