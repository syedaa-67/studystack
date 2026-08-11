from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StudyGroupCreate(BaseModel):
    name: str
    subject: str
    description: Optional[str] = None

class StudyGroupRead(BaseModel):
    id: int
    name: str
    subject: str
    description: Optional[str] = None
    created_at: datetime

class MemberCreate(BaseModel):
    name: str
    email: str
    group_id: int

class MemberRead(BaseModel):
    id: int
    name: str
    email: str
    group_id: int

class DeadlineCreate(BaseModel):
    title: str
    due_date: datetime
    group_id: int

class DeadlineRead(BaseModel):
    id: int
    title: str
    due_date: datetime
    completed: bool
    group_id: int