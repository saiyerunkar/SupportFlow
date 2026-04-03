from sqlalchemy import func, case
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.db.session import get_db
from app.db.models.ticket import Ticket
from app.db.models.user import User
from app.db.models.release import Release
from app.db.models.component import Component

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
def get_dashboard_metrics(
    role: str | None = None,
    user_id: str | None = None,
    db: Session = Depends(get_db),
):
    base_query = db.query(Ticket)

    if role == "customer" and user_id:
        base_query = base_query.filter(Ticket.customer_id == user_id)

    total_open_tickets = base_query.filter(Ticket.status != "resolved").count()

    high_priority_tickets = base_query.filter(
        Ticket.priority == "high",
        Ticket.status != "resolved",
    ).count()

    resolved_tickets = base_query.filter(Ticket.status == "resolved").count()
    blocked_tickets = base_query.filter(Ticket.status == "blocked").count()

    category_distribution = (
        base_query.with_entities(Ticket.category, func.count(Ticket.id))
        .group_by(Ticket.category)
        .all()
    )

    agent_workload = []

    if role != "customer":
        agent_workload = (
            db.query(
                User.full_name,
                func.count(Ticket.id).label("ticket_count"),
            )
            .outerjoin(Ticket, Ticket.assigned_agent_id == User.id)
            .filter(User.role.in_(["agent", "admin"]))
            .group_by(User.id, User.full_name)
            .all()
        )

    avg_resolution_time = 0

    return {
        "summary": {
            "total_open_tickets": total_open_tickets,
            "average_resolution_time": avg_resolution_time,
            "high_priority_tickets": high_priority_tickets,
            "resolved_tickets": resolved_tickets,
            "blocked_tickets": blocked_tickets,
        },
        "category_distribution": [
            {"label": row[0], "value": row[1]} for row in category_distribution
        ],
        "agent_workload": [
            {"label": row[0], "value": row[1]} for row in agent_workload
        ],
    }


@router.get("/admin")
def get_admin_analytics(db: Session = Depends(get_db)):
    release_counts = (
        db.query(
            func.coalesce(Release.name, "Unassigned").label("release_name"),
            func.count(Ticket.id).label("ticket_count"),
        )
        .outerjoin(Ticket, Ticket.release_id == Release.id)
        .group_by(Release.name)
        .all()
    )

    customer_internal_breakdown = (
        db.query(
            Ticket.ticket_type,
            func.count(Ticket.id),
        )
        .group_by(Ticket.ticket_type)
        .all()
    )

    fragility_rows = (
        db.query(
            func.coalesce(Component.name, "Unassigned").label("component_name"),
            func.count(Ticket.id).label("linked_tickets"),
            func.sum(
                case((Ticket.priority == "high", 1), else_=0)
            ).label("high_priority_count"),
            func.max(Ticket.updated_at).label("last_occurrence"),
        )
        .outerjoin(Ticket, Ticket.component_id == Component.id)
        .group_by(Component.name)
        .all()
    )

    recurring_indicator = "Release v2.1 is linked to 15 tickets in 2 weeks."

    return {
        "release_ticket_counts": [
            {"label": row[0], "value": row[1]} for row in release_counts
        ],
        "customer_internal_breakdown": [
            {"label": row[0], "value": row[1]} for row in customer_internal_breakdown
        ],
        "fragility_ranking": [
            {
                "component": row[0],
                "linked_tickets": row[1],
                "high_priority_count": row[2] or 0,
                "last_occurrence": row[3].isoformat() if row[3] else None,
            }
            for row in fragility_rows
        ],
        "recurring_issue_indicator": recurring_indicator,
    }