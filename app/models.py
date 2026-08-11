from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class StudyGroup(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    subject: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    members: List["Member"] = Relationship(back_populates="group")
    deadlines: List["Deadline"] = Relationship(back_populates="group")

class Member(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    group_id: Optional[int] = Field(default=None, foreign_key="studygroup.id")

    group: Optional[StudyGroup] = Relationship(back_populates="members")

class Deadline(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    due_date: datetime
    completed: bool = Field(default=False)
    group_id: Optional[int] = Field(default=None, foreign_key="studygroup.id")

    group: Optional[StudyGroup] = Relationship(back_populates="deadlines")