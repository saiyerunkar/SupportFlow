import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey, Index
from app.db.types import GUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Ticket(Base):
    __tablename__ = "tickets"
    __table_args__ = (
        Index("ix_tickets_status", "status"),
        Index("ix_tickets_priority", "priority"),
        Index("ix_tickets_type", "ticket_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    ticket_type: Mapped[str] = mapped_column(String(20), nullable=False, default="customer")
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="new")

    customer_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    assigned_agent_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    release_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("releases.id"),
        nullable=True,
        index=True,
    )
    sprint_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("sprints.id"),
        nullable=True,
        index=True,
    )
    component_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("components.id"),
        nullable=True,
        index=True,
    )
    incident_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("incidents.id"),
        nullable=True,
        index=True,
    )
    related_ticket_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("tickets.id"),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    customer = relationship(
        "User",
        back_populates="created_tickets",
        foreign_keys=[customer_id],
    )
    assigned_agent = relationship(
        "User",
        back_populates="assigned_tickets",
        foreign_keys=[assigned_agent_id],
    )
    release = relationship("Release", back_populates="tickets")
    sprint = relationship("Sprint", back_populates="tickets")
    component = relationship("Component", back_populates="tickets")
    incident = relationship("Incident", back_populates="tickets")

    related_ticket = relationship(
        "Ticket",
        remote_side=[id],
        backref="child_related_tickets",
    )

    comments = relationship("Comment", back_populates="ticket", cascade="all, delete-orphan")
    files = relationship("File", back_populates="ticket", cascade="all, delete-orphan")