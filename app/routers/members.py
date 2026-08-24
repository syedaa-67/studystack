from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.database import get_session
from app.models import Member, User
from app.schemas import MemberCreate, MemberRead
from app.auth import get_current_user
from app.permissions import get_membership, require_role

router = APIRouter(prefix="/members", tags=["Members"])

@router.post("/", response_model=MemberRead)
def create_member(
    member: MemberCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    require_role(member.group_id, session, current_user, "admin")
    data = member.dict()
    data.setdefault("role", "member")
    db_member = Member(**data)
    session.add(db_member)
    session.commit()
    session.refresh(db_member)
    return db_member

@router.get("/", response_model=List[MemberRead])
def list_members(
    group_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_membership(group_id, session, current_user)
    return session.exec(select(Member).where(Member.group_id == group_id)).all()

@router.delete("/{member_id}")
def remove_member(
    member_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    member = session.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    require_role(member.group_id, session, current_user, "admin")
    if member.role == "owner":
        raise HTTPException(status_code=400, detail="Cannot remove the group owner")
    session.delete(member)
    session.commit()
    return {"ok": True}
