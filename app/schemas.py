from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models import TaskStatus

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
    owner_id: Optional[int] = None

class MemberCreate(BaseModel):
    name: str
    email: str
    group_id: int
    user_id: Optional[int] = None
    role: str = "member"

class MemberRead(BaseModel):
    id: int
    name: str
    email: str
    group_id: int
    user_id: Optional[int] = None
    role: str

class DeadlineCreate(BaseModel):
    title: str
    due_date: datetime
    group_id: int
    assigned_to_id: Optional[int] = None

class DeadlineRead(BaseModel):
    id: int
    title: str
    due_date: datetime
    completed: bool
    completed_at: Optional[datetime] = None
    group_id: int
    assigned_to_id: Optional[int] = None

class UserCreate(BaseModel):
    email: str
    password: str

class UserRead(BaseModel):
    id: int
    email: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class MemberInGroup(BaseModel):
    id: int
    name: str
    email: str
    user_id: Optional[int] = None
    role: str

class DeadlineInGroup(BaseModel):
    id: int
    title: str
    due_date: datetime
    completed: bool
    completed_at: Optional[datetime] = None
    assigned_to_id: Optional[int] = None

class StudyGroupDetail(BaseModel):
    id: int
    name: str
    subject: str
    description: Optional[str] = None
    created_at: datetime
    members: List[MemberInGroup] = []
    deadlines: List[DeadlineInGroup] = []
    my_role: str = ""

class TrendPoint(BaseModel):
    period: str
    completed_count: int

class MemberContribution(BaseModel):
    member_id: int
    member_name: str
    completed_count: int

class AnalyticsResponse(BaseModel):
    total_deadlines: int
    completed_deadlines: int
    completion_rate: float
    weekly_trend: List[TrendPoint]
    member_contributions: List[MemberContribution]
    current_streak: int
    longest_streak: int

class ResourceVersionRead(BaseModel):
    id: int
    version_number: int
    content: str
    file_path: Optional[str] = None
    change_summary: Optional[str] = None
    created_by_id: Optional[int] = None
    created_at: datetime

class ResourceCommentCreate(BaseModel):
    content: str

class ResourceCommentRead(BaseModel):
    id: int
    member_id: Optional[int] = None
    content: str
    created_at: datetime

class ResourceCreate(BaseModel):
    group_id: int
    title: str
    resource_type: str
    content: str
    created_by_id: Optional[int] = None

class ResourceUpdate(BaseModel):
    content: str
    change_summary: Optional[str] = None
    edited_by_id: Optional[int] = None

class ResourceRead(BaseModel):
    id: int
    group_id: int
    title: str
    resource_type: str
    created_by_id: Optional[int] = None
    created_at: datetime
    current_version_number: int
    current_content: str
    current_file_path: Optional[str] = None

class ResourceDetail(ResourceRead):
    versions: List[ResourceVersionRead] = []
    comments: List[ResourceCommentRead] = []

class DiffLine(BaseModel):
    type: str  # "equal" | "added" | "removed"
    text: str

class DiffResponse(BaseModel):
    from_version: int
    to_version: int
    lines: List[DiffLine]







class NotificationRead(BaseModel):
    id: int
    deadline_id: Optional[int] = None
    type: str
    message: str
    read: bool
    created_at: datetime


class LeaderboardEntry(BaseModel):
    member_id: int
    member_name: str
    role: str
    points: int
    badges: List[str]


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None


class TaskUpdateStatus(BaseModel):
    status: TaskStatus


class TaskResponse(BaseModel):
    id: int
    group_id: int
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    assigned_to_name: Optional[str] = None
    status: TaskStatus
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MemberContributionSummary(BaseModel):
    member_id: int
    member_name: str
    total_tasks: int
    done: int
    in_progress: int
    todo: int
    percent_complete: float
