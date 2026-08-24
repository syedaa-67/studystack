from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.database import engine
from app.models import Deadline, Member, Notification


async def check_deadlines():
    from app.routers.ws import manager

    now = datetime.utcnow()
    soon_cutoff = now + timedelta(hours=24)

    with Session(engine) as session:
        deadlines = session.exec(select(Deadline).where(Deadline.completed == False)).all()

        for d in deadlines:
            existing_types = {
                n.type for n in session.exec(
                    select(Notification).where(Notification.deadline_id == d.id)
                ).all()
            }

            targets = []
            if d.assigned_to_id:
                m = session.get(Member, d.assigned_to_id)
                if m:
                    targets = [m]
            else:
                targets = session.exec(select(Member).where(Member.group_id == d.group_id)).all()

            notif_type = None
            message = None
            if d.due_date < now and "overdue" not in existing_types:
                notif_type = "overdue"
                message = f'"{d.title}" is now overdue'
            elif now <= d.due_date <= soon_cutoff and "due_soon" not in existing_types:
                notif_type = "due_soon"
                message = f'"{d.title}" is due within 24 hours'

            if notif_type:
                for member in targets:
                    notif = Notification(
                        member_id=member.id,
                        deadline_id=d.id,
                        type=notif_type,
                        message=message,
                    )
                    session.add(notif)
                    session.commit()
                    session.refresh(notif)

                    if member.user_id is not None:
                        await manager.send_to_user(
                            d.group_id,
                            str(member.user_id),
                            {
                                "type": "notification",
                                "id": notif.id,
                                "notif_type": notif.type,
                                "message": notif.message,
                                "created_at": notif.created_at.isoformat(),
                            },
                        )
