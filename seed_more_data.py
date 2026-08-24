from datetime import datetime, timedelta
import random
from sqlmodel import Session, select
from app.database import engine
from app.models import StudyGroup, Member, Deadline, Resource, ResourceVersion, Badge

random.seed(42)

with Session(engine) as s:
    group1 = s.exec(select(StudyGroup).where(StudyGroup.name == "Data Science Study Group")).first()
    group2 = s.exec(select(StudyGroup).where(StudyGroup.name == "chem club")).first()

    members_g1 = s.exec(select(Member).where(Member.group_id == group1.id)).all()
    members_g2 = s.exec(select(Member).where(Member.group_id == group2.id)).all()

    titles_g1 = [
        "Linear Regression HW", "Data Cleaning Sprint", "SQL Practice Set",
        "Neural Net Reading", "Kaggle Mini-Comp", "Stats Quiz Prep",
        "Pandas Exercises", "Model Eval Report", "Feature Engineering Task",
        "Group Presentation Draft", "A/B Test Writeup", "Clustering Lab"
    ]
    titles_g2 = [
        "Reaction Kinetics Worksheet", "Periodic Table Quiz", "Lab Safety Refresher",
        "Titration Practice", "Organic Synthesis Notes", "Bonding Theory Quiz",
        "Molarity Problem Set", "Spectroscopy Reading"
    ]

    now = datetime.utcnow()
    new_deadlines = []

    # Spread across last 8 weeks, mix of completed and not, for a richer weekly trend chart
    for week in range(8, 0, -1):
        base = now - timedelta(weeks=week)
        num_this_week = random.randint(1, 3)
        for _ in range(num_this_week):
            due = base + timedelta(days=random.randint(0, 6))
            completed = due < now and random.random() < 0.7
            title = random.choice(titles_g1)
            assignee = random.choice(members_g1)
            new_deadlines.append(Deadline(
                title=title,
                due_date=due,
                completed=completed,
                completed_at=(due + timedelta(hours=random.randint(1, 48))) if completed else None,
                group_id=group1.id,
                assigned_to_id=assignee.id
            ))

    for week in range(6, 0, -1):
        base = now - timedelta(weeks=week)
        num_this_week = random.randint(1, 2)
        for _ in range(num_this_week):
            due = base + timedelta(days=random.randint(0, 6))
            completed = due < now and random.random() < 0.6
            title = random.choice(titles_g2)
            assignee = random.choice(members_g2)
            new_deadlines.append(Deadline(
                title=title,
                due_date=due,
                completed=completed,
                completed_at=(due + timedelta(hours=random.randint(1, 48))) if completed else None,
                group_id=group2.id,
                assigned_to_id=assignee.id
            ))

    # A few upcoming ones too
    new_deadlines.append(Deadline(title="Capstone Proposal", due_date=now + timedelta(days=20), completed=False, group_id=group1.id, assigned_to_id=members_g1[0].id))
    new_deadlines.append(Deadline(title="Final Chem Lab", due_date=now + timedelta(days=15), completed=False, group_id=group2.id, assigned_to_id=members_g2[0].id))

    for d in new_deadlines:
        s.add(d)
    s.commit()

    # A couple more resources per group
    r4 = Resource(group_id=group1.id, title="EDA Checklist", resource_type="note", created_by_id=members_g1[0].id, current_version_number=1)
    r5 = Resource(group_id=group2.id, title="Molarity Cheat Sheet", resource_type="note", created_by_id=members_g2[0].id, current_version_number=1)
    s.add(r4); s.add(r5)
    s.commit()
    s.refresh(r4); s.refresh(r5)
    s.add(ResourceVersion(resource_id=r4.id, version_number=1, content="Step-by-step exploratory data analysis checklist.", created_by_id=members_g1[0].id))
    s.add(ResourceVersion(resource_id=r5.id, version_number=1, content="Common molarity formulas and worked examples.", created_by_id=members_g2[0].id))
    s.commit()

    # Bonus badges for variety
    if len(members_g1) > 1:
        s.add(Badge(member_id=members_g1[1].id, name="7-Day Streak"))
    s.commit()

    print(f"Added {len(new_deadlines)} deadlines, 2 resources, 1 badge.")
