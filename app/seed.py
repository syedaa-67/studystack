import random
from datetime import datetime, timedelta
from sqlmodel import Session, select, delete
from app.database import engine
from app.models import (
    User, StudyGroup, Member, Deadline, Resource, ResourceVersion,
    ResourceComment, Badge, Notification, PomodoroSession
)
from app.auth import hash_password

random.seed(42)

def run():
    with Session(engine) as s:
        print("Clearing existing data...")
        s.exec(delete(ResourceComment))
        s.exec(delete(ResourceVersion))
        s.exec(delete(Resource))
        s.exec(delete(Notification))
        s.exec(delete(Deadline))
        s.exec(delete(Badge))
        s.exec(delete(PomodoroSession))
        s.exec(delete(Member))
        s.exec(delete(StudyGroup))
        s.exec(delete(User))
        s.commit()
        print("Cleared data")

        user = User(email="syeda@test.com", hashed_password=hash_password("syeda123"))
        s.add(user)
        s.commit()
        s.refresh(user)

        group1 = StudyGroup(name="Data Science Study Group", subject="Data Science")
        group2 = StudyGroup(name="chem club", subject="Chemistry")
        s.add(group1); s.add(group2)
        s.commit()
        s.refresh(group1); s.refresh(group2)
        print("Created groups")

        owner = Member(name="Test User", email="syeda@test.com", role="admin", points=45, group_id=group1.id, user_id=user.id)
        s.add(owner)
        s.commit()
        s.refresh(owner)

       # Point owner_id to the User's ID, not the Member's ID
        group1.owner_id = user.id

        s.add(group1)
        s.commit()
        print("Created owner")

        members_g1_data = [
            ("Alice Johnson", "alice@test.com", "member", 30),
            ("Bob Smith", "bob@test.com", "member", 25),
            ("Carol Davis", "carol@test.com", "member", 20),
            ("Diya Patel", "diya@test.com", "member", 38),
            ("Ethan Kim", "ethan@test.com", "member", 12),
        ]
        members_g1 = [owner]
        for name, email, role, points in members_g1_data:
            m = Member(name=name, email=email, role=role, points=points, group_id=group1.id)
            s.add(m)
            members_g1.append(m)
        s.commit()
        for m in members_g1:
            s.refresh(m)
        print(f"Created {len(members_g1)} members in group 1")

        members_g2_data = [
            ("Dana Lee", "dana@test.com", "admin", 15),
            ("Evan Wright", "evan@test.com", "member", 10),
        ]
        members_g2 = []
        for name, email, role, points in members_g2_data:
            m = Member(name=name, email=email, role=role, points=points, group_id=group2.id)
            s.add(m)
            members_g2.append(m)
        s.commit()
        for m in members_g2:
            s.refresh(m)
        group2.owner_id = user.id
        s.add(group2)
        s.commit()
        print(f"Created {len(members_g2)} members in group 2")

        now = datetime.utcnow()

        titles_g1 = [
            "Linear Regression HW", "Data Cleaning Sprint", "SQL Practice Set",
            "Neural Net Reading", "Kaggle Mini-Comp", "Stats Quiz Prep",
            "Pandas Exercises", "Model Eval Report", "Feature Engineering Task",
            "Group Presentation Draft", "A/B Test Writeup", "Clustering Lab",
            "Final Project Submission", "Midterm Review", "Group Presentation",
            "Research Paper Draft", "EDA Deep Dive", "Time Series Assignment"
        ]
        titles_g2 = [
            "Reaction Kinetics Worksheet", "Periodic Table Quiz", "Lab Safety Refresher",
            "Titration Practice", "Organic Synthesis Notes", "Bonding Theory Quiz",
            "Molarity Problem Set", "Spectroscopy Reading"
        ]

        deadlines_g1 = []
        # ~3 months back (13 weeks), 4 weeks forward
        for week in range(13, -4, -1):
            base = now - timedelta(weeks=week)
            for _ in range(random.randint(1, 3)):
                due = base + timedelta(days=random.randint(0, 6))
                completed = due < now and random.random() < 0.7
                deadlines_g1.append(Deadline(
                    title=random.choice(titles_g1), due_date=due, completed=completed,
                    completed_at=(due + timedelta(hours=random.randint(1, 48))) if completed else None,
                    group_id=group1.id, assigned_to_id=random.choice(members_g1).id
                ))
        for d in deadlines_g1:
            s.add(d)
        s.commit()
        for d in deadlines_g1:
            s.refresh(d)
        print(f"Created {len(deadlines_g1)} deadlines in group 1")

        deadlines_g2 = []
        for week in range(10, -2, -1):
            base = now - timedelta(weeks=week)
            for _ in range(random.randint(1, 2)):
                due = base + timedelta(days=random.randint(0, 6))
                completed = due < now and random.random() < 0.6
                deadlines_g2.append(Deadline(
                    title=random.choice(titles_g2), due_date=due, completed=completed,
                    completed_at=(due + timedelta(hours=random.randint(1, 48))) if completed else None,
                    group_id=group2.id, assigned_to_id=random.choice(members_g2).id
                ))
        for d in deadlines_g2:
            s.add(d)
        s.commit()
        print(f"Created {len(deadlines_g2)} deadlines in group 2")

        resources = [
            (group1.id, "Data Science Handbook", "link", "https://example.com/handbook", owner),
            (group1.id, "Python Notes", "note", "Python is versatile...", members_g1[1]),
            (group1.id, "ML Cheatsheet", "link", "https://example.com/ml", members_g1[2]),
            (group1.id, "EDA Checklist", "note", "Step-by-step exploratory data analysis checklist.", members_g1[3]),
            (group1.id, "Model Deployment Guide", "note", "Notes on deploying models with FastAPI + Docker.", members_g1[4]),
            (group2.id, "Molarity Cheat Sheet", "note", "Common molarity formulas and worked examples.", members_g2[0]),
        ]
        created_resources = []
        for group_id, title, rtype, content, creator in resources:
            r = Resource(group_id=group_id, title=title, resource_type=rtype, created_by_id=creator.id, current_version_number=1)
            s.add(r)
            s.commit()
            s.refresh(r)
            s.add(ResourceVersion(resource_id=r.id, version_number=1, content=content, created_by_id=creator.id))
            s.commit()
            created_resources.append(r)
        print(f"Created {len(resources)} resources")

        comments = [
            (created_resources[0], owner, "This handbook saved me so much time, highly recommend."),
            (created_resources[1], members_g1[1], "Could we add a section on virtual environments?"),
            (created_resources[2], members_g1[2], "Bookmarking this for the exam."),
            (created_resources[3], members_g1[3], "Added the missing normalization step, check v2 soon."),
        ]
        for resource, member, text in comments:
            s.add(ResourceComment(resource_id=resource.id, member_id=member.id, content=text))
        s.commit()
        print(f"Created {len(comments)} resource comments")

        badges = [
            ("Early Bird", owner),
            ("Collaborator", members_g1[1]),
            ("7-Day Streak", members_g1[3]),
            ("Top Contributor", members_g1[4]),
            ("Consistent", members_g1[2]),
        ]
        for name, member in badges:
            s.add(Badge(member_id=member.id, name=name))
        s.commit()
        print(f"Created {len(badges)} badges")

        completed_deadlines = [d for d in deadlines_g1 if d.completed][:6]
        notifications = []
        for d in completed_deadlines:
            notifications.append(Notification(
                member_id=d.assigned_to_id, deadline_id=d.id,
                type="deadline_completed", message=f'"{d.title}" was marked complete.',
                read=random.random() < 0.5
            ))
        notifications.append(Notification(member_id=owner.id, deadline_id=None, type="badge_awarded", message="You earned the Early Bird badge!", read=False))
        notifications.append(Notification(member_id=members_g1[1].id, deadline_id=None, type="badge_awarded", message="You earned the Collaborator badge!", read=True))
        for n in notifications:
            s.add(n)
        s.commit()
        print(f"Created {len(notifications)} notifications")

        pomodoros = []
        for week in range(8, 0, -1):
            base = now - timedelta(weeks=week)
            for _ in range(random.randint(1, 3)):
                start = base + timedelta(days=random.randint(0, 6), hours=random.randint(9, 20))
                duration = random.choice([1500, 1800, 2700])
                pomodoros.append(PomodoroSession(
                    group_id=group1.id, started_at=start,
                    ended_at=start + timedelta(seconds=duration),
                    duration_seconds=duration
                ))
        for p in pomodoros:
            s.add(p)
        s.commit()
        print(f"Created {len(pomodoros)} pomodoro sessions")

        print("Seed complete!")
        print("Login: syeda@test.com")
        print("Password: syeda123")

if __name__ == "__main__":
    run()
