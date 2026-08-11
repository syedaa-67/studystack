from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from app.database import get_session
from app.models import StudyGroup
from app.schemas import StudyGroupCreate, StudyGroupRead

router = APIRouter(prefix="/study-groups", tags=["Study Groups"])

@router.post("/", response_model=StudyGroupRead)
def create_study_group(group: StudyGroupCreate, session: Session = Depends(get_session)):
    db_group = StudyGroup.from_orm(group)
    session.add(db_group)
    session.commit()
    session.refresh(db_group)
    return db_group

@router.get("/", response_model=List[StudyGroupRead])
def list_study_groups(session: Session = Depends(get_session)):
    return session.exec(select(StudyGroup)).all()

@router.get("/{group_id}", response_model=StudyGroupRead)
def get_study_group(group_id: int, session: Session = Depends(get_session)):
    group = session.get(StudyGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Study group not found")
    return group
