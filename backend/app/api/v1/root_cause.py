from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.ticket import Ticket
from app.db.models.release import Release
from app.db.models.component import Component
from app.db.models.incident import Incident
from app.db.models.sprint import Sprint
from app.schemas.root_cause import (
    ReleaseCreate,
    ReleaseRead,
    SprintCreate,
    SprintRead,
    ComponentCreate,
    ComponentRead,
    IncidentCreate,
    IncidentRead,
)

router = APIRouter(prefix="/system-data", tags=["system-data"])


# ---------------- Releases ----------------

@router.get("/releases", response_model=list[ReleaseRead])
def list_releases(db: Session = Depends(get_db)):
    return db.query(Release).order_by(Release.created_at.desc()).all()


@router.post("/releases", response_model=ReleaseRead)
def create_release(payload: ReleaseCreate, db: Session = Depends(get_db)):
    row = Release(name=payload.name, description=payload.description)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


# ---------------- Sprints ----------------

@router.get("/sprints", response_model=list[SprintRead])
def list_sprints(db: Session = Depends(get_db)):
    return db.query(Sprint).order_by(Sprint.created_at.desc()).all()


@router.post("/sprints", response_model=SprintRead)
def create_sprint(payload: SprintCreate, db: Session = Depends(get_db)):
    row = Sprint(name=payload.name)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


# ---------------- Components ----------------

@router.get("/components", response_model=list[ComponentRead])
def list_components(db: Session = Depends(get_db)):
    return db.query(Component).order_by(Component.created_at.desc()).all()


@router.post("/components", response_model=ComponentRead)
def create_component(payload: ComponentCreate, db: Session = Depends(get_db)):
    row = Component(name=payload.name, description=payload.description)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


# ---------------- Incidents ----------------

@router.get("/incidents", response_model=list[IncidentRead])
def list_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()


@router.post("/incidents", response_model=IncidentRead)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    row = Incident(title=payload.title, description=payload.description)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


# ---------------- Root Cause Graph + Insights ----------------

@router.get("/root-cause")
def get_root_cause_graph(db: Session = Depends(get_db)):
    tickets = db.query(Ticket).all()

    nodes = []
    edges = []
    seen_nodes = set()

    def add_node(node_id: str, label: str, group: str):
        if node_id not in seen_nodes:
            nodes.append({
                "id": node_id,
                "label": label,
                "group": group,
            })
            seen_nodes.add(node_id)

    for ticket in tickets:
        ticket_node_id = f"ticket-{ticket.id}"
        add_node(ticket_node_id, ticket.title[:24], "ticket")

        if ticket.release:
            release_node_id = f"release-{ticket.release.id}"
            add_node(release_node_id, ticket.release.name, "release")
            edges.append({
                "from": ticket_node_id,
                "to": release_node_id,
                "label": "linked_to",
            })

        if ticket.component:
            component_node_id = f"component-{ticket.component.id}"
            add_node(component_node_id, ticket.component.name, "component")
            edges.append({
                "from": ticket_node_id,
                "to": component_node_id,
                "label": "linked_to",
            })

        if ticket.incident:
            incident_node_id = f"incident-{ticket.incident.id}"
            add_node(incident_node_id, ticket.incident.title[:24], "incident")
            edges.append({
                "from": ticket_node_id,
                "to": incident_node_id,
                "label": "caused_by",
            })

    release_spikes = (
        db.query(
            Release.name,
            func.count(Ticket.id).label("count")
        )
        .join(Ticket, Ticket.release_id == Release.id)
        .group_by(Release.id, Release.name)
        .order_by(func.count(Ticket.id).desc())
        .limit(5)
        .all()
    )

    fragile_components = (
        db.query(
            Component.name,
            func.count(Ticket.id).label("count")
        )
        .join(Ticket, Ticket.component_id == Component.id)
        .group_by(Component.id, Component.name)
        .order_by(func.count(Ticket.id).desc())
        .limit(5)
        .all()
    )

    recurring_issues = (
        db.query(
            Ticket.category,
            func.count(Ticket.id).label("count")
        )
        .group_by(Ticket.category)
        .order_by(func.count(Ticket.id).desc())
        .limit(5)
        .all()
    )

    blast_radius = (
        db.query(
            Release.name,
            func.count(Ticket.id).label("count")
        )
        .join(Ticket, Ticket.release_id == Release.id)
        .group_by(Release.id, Release.name)
        .order_by(func.count(Ticket.id).desc())
        .first()
    )

    return {
        "nodes": nodes,
        "edges": edges,
        "insights": {
            "release_spikes": [
                {"label": row[0], "value": row[1]} for row in release_spikes
            ],
            "fragile_components": [
                {"label": row[0], "value": row[1]} for row in fragile_components
            ],
            "recurring_issue_clusters": [
                {"label": row[0], "value": row[1]} for row in recurring_issues
            ],
            "blast_radius": {
                "label": blast_radius[0] if blast_radius else "N/A",
                "value": blast_radius[1] if blast_radius else 0,
            },
        },
    }