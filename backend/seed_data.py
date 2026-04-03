import random
from datetime import datetime, timedelta, timezone

from app.db.session import SessionLocal, Base, engine
from app.db import base  # noqa: F401

from app.db.models.user import User
from app.db.models.release import Release
from app.db.models.sprint import Sprint
from app.db.models.component import Component
from app.db.models.incident import Incident
from app.db.models.ticket import Ticket
from app.db.models.comment import Comment
from app.db.models.file import File


random.seed(42)


def utc_now():
    return datetime.now(timezone.utc)


def random_past_date(days_back: int = 45):
    now = utc_now()
    return now - timedelta(
        days=random.randint(0, days_back),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )


def main():
    db = SessionLocal()

    try:
        # Ensure tables exist
        Base.metadata.create_all(bind=engine)

        # Optional cleanup for reseeding
        db.query(Comment).delete()
        db.query(File).delete()
        db.query(Ticket).delete()
        db.query(Incident).delete()
        db.query(Component).delete()
        db.query(Sprint).delete()
        db.query(Release).delete()
        db.query(User).delete()
        db.commit()

        print("Old seed data cleared.")

        # -----------------------------
        # Users
        # -----------------------------
        users = [
            User(full_name="Sai Yerunkar", email="sai@example.com", role="customer"),
            User(full_name="Alex Customer", email="alex@example.com", role="customer"),
            User(full_name="Jordan Customer", email="jordan@example.com", role="customer"),
            User(full_name="Shreyas Bhoyar", email="shreyas@example.com", role="agent"),
            User(full_name="Morgan Agent", email="morgan@example.com", role="agent"),
            User(full_name="Priya Admin", email="priya@example.com", role="admin"),
        ]
        db.add_all(users)
        db.commit()

        customers = [u for u in users if u.role == "customer"]
        agents = [u for u in users if u.role in ("agent", "admin")]

        print("Users seeded.")

        # -----------------------------
        # Releases
        # -----------------------------
        releases = [
            Release(name="v1.0", description="Initial release"),
            Release(name="v1.1", description="Minor fixes and UI improvements"),
            Release(name="v2.0", description="Major feature rollout"),
            Release(name="v2.1", description="Authentication and dashboard changes"),
        ]
        db.add_all(releases)
        db.commit()

        print("Releases seeded.")

        # -----------------------------
        # Sprints
        # -----------------------------
        sprints = [
            Sprint(name="Sprint 1"),
            Sprint(name="Sprint 2"),
            Sprint(name="Sprint 3"),
        ]
        db.add_all(sprints)
        db.commit()

        print("Sprints seeded.")

        # -----------------------------
        # Components
        # -----------------------------
        components = [
            Component(name="Auth Service", description="Authentication and login logic"),
            Component(name="Payment API", description="Payment processing service"),
            Component(name="Dashboard UI", description="Frontend dashboard module"),
            Component(name="Notification Service", description="Email and alerts"),
            Component(name="Ticket Engine", description="Ticket workflow service"),
        ]
        db.add_all(components)
        db.commit()

        print("Components seeded.")

        # -----------------------------
        # Incidents
        # -----------------------------
        incidents = [
            Incident(title="Login outage", description="Users unable to log in"),
            Incident(title="Payment timeout", description="Checkout API timeout under load"),
            Incident(title="Dashboard load failure", description="Dashboard widgets not loading"),
            Incident(title="Notification delay", description="Emails are delayed"),
        ]
        db.add_all(incidents)
        db.commit()

        print("Incidents seeded.")

        # -----------------------------
        # Ticket templates
        # -----------------------------
        ticket_templates = [
            ("Login fails on mobile", "Users are unable to log in from the mobile app.", "Authentication"),
            ("Password reset email not received", "Password reset emails are not arriving.", "Authentication"),
            ("Checkout timeout", "Payment requests time out during checkout.", "Billing"),
            ("Duplicate charge reported", "Customer reports duplicate payment charge.", "Billing"),
            ("Dashboard widgets not loading", "Analytics cards fail to render.", "UI"),
            ("Slow page load on tickets screen", "Ticket list page is very slow.", "Performance"),
            ("Notification email delayed", "Support notifications arrive late.", "Notifications"),
            ("Kanban drag and drop glitch", "Ticket cards do not update position correctly.", "Workflow"),
            ("Search filter not working", "Filtering tickets by priority gives wrong results.", "Workflow"),
            ("Internal auth token error", "Agents see token validation errors in logs.", "Internal"),
            ("Payment API intermittent failure", "Service returns 500s under peak load.", "Internal"),
            ("Dashboard chart mismatch", "Admin chart values do not match DB counts.", "Internal"),
        ]

        priorities = ["high", "medium", "low"]
        statuses = ["new", "in_progress", "blocked", "resolved"]

        all_tickets = []

        # -----------------------------
        # Create 36 tickets
        # -----------------------------
        for i in range(36):
            title, description, category = random.choice(ticket_templates)

            creator = random.choice(users)
            assigned_agent = random.choice(agents) if random.random() < 0.8 else None

            linked_release = random.choice(releases) if random.random() < 0.75 else None
            linked_sprint = random.choice(sprints) if random.random() < 0.8 else None
            linked_component = random.choice(components) if random.random() < 0.85 else None
            linked_incident = random.choice(incidents) if random.random() < 0.45 else None

            created_at = random_past_date(50)
            status = random.choices(
                statuses,
                weights=[0.25, 0.25, 0.15, 0.35],
                k=1,
            )[0]

            resolved_at = None
            if status == "resolved":
                resolved_at = created_at + timedelta(
                    hours=random.randint(4, 96),
                    minutes=random.randint(0, 59),
                )

            ticket_type = "customer" if creator.role == "customer" else "internal"

            ticket = Ticket(
                title=f"{title} #{i+1}",
                description=description,
                ticket_type=ticket_type,
                category=category,
                priority=random.choices(priorities, weights=[0.35, 0.45, 0.20], k=1)[0],
                status=status,
                customer_id=creator.id,
                assigned_agent_id=assigned_agent.id if assigned_agent else None,
                release_id=linked_release.id if linked_release else None,
                sprint_id=linked_sprint.id if linked_sprint else None,
                component_id=linked_component.id if linked_component else None,
                incident_id=linked_incident.id if linked_incident else None,
                related_ticket_id=None,
                created_at=created_at,
                updated_at=resolved_at if resolved_at else created_at + timedelta(hours=random.randint(1, 24)),
            )

            if resolved_at:
                ticket.updated_at = resolved_at

            db.add(ticket)
            db.flush()  # gives us ticket.id before commit
            all_tickets.append(ticket)

            # Add 1–3 comments
            comment_count = random.randint(1, 3)
            for _ in range(comment_count):
                author = random.choice(users)
                comment_time = ticket.created_at + timedelta(hours=random.randint(1, 48))
                comment = Comment(
                    body=random.choice([
                        "Investigating this issue.",
                        "Able to reproduce on staging.",
                        "Escalating to engineering.",
                        "Customer provided more details.",
                        "Issue appears linked to recent release.",
                        "This seems intermittent.",
                        "Monitoring the situation.",
                    ]),
                    is_internal=(author.role in ("agent", "admin") and random.random() < 0.5),
                    ticket_id=ticket.id,
                    author_id=author.id,
                    created_at=comment_time,
                    updated_at=comment_time,
                )
                db.add(comment)

        db.commit()

        # -----------------------------
        # Add related tickets after all exist
        # -----------------------------
        for ticket in all_tickets:
            if random.random() < 0.3:
                candidates = [t for t in all_tickets if t.id != ticket.id]
                if candidates:
                    ticket.related_ticket_id = random.choice(candidates).id

        db.commit()

        print("Tickets and comments seeded.")

        # -----------------------------
        # Print summary
        # -----------------------------
        print("\nSeed complete.")
        print(f"Users: {db.query(User).count()}")
        print(f"Releases: {db.query(Release).count()}")
        print(f"Sprints: {db.query(Sprint).count()}")
        print(f"Components: {db.query(Component).count()}")
        print(f"Incidents: {db.query(Incident).count()}")
        print(f"Tickets: {db.query(Ticket).count()}")
        print(f"Comments: {db.query(Comment).count()}")

    finally:
        db.close()


if __name__ == "__main__":
    main()