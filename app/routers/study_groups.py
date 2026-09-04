from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.database import get_session
from app.models import StudyGroup, Member, User
from app.schemas import StudyGroupCreate, StudyGroupRead, StudyGroupDetail, LeaderboardResponse, LeaderboardEntry
from app.auth import get_current_user
from app.permissions import get_membership
from app.models import Badge
from app.models import PomodoroSession
from app.models import Task, TaskStatus
from app.schemas import TaskCreate, TaskUpdateStatus, TaskResponse, MemberContributionSummary
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter(prefix="/study-groups", tags=["Study Groups"])

@router.post("/", response_model=StudyGroupRead)
def create_study_group(
    group: StudyGroupCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    db_group = StudyGroup(**group.dict(), owner_id=current_user.id)
    session.add(db_group)
    session.commit()
    session.refresh(db_group)

    owner_member = Member(
        name=current_user.email.split("@")[0],
        email=current_user.email,
        role="owner",
        group_id=db_group.id,
        user_id=current_user.id,
    )
    session.add(owner_member)
    session.commit()

    return db_group

@router.get("/", response_model=List[StudyGroupRead])
def list_study_groups(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return session.exec(
        select(StudyGroup)
        .join(Member, Member.group_id == StudyGroup.id)
        .where(Member.user_id == current_user.id)
    ).all()

@router.get("/{group_id}", response_model=StudyGroupDetail)
def get_study_group(
    group_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    membership = get_membership(group_id, session, current_user)
    group = session.get(StudyGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Study group not found")
    result = StudyGroupDetail.model_validate(group, from_attributes=True)
    result.my_role = membership.role
    return result






@router.get("/{group_id}/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    group_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_membership(group_id, session, current_user)
    members = session.exec(select(Member).where(Member.group_id == group_id)).all()

    entries = []
    for m in members:
        badges = session.exec(select(Badge).where(Badge.member_id == m.id)).all()
        entries.append(LeaderboardEntry(
            member_id=m.id,
            member_name=m.name,
            role=m.role,
            points=m.points,
            badges=[b.name for b in badges],
        ))

    entries.sort(key=lambda e: e.points, reverse=True)
    return LeaderboardResponse(entries=entries)



@router.get("/{group_id}/focus-trend")
def get_focus_trend(
    group_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_membership(group_id, session, current_user)

    sessions = session.exec(
        select(PomodoroSession)
        .where(PomodoroSession.group_id == group_id)
        .where(PomodoroSession.duration_seconds != None)
    ).all()

    minutes_by_day = defaultdict(int)
    for s in sessions:
        day = s.started_at.date().isoformat()
        minutes_by_day[day] += round((s.duration_seconds or 0) / 60)

    today = datetime.utcnow().date()
    days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]

    trend = [
        {"day": d.strftime("%a"), "date": d.isoformat(), "minutes": minutes_by_day.get(d.isoformat(), 0)}
        for d in days
    ]

    return {"trend": trend}

@router.post("/{group_id}/tasks", response_model=TaskResponse)
def create_task(
    group_id: int,
    task: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_membership(group_id, session, current_user)
    db_task = Task(**task.dict(), group_id=group_id)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    assignee_name = None
    if db_task.assigned_to:
        assignee = session.get(Member, db_task.assigned_to)
        assignee_name = assignee.name if assignee else None
    return TaskResponse(**db_task.dict(), assigned_to_name=assignee_name)


@router.get("/{group_id}/tasks", response_model=List[TaskResponse])
def list_tasks(
    group_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_membership(group_id, session, current_user)
    tasks = session.exec(select(Task).where(Task.group_id == group_id)).all()
    results = []
    for t in tasks:
        assignee_name = None
        if t.assigned_to:
            assignee = session.get(Member, t.assigned_to)
            assignee_name = assignee.name if assignee else None
        results.append(TaskResponse(**t.dict(), assigned_to_name=assignee_name))
    return results


@router.patch("/{group_id}/tasks/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    group_id: int,
    task_id: int,
    update: TaskUpdateStatus,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_membership(group_id, session, current_user)
    db_task = session.get(Task, task_id)
    if not db_task or db_task.group_id != group_id:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.status = update.status
    db_task.updated_at = datetime.utcnow()
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    assignee_name = None
    if db_task.assigned_to:
        assignee = session.get(Member, db_task.assigned_to)
        assignee_name = assignee.name if assignee else None
    return TaskResponse(**db_task.dict(), assigned_to_name=assignee_name)


@router.get("/{group_id}/tasks/contributions", response_model=List[MemberContributionSummary])
def get_task_contributions(
    group_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_membership(group_id, session, current_user)
    members = session.exec(select(Member).where(Member.group_id == group_id)).all()
    tasks = session.exec(select(Task).where(Task.group_id == group_id)).all()
    summaries = []
    for m in members:
        m_tasks = [t  for t in tasks if t.assigned_to == m.id]
        total = len(m_tasks)
        done = len([t for t in m_tasks if t.status == TaskStatus.DONE])
        in_progress = len([t for t in m_tasks if t.status == TaskStatus.IN_PROGRESS])
        todo = len([t for t in m_tasks if t.status == TaskStatus.TODO])
        percent = round((done / total) * 100, 1) if total > 0 else 0.0
        summaries.append(MemberContributionSummary(
            member_id=m.id,
            member_name=m.name,
            total_tasks=total,
            done=done,
            in_progress=in_progress,
            todo=todo,
            percent_complete=percent,
        ))
    return summaries
