from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from app.database import get_session
from app.models import Notification, Member, User
from app.schemas import NotificationRead
from app.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationRead])
def list_notifications(
    unread_only: bool = False,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    my_member_ids = session.exec(
        select(Member.id).where(Member.user_id == current_user.id)
    ).all()
    if not my_member_ids:
        return []

    query = select(Notification).where(Notification.member_id.in_(my_member_ids))
    if unread_only:
        query = query.where(Notification.read == False)
    query = query.order_by(Notification.created_at.desc())

    return session.exec(query).all()


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_read(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    notif = session.get(Notification, notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    member = session.get(Member, notif.member_id)
    if not member or member.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.read = True
    session.add(notif)
    session.commit()
    session.refresh(notif)
    return notif
