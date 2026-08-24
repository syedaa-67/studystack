from datetime import datetime, timedelta

from sqlmodel import Session, SQLModel

from app.database import engine
from app.auth import hash_password
from app.models import User, StudyGroup, Member, Deadline, Resource, ResourceVersion, ResourceComment


def run():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        owner = User(email="owner@test.com", hashed_password=hash_password("test1234"))
        alice = User(email="alice@test.com", hashed_password=hash_password("test1234"))
        bob = User(email="bob@test.com", hashed_password=hash_password("test1234"))
        session.add_all([owner, alice, bob])
        session.commit()
        session.refresh(owner)
        session.refresh(alice)
        session.refresh(bob)

        group1 = StudyGroup(name="Calculus II", subject="Math", description="Prepping for the midterm", owner_id=owner.id)
        group2 = StudyGroup(name="Organic Chem", subject="Chemistry", description="Reaction mechanisms study group", owner_id=owner.id)
        session.add_all([group1, group2])
        session.commit()
        session.refresh(group1)
        session.refresh(group2)

        m_owner = Member(name="Owner", email=owner.email, role="owner", group_id=group1.id, user_id=owner.id)
        m_alice_admin = Member(name="Alice", email=alice.email, role="admin", group_id=group1.id, user_id=alice.id)
        m_bob_member = Member(name="Bob", email=bob.email, role="member", group_id=group1.id, user_id=bob.id)

        m_owner2 = Member(name="Owner", email=owner.email, role="owner", group_id=group2.id, user_id=owner.id)
        m_bob_member2 = Member(name="Bob", email=bob.email, role="member", group_id=group2.id, user_id=bob.id)

        session.add_all([m_owner, m_alice_admin, m_bob_member, m_owner2, m_bob_member2])
        session.commit()
        session.refresh(m_owner)
        session.refresh(m_alice_admin)
        session.refresh(m_bob_member)

        now = datetime.utcnow()
        deadlines = [
            Deadline(title="Finish Chapter 4 problem set", due_date=now - timedelta(days=6), completed=True, completed_at=now - timedelta(days=6), group_id=group1.id, assigned_to_id=m_bob_member.id),
            Deadline(title="Review integration by parts", due_date=now - timedelta(days=5), completed=True, completed_at=now - timedelta(days=5), group_id=group1.id, assigned_to_id=m_alice_admin.id),
            Deadline(title="Practice exam 1", due_date=now - timedelta(days=4), completed=True, completed_at=now - timedelta(days=4), group_id=group1.id, assigned_to_id=m_bob_member.id),
            Deadline(title="Skipped day (gap for streak test)", due_date=now - timedelta(days=3), completed=False, group_id=group1.id),
            Deadline(title="Series & sequences review", due_date=now - timedelta(days=1), completed=True, completed_at=now - timedelta(days=1), group_id=group1.id, assigned_to_id=m_alice_admin.id),
            Deadline(title="Submit midterm review sheet", due_date=now, completed=True, completed_at=now, group_id=group1.id, assigned_to_id=m_owner.id),
            Deadline(title="Final exam prep", due_date=now + timedelta(days=5), completed=False, group_id=group1.id, assigned_to_id=m_bob_member.id),
            Deadline(title="Group study session", due_date=now + timedelta(days=2), completed=False, group_id=group1.id),
        ]
        session.add_all(deadlines)

        note = Resource(group_id=group1.id, title="Calc II Formula Sheet", resource_type="note", created_by_id=m_owner.id, current_version_number=2)
        session.add(note)
        session.commit()
        session.refresh(note)

        v1 = ResourceVersion(resource_id=note.id, version_number=1, content="Basic derivative and integral rules.", change_summary="Initial version", created_by_id=m_owner.id, created_at=now - timedelta(days=6))
        v2 = ResourceVersion(resource_id=note.id, version_number=2, content="Basic derivative and integral rules.\n\nAdded: integration by parts, series convergence tests.", change_summary="Added series + IBP", created_by_id=m_alice_admin.id, created_at=now - timedelta(days=1))
        session.add_all([v1, v2])

        link = Resource(group_id=group1.id, title="Khan Academy - Series", resource_type="link", created_by_id=m_bob_member.id, current_version_number=1)
        session.add(link)
        session.commit()
        session.refresh(link)
        link_v1 = ResourceVersion(resource_id=link.id, version_number=1, content="https://www.khanacademy.org/math/ap-calculus-bc", change_summary="Initial version", created_by_id=m_bob_member.id, created_at=now - timedelta(days=3))
        session.add(link_v1)
        session.commit()

        comment = ResourceComment(resource_id=note.id, member_id=m_bob_member.id, content="This really helped, thanks!", created_at=now - timedelta(hours=6))
        session.add(comment)

        session.commit()

    print("Seed complete. Login with any of:")
    print("  owner@test.com / test1234  (owner in both groups)")
    print("  alice@test.com / test1234  (admin in Calculus II)")
    print("  bob@test.com    / test1234 (member in both groups)")


if __name__ == "__main__":
    run()
