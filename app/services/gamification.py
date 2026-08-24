from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.models import Member, Deadline, Resource, Badge


def award_points(session: Session, member: Member, amount: int):
    member.points += amount
    session.add(member)


def has_badge(session: Session, member_id: int, name: str) -> bool:
    return session.exec(
        select(Badge).where(Badge.member_id == member_id).where(Badge.name == name)
    ).first() is not None


def grant_badge(session: Session, member_id: int, name: str):
    if not has_badge(session, member_id, name):
        session.add(Badge(member_id=member_id, name=name))


def check_deadline_badges(session: Session, member: Member):
    completed_count = len(session.exec(
        select(Deadline).where(Deadline.assigned_to_id == member.id).where(Deadline.completed == True)
    ).all())

    if completed_count >= 1:
        grant_badge(session, member.id, "First Deadline")
    if completed_count >= 5:
        grant_badge(session, member.id, "5 Completed")

    completion_dates = {
        d.completed_at.date() for d in session.exec(
            select(Deadline).where(Deadline.assigned_to_id == member.id).where(Deadline.completed == True)
        ).all() if d.completed_at
    }
    today = datetime.utcnow().date()
    streak = 0
    cursor = today if today in completion_dates else today - timedelta(days=1)
    while cursor in completion_dates:
        streak += 1
        cursor -= timedelta(days=1)
    if streak >= 7:
        grant_badge(session, member.id, "7-Day Streak")


def check_resource_badges(session: Session, member: Member):
    resource_count = len(session.exec(
        select(Resource).where(Resource.created_by_id == member.id)
    ).all())
    if resource_count >= 3:
        grant_badge(session, member.id, "Resource Contributor")
