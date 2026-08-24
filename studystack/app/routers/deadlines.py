from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from app.database import get_session
from app.models import Deadline, Member, User
from app.schemas import DeadlineCreate, DeadlineRead
from app.auth import get_current_user
from app.permissions import get_membership, require_role
from app.models import Member
from app.services.gamification import award_points, check_deadline_badges

router = APIRouter(prefix="/deadlines", tags=["Deadlines"])

@router.post("/", response_model=DeadlineRead)
def create_deadline(
    deadline: DeadlineCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    require_role(deadline.group_id, session, current_user, "admin")
    db_deadline = Deadline(**deadline.dict())
    session.add(db_deadline)
    session.commit()
    session.refresh(db_deadline)
    return db_deadline

@router.get("/", response_model=List[DeadlineRead])
def list_deadlines(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    my_group_ids = session.exec(
        select(Member.group_id).where(Member.user_id == current_user.id)
    ).all()
    if not my_group_ids:
        return []
    return session.exec(
        select(Deadline).where(Deadline.group_id.in_(my_group_ids))
    ).all()

@router.patch("/{deadline_id}/complete", response_model=DeadlineRead)
def mark_complete(
    deadline_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    deadline = session.get(Deadline, deadline_id)
    if not deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    get_membership(deadline.group_id, session, current_user)
    was_incomplete = not deadline.completed
    deadline.completed = True
    deadline.completed_at = datetime.utcnow()
    session.add(deadline)
    session.commit()
    session.refresh(deadline)

    if was_incomplete:
        member = None
        if deadline.assigned_to_id:
            member = session.get(Member, deadline.assigned_to_id)
        else:
            member = get_membership(deadline.group_id, session, current_user)
            deadline.assigned_to_id = member.id
            session.add(deadline)
        if member:
            on_time = deadline.completed_at <= deadline.due_date
            award_points(session, member, 15 if on_time else 10)
            check_deadline_badges(session, member)
            session.commit()
    return deadline

@router.patch("/{deadline_id}/incomplete", response_model=DeadlineRead)
def mark_incomplete(
    deadline_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    deadline = session.get(Deadline, deadline_id)
    if not deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    get_membership(deadline.group_id, session, current_user)
    deadline.completed = False
    deadline.completed_at = None
    session.add(deadline)
    session.commit()
    session.refresh(deadline)
    return deadline



