from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel

from app.database import get_session
from app.models import Resource, User
from app.auth import get_current_user
from app.permissions import get_membership
from app.services.ai import summarize_text

router = APIRouter(prefix="/ai", tags=["AI"])


class SummaryResponse(BaseModel):
    summary: str


@router.post("/resources/{resource_id}/summarize", response_model=SummaryResponse)
def summarize_resource(
    resource_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    resource = session.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    get_membership(resource.group_id, session, current_user)

    if resource.resource_type == "file":
        raise HTTPException(status_code=400, detail="File summarization isn't supported yet, only notes and links.")

    from app.models import ResourceVersion
    current = session.exec(
        select(ResourceVersion)
        .where(ResourceVersion.resource_id == resource_id)
        .where(ResourceVersion.version_number == resource.current_version_number)
    ).first()

    if not current or not current.content.strip():
        raise HTTPException(status_code=400, detail="Nothing to summarize.")

    try:
        summary = summarize_text(current.content, resource.title)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception:
        raise HTTPException(status_code=502, detail="AI summarization failed. Try again.")

    return SummaryResponse(summary=summary)
