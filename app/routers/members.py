from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from app.database import get_session
from app.models import Member
from app.schemas import MemberCreate, MemberRead

router = APIRouter(prefix="/members", tags=["Members"])

@router.post("/", response_model=MemberRead)
def create_member(member: MemberCreate, session: Session = Depends(get_session)):
    db_member = Member.from_orm(member)
    session.add(db_member)
    session.commit()
    session.refresh(db_member)
    return db_member

@router.get("/", response_model=List[MemberRead])
def list_members(session: Session = Depends(get_session)):
    return session.exec(select(Member)).all()
