from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class StudyGroup(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    subject: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    members: List["Member"] = Relationship(back_populates="group")
    deadlines: List["Deadline"] = Relationship(back_populates="group")
    resources: List["Resource"] = Relationship(back_populates="group")

class Member(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    role: str = Field(default="member")  # "owner" | "admin" | "member"
    points: int = Field(default=0)
    group_id: Optional[int] = Field(default=None, foreign_key="studygroup.id")
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    group: Optional[StudyGroup] = Relationship(back_populates="members")
    assigned_deadlines: List["Deadline"] = Relationship(back_populates="assigned_to")

class Deadline(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    due_date: datetime
    completed: bool = Field(default=False)
    completed_at: Optional[datetime] = Field(default=None)
    group_id: Optional[int] = Field(default=None, foreign_key="studygroup.id")
    assigned_to_id: Optional[int] = Field(default=None, foreign_key="member.id")
    group: Optional[StudyGroup] = Relationship(back_populates="deadlines")
    assigned_to: Optional[Member] = Relationship(back_populates="assigned_deadlines")

class Resource(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key="studygroup.id")
    title: str
    resource_type: str  # "link" | "note" | "file"
    created_by_id: Optional[int] = Field(default=None, foreign_key="member.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    current_version_number: int = Field(default=1)
    group: Optional[StudyGroup] = Relationship(back_populates="resources")
    versions: List["ResourceVersion"] = Relationship(back_populates="resource")
    comments: List["ResourceComment"] = Relationship(back_populates="resource")

class ResourceVersion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resource_id: int = Field(foreign_key="resource.id")
    version_number: int
    content: str  # URL for links, text body for notes, filename for files
    file_path: Optional[str] = None  # only set for resource_type == "file"
    change_summary: Optional[str] = None
    created_by_id: Optional[int] = Field(default=None, foreign_key="member.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resource: Optional[Resource] = Relationship(back_populates="versions")

class ResourceComment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resource_id: int = Field(foreign_key="resource.id")
    member_id: Optional[int] = Field(default=None, foreign_key="member.id")
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resource: Optional[Resource] = Relationship(back_populates="comments")

class Badge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    member_id: int = Field(foreign_key="member.id")
    name: str
    awarded_at: datetime = Field(default_factory=datetime.utcnow)

class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    member_id: int = Field(foreign_key="member.id")
    deadline_id: Optional[int] = Field(default=None, foreign_key="deadline.id")
    type: str  # "due_soon" | "overdue"
    message: str
    read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PomodoroSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key="studygroup.id")
    started_at: datetime
    ended_at: Optional[datetime] = Field(default=None)
    duration_seconds: Optional[int] = Field(default=None)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)





