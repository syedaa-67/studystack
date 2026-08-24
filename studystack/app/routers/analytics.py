from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime, timedelta
from collections import defaultdict

from app.database import get_session
from app.models import Deadline, StudyGroup, Member, User
from app.schemas import AnalyticsResponse, MemberContribution, TrendPoint
from app.auth import get_current_user
from app.permissions import get_membership

router = APIRouter(prefix="/study-groups", tags=["Analytics"])

@router.get("/{group_id}/analytics", response_model=AnalyticsResponse)
def get_group_analytics(
    group_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_membership(group_id, session, current_user)

    deadlines = session.exec(select(Deadline).where(Deadline.group_id == group_id)).all()
    members = session.exec(select(Member).where(Member.group_id == group_id)).all()

    total = len(deadlines)
    completed = [d for d in deadlines if d.completed]
    completion_rate = round((len(completed) / total) * 100, 1) if total else 0.0

    # Weekly trend: last 8 ISO weeks (Mon-start), count of completions per week
    trend_map = defaultdict(int)
    for d in completed:
        if d.completed_at:
            wk_start = d.completed_at.date() - timedelta(days=d.completed_at.date().weekday())
            trend_map[wk_start] += 1

    today = datetime.utcnow().date()
    this_week_start = today - timedelta(days=today.weekday())
    weekly_trend = []
    for i in range(7, -1, -1):
        wk_start = this_week_start - timedelta(weeks=i)
        weekly_trend.append(TrendPoint(period=wk_start.isoformat(), completed_count=trend_map.get(wk_start, 0)))

    # Per-member contribution
    contrib_count = defaultdict(int)
    for d in completed:
        if d.assigned_to_id:
            contrib_count[d.assigned_to_id] += 1
    member_contributions = sorted(
        [
            MemberContribution(member_id=m.id, member_name=m.name, completed_count=contrib_count.get(m.id, 0))
            for m in members
        ],
        key=lambda c: c.completed_count,
        reverse=True,
    )

    # Streaks (see docs: consecutive calendar days with >=1 completed deadline in this group)
    completion_dates = {d.completed_at.date() for d in completed if d.completed_at}

    current_streak = 0
    cursor = today if today in completion_dates else today - timedelta(days=1)  # 1-day grace
    while cursor in completion_dates:
        current_streak += 1
        cursor -= timedelta(days=1)

    longest_streak = 0
    if completion_dates:
        asc_dates = sorted(completion_dates)
        run = 1
        longest_streak = 1
        for i in range(1, len(asc_dates)):
            if (asc_dates[i] - asc_dates[i - 1]).days == 1:
                run += 1
            else:
                run = 1
            longest_streak = max(longest_streak, run)

    return AnalyticsResponse(
        total_deadlines=total,
        completed_deadlines=len(completed),
        completion_rate=completion_rate,
        weekly_trend=weekly_trend,
        member_contributions=member_contributions,
        current_streak=current_streak,
        longest_streak=longest_streak,
    )



