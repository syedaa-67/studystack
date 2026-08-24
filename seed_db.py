from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.database import engine, create_db_and_tables
from app.auth import hash_password
from app.models import (
    User, StudyGroup, Member, Deadline, Resource, ResourceVersion,
    ResourceComment, Badge, Notification, PomodoroSession
)

create_db_and_tables()

with Session(engine) as s:
    # ---- Users ----
    users = {}
    for email, pw in [
        ("owner@test.com", "password123"),
        ("alice@test.com", "password123"),
        ("bob@test.com", "password123"),
        ("carol@test.com", "password123"),
    ]:
        existing = s.exec(select(User).where(User.email == email)).first()
        if existing:
            users[email] = existing
        else:
            u = User(email=email, hashed_password=hash_password(pw))
            s.add(u)
            s.commit()
            s.refresh(u)
            users[email] = u

    # ---- Study Groups ----
    group1 = StudyGroup(name="Data Science Study Group", subject="Data Science",
                         description="Weekly ML and stats grind", owner_id=users["owner@test.com"].id)
    group2 = StudyGroup(name="chem club", subject="chemistry",
                         description="Organic chem prep", owner_id=users["owner@test.com"].id)
    s.add(group1); s.add(group2)
    s.commit()
    s.refresh(group1); s.refresh(group2)

    # ---- Members ----
    m_owner = Member(name="Owner", email="owner@test.com", role="owner", points=15, group_id=group1.id, user_id=users["owner@test.com"].id)
    m_alice = Member(name="Alice", email="alice@test.com", role="admin", points=42, group_id=group1.id, user_id=users["alice@test.com"].id)
    m_bob = Member(name="Bob", email="bob@test.com", role="member", points=8, group_id=group1.id, user_id=users["bob@test.com"].id)
    m_carol = Member(name="Carol", email="carol@test.com", role="member", points=20, group_id=group2.id, user_id=users["carol@test.com"].id)
    m_owner2 = Member(name="Owner", email="owner@test.com", role="owner", points=10, group_id=group2.id, user_id=users["owner@test.com"].id)
    for m in [m_owner, m_alice, m_bob, m_carol, m_owner2]:
        s.add(m)
    s.commit()
    for m in [m_owner, m_alice, m_bob, m_carol, m_owner2]:
        s.refresh(m)

    # ---- Deadlines ----
    now = datetime.utcnow()
    deadlines = [
        Deadline(title="Midterm Review", due_date=now - timedelta(days=3), completed=True, completed_at=now - timedelta(days=2), group_id=group1.id, assigned_to_id=m_alice.id),
        Deadline(title="Final Project Submission", due_date=now + timedelta(days=13), completed=False, group_id=group1.id, assigned_to_id=m_bob.id),
        Deadline(title="Kaggle Assignment", due_date=now + timedelta(days=5), completed=False, group_id=group1.id, assigned_to_id=m_owner.id),
        Deadline(title="Titration Lab Report", due_date=now + timedelta(days=7), completed=False, group_id=group2.id, assigned_to_id=m_carol.id),
        Deadline(title="Organic Chem Quiz Prep", due_date=now - timedelta(days=1), completed=True, completed_at=now - timedelta(hours=5), group_id=group2.id, assigned_to_id=m_carol.id),
    ]
    for d in deadlines:
        s.add(d)
    s.commit()

    # ---- Resources + Versions ----
    r1 = Resource(group_id=group1.id, title="Calc II Formula Sheet", resource_type="note", created_by_id=m_alice.id, current_version_number=1)
    r2 = Resource(group_id=group1.id, title="Kaggle Competition Link", resource_type="link", created_by_id=m_bob.id, current_version_number=1)
    r3 = Resource(group_id=group2.id, title="Lab Safety Guide", resource_type="note", created_by_id=m_carol.id, current_version_number=1)
    for r in [r1, r2, r3]:
        s.add(r)
    s.commit()
    for r in [r1, r2, r3]:
        s.refresh(r)

    versions = [
        ResourceVersion(resource_id=r1.id, version_number=1, content="Derivatives, integrals, series cheat sheet.", created_by_id=m_alice.id),
        ResourceVersion(resource_id=r2.id, version_number=1, content="https://kaggle.com/competitions/example", created_by_id=m_bob.id),
        ResourceVersion(resource_id=r3.id, version_number=1, content="Always wear goggles. Never mix acids with bases carelessly.", created_by_id=m_carol.id),
    ]
    for v in versions:
        s.add(v)
    s.commit()

    # ---- Comments ----
    s.add(ResourceComment(resource_id=r1.id, member_id=m_bob.id, content="This helped a lot, thanks!"))
    s.add(ResourceComment(resource_id=r2.id, member_id=m_owner.id, content="Deadline for this is next Friday."))
    s.commit()

    # ---- Badges ----
    s.add(Badge(member_id=m_alice.id, name="First Deadline"))
    s.add(Badge(member_id=m_alice.id, name="5 Completed"))
    s.add(Badge(member_id=m_owner.id, name="First Deadline"))
    s.commit()

    # ---- Notifications ----
    s.add(Notification(member_id=m_bob.id, deadline_id=deadlines[1].id, type="due_soon", message="Final Project Submission is due in 13 days."))
    s.add(Notification(member_id=m_carol.id, deadline_id=deadlines[3].id, type="due_soon", message="Titration Lab Report is due in 7 days."))
    s.commit()

    print("Seed complete.")
    print(f"Group 1: {group1.name} (id={group1.id})")
    print(f"Group 2: {group2.name} (id={group2.id})")
    print("Login as: owner@test.com / alice@test.com / bob@test.com / carol@test.com, password: password123")
