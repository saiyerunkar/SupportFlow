import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.ticket import Ticket
from app.db.models.user import User
from app.db.models.comment import Comment
from app.schemas.ticket import TicketCreate, TicketRead, TicketUpdate
from app.schemas.comment import CommentCreate, CommentRead

router = APIRouter(prefix="/tickets", tags=["tickets"])


def serialize_ticket(ticket: Ticket):
    return {
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "ticket_type": ticket.ticket_type,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": ticket.status,
        "customer_id": ticket.customer_id,
        "assigned_agent_id": ticket.assigned_agent_id,
        "release_id": ticket.release_id,
        "sprint_id": ticket.sprint_id,
        "component_id": ticket.component_id,
        "incident_id": ticket.incident_id,
        "related_ticket_id": ticket.related_ticket_id,
        "customer_name": ticket.customer.full_name if ticket.customer else None,
        "assigned_agent_name": ticket.assigned_agent.full_name if ticket.assigned_agent else None,
        "release_name": ticket.release.name if ticket.release else None,
        "sprint_name": ticket.sprint.name if ticket.sprint else None,
        "component_name": ticket.component.name if ticket.component else None,
        "incident_title": ticket.incident.title if ticket.incident else None,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
    }


def serialize_comment(comment: Comment):
    return {
        "id": comment.id,
        "body": comment.body,
        "is_internal": comment.is_internal,
        "author_id": comment.author_id,
        "ticket_id": comment.ticket_id,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
    }


@router.post("/", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    customer = db.query(User).filter(User.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    if payload.assigned_agent_id:
        agent = db.query(User).filter(User.id == payload.assigned_agent_id).first()
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned agent not found.",
            )

    ticket_type = "customer" if customer.role == "customer" else "internal"

    ticket = Ticket(
        title=payload.title,
        description=payload.description,
        ticket_type=ticket_type,
        category=payload.category,
        priority=payload.priority,
        status=payload.status,
        customer_id=payload.customer_id,
        assigned_agent_id=payload.assigned_agent_id,
        release_id=payload.release_id,
        sprint_id=payload.sprint_id,
        component_id=payload.component_id,
        incident_id=payload.incident_id,
        related_ticket_id=payload.related_ticket_id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)


@router.get("/", response_model=list[TicketRead])
def list_tickets(
    role: str | None = None,
    user_id: uuid.UUID | None = None,
    status_filter: str | None = None,
    priority_filter: str | None = None,
    type_filter: str | None = None,
    assigned_agent_id: uuid.UUID | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(Ticket)
        .options(
            joinedload(Ticket.customer),
            joinedload(Ticket.assigned_agent),
            joinedload(Ticket.release),
            joinedload(Ticket.sprint),
            joinedload(Ticket.component),
            joinedload(Ticket.incident),
        )
    )

    if role == "customer" and user_id:
        query = query.filter(Ticket.customer_id == user_id)

    if status_filter:
        query = query.filter(Ticket.status == status_filter)

    if priority_filter:
        query = query.filter(Ticket.priority == priority_filter)

    if type_filter:
        query = query.filter(Ticket.ticket_type == type_filter)

    if assigned_agent_id:
        query = query.filter(Ticket.assigned_agent_id == assigned_agent_id)

    if search:
        query = query.filter(Ticket.title.ilike(f"%{search}%"))

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return [serialize_ticket(ticket) for ticket in tickets]
    role: str | None = None,
    user_id: uuid.UUID | None = None,
    status_filter: str | None = None,
    priority_filter: str | None = None,
    type_filter: str | None = None,
    assigned_agent_id: uuid.UUID | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),


@router.get("/{ticket_id}", response_model=TicketRead)
def get_ticket(ticket_id: uuid.UUID, db: Session = Depends(get_db)):
    ticket = (
        db.query(Ticket)
        .options(
            joinedload(Ticket.customer),
            joinedload(Ticket.assigned_agent),
            joinedload(Ticket.release),
            joinedload(Ticket.sprint),
            joinedload(Ticket.component),
            joinedload(Ticket.incident),
        )
        .filter(Ticket.id == ticket_id)
        .first()
    )
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found.",
        )
    return serialize_ticket(ticket)


@router.patch("/{ticket_id}", response_model=TicketRead)
def update_ticket(ticket_id: uuid.UUID, payload: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found.",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)

    ticket = (
        db.query(Ticket)
        .options(
            joinedload(Ticket.customer),
            joinedload(Ticket.assigned_agent),
            joinedload(Ticket.release),
            joinedload(Ticket.sprint),
            joinedload(Ticket.component),
            joinedload(Ticket.incident),
        )
        .filter(Ticket.id == ticket_id)
        .first()
    )
    return serialize_ticket(ticket)


@router.get("/{ticket_id}/comments", response_model=list[CommentRead])
def list_ticket_comments(ticket_id: uuid.UUID, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found.",
        )

    comments = (
        db.query(Comment)
        .filter(Comment.ticket_id == ticket_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [serialize_comment(comment) for comment in comments]


@router.post("/{ticket_id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
def create_ticket_comment(
    ticket_id: uuid.UUID,
    payload: CommentCreate,
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found.",
        )

    author_id = ticket.customer_id

    comment = Comment(
        body=payload.body,
        is_internal=payload.is_internal,
        ticket_id=ticket_id,
        author_id=author_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return serialize_comment(comment)