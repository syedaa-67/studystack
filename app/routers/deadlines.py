from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from app.database import get_session
from app.models import Deadline
from app.schemas import DeadlineCreate, DeadlineRead

router = APIRouter(prefix="/deadlines", tags=["Deadlines"])

@router.post("/", response_model=DeadlineRead)
def create_deadline(deadline: DeadlineCreate, session: Session = Depends(get_session)):
    db_deadline = Deadline.from_orm(deadline)
    session.add(db_deadline)
    session.commit()
    session.refresh(db_deadline)
    return db_deadline

@router.get("/", response_model=List[DeadlineRead])
def list_deadlines(session: Session = Depends(get_session)):
    return session.exec(select(Deadline)).all()

@router.patch("/{deadline_id}/complete", response_model=DeadlineRead)
def mark_complete(deadline_id: int, session: Session = Depends(get_session)):
    deadline = session.get(Deadline, deadline_id)
    if not deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    deadline.completed = True
    session.add(deadline)
    session.commit()
    session.refresh(deadline)
    return deadline
