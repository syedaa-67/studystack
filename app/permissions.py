from fastapi import HTTPException
from sqlmodel import Session, select

from app.models import Member, StudyGroup, User

ROLE_RANK = {"member": 0, "admin": 1, "owner": 2}


def get_membership(group_id: int, session: Session, current_user: User) -> Member:
    """Returns the current user's Member row for this group, or 404 if they're not a member."""
    group = session.get(StudyGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Study group not found")

    membership = session.exec(
        select(Member).where(Member.group_id == group_id).where(Member.user_id == current_user.id)
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Study group not found")

    return membership


def require_role(group_id: int, session: Session, current_user: User, min_role: str) -> Member:
    """Returns the current user's Member row if their role meets min_role, else 403."""
    membership = get_membership(group_id, session, current_user)
    if ROLE_RANK.get(membership.role, -1) < ROLE_RANK.get(min_role, 99):
        raise HTTPException(status_code=403, detail=f"Requires {min_role} role or higher")
    return membership
