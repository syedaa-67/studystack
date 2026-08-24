import os
import difflib
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List, Optional

from app.database import get_session
from app.models import Resource, ResourceVersion, ResourceComment, User
from app.schemas import (
    ResourceCreate, ResourceRead, ResourceDetail, ResourceUpdate,
    ResourceVersionRead, ResourceCommentCreate, ResourceCommentRead, DiffResponse, DiffLine,
)
from app.auth import get_current_user
from app.permissions import get_membership, require_role
from app.models import Member
from app.services.gamification import award_points, check_resource_badges

router = APIRouter(prefix="/resources", tags=["Resources"])

UPLOAD_DIR = os.path.join("app", "uploads")


def to_read(resource: Resource, session: Session) -> ResourceRead:
    current = session.exec(
        select(ResourceVersion)
        .where(ResourceVersion.resource_id == resource.id)
        .where(ResourceVersion.version_number == resource.current_version_number)
    ).first()
    return ResourceRead(
        id=resource.id,
        group_id=resource.group_id,
        title=resource.title,
        resource_type=resource.resource_type,
        created_by_id=resource.created_by_id,
        created_at=resource.created_at,
        current_version_number=resource.current_version_number,
        current_content=current.content if current else "",
        current_file_path=current.file_path if current else None,
    )


@router.get("/group/{group_id}", response_model=List[ResourceRead])
def list_resources(
    group_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_membership(group_id, session, current_user)
    resources = session.exec(select(Resource).where(Resource.group_id == group_id)).all()
    return [to_read(r, session) for r in resources]


@router.post("/", response_model=ResourceRead)
def create_resource(
    payload: ResourceCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_membership(payload.group_id, session, current_user)
    resource = Resource(
        group_id=payload.group_id,
        title=payload.title,
        resource_type=payload.resource_type,
        created_by_id=payload.created_by_id,
        current_version_number=1,
    )
    session.add(resource)
    session.commit()
    session.refresh(resource)

    version = ResourceVersion(
        resource_id=resource.id,
        version_number=1,
        content=payload.content,
        change_summary="Initial version",
        created_by_id=payload.created_by_id,
    )
    session.add(version)
    session.commit()

    if payload.created_by_id:
        member = session.get(Member, payload.created_by_id)
        if member:
            award_points(session, member, 5)
            check_resource_badges(session, member)
            session.commit()

    return to_read(resource, session)


@router.post("/upload", response_model=ResourceRead)
def create_file_resource(
    group_id: int = Form(...),
    title: str = Form(...),
    created_by_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    get_membership(group_id, session, current_user)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    resource = Resource(
        group_id=group_id,
        title=title,
        resource_type="file",
        created_by_id=created_by_id,
        current_version_number=1,
    )
    session.add(resource)
    session.commit()
    session.refresh(resource)

    safe_name = f"resource_{resource.id}_v1_{file.filename}"
    dest_path = os.path.join(UPLOAD_DIR, safe_name)
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    version = ResourceVersion(
        resource_id=resource.id,
        version_number=1,
        content=file.filename,
        file_path=safe_name,
        change_summary="Initial upload",
        created_by_id=created_by_id,
    )
    session.add(version)
    session.commit()
    return to_read(resource, session)


@router.get("/{resource_id}", response_model=ResourceDetail)
def get_resource(
    resource_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    resource = session.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    get_membership(resource.group_id, session, current_user)

    versions = session.exec(
        select(ResourceVersion)
        .where(ResourceVersion.resource_id == resource_id)
        .order_by(ResourceVersion.version_number.desc())
    ).all()
    comments = session.exec(
        select(ResourceComment)
        .where(ResourceComment.resource_id == resource_id)
        .order_by(ResourceComment.created_at)
    ).all()

    base = to_read(resource, session)
    return ResourceDetail(
        **base.dict(),
        versions=[ResourceVersionRead(**v.dict()) for v in versions],
        comments=[ResourceCommentRead(**c.dict()) for c in comments],
    )


@router.patch("/{resource_id}", response_model=ResourceRead)
def update_resource(
    resource_id: int,
    payload: ResourceUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    resource = session.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    get_membership(resource.group_id, session, current_user)

    new_version_number = resource.current_version_number + 1
    version = ResourceVersion(
        resource_id=resource.id,
        version_number=new_version_number,
        content=payload.content,
        change_summary=payload.change_summary or "Updated",
        created_by_id=payload.edited_by_id,
    )
    session.add(version)
    resource.current_version_number = new_version_number
    session.add(resource)
    session.commit()
    return to_read(resource, session)


@router.post("/{resource_id}/rollback/{version_number}", response_model=ResourceRead)
def rollback_resource(
    resource_id: int,
    version_number: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    resource = session.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    require_role(resource.group_id, session, current_user, "admin")

    target = session.exec(
        select(ResourceVersion)
        .where(ResourceVersion.resource_id == resource_id)
        .where(ResourceVersion.version_number == version_number)
    ).first()
    if not target:
        raise HTTPException(status_code=404, detail="Version not found")

    new_version_number = resource.current_version_number + 1
    new_version = ResourceVersion(
        resource_id=resource.id,
        version_number=new_version_number,
        content=target.content,
        file_path=target.file_path,
        change_summary=f"Rolled back to version {version_number}",
        created_by_id=target.created_by_id,
    )
    session.add(new_version)
    resource.current_version_number = new_version_number
    session.add(resource)
    session.commit()
    return to_read(resource, session)


@router.get("/{resource_id}/diff/{from_version}/{to_version}", response_model=DiffResponse)
def diff_versions(
    resource_id: int,
    from_version: int,
    to_version: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    resource = session.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    get_membership(resource.group_id, session, current_user)

    v_from = session.exec(
        select(ResourceVersion)
        .where(ResourceVersion.resource_id == resource_id)
        .where(ResourceVersion.version_number == from_version)
    ).first()
    v_to = session.exec(
        select(ResourceVersion)
        .where(ResourceVersion.resource_id == resource_id)
        .where(ResourceVersion.version_number == to_version)
    ).first()
    if not v_from or not v_to:
        raise HTTPException(status_code=404, detail="Version not found")

    from_lines = v_from.content.splitlines() or [""]
    to_lines = v_to.content.splitlines() or [""]
    sm = difflib.SequenceMatcher(None, from_lines, to_lines)

    lines: List[DiffLine] = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for line in from_lines[i1:i2]:
                lines.append(DiffLine(type="equal", text=line))
        elif tag == "delete":
            for line in from_lines[i1:i2]:
                lines.append(DiffLine(type="removed", text=line))
        elif tag == "insert":
            for line in to_lines[j1:j2]:
                lines.append(DiffLine(type="added", text=line))
        elif tag == "replace":
            for line in from_lines[i1:i2]:
                lines.append(DiffLine(type="removed", text=line))
            for line in to_lines[j1:j2]:
                lines.append(DiffLine(type="added", text=line))

    return DiffResponse(from_version=from_version, to_version=to_version, lines=lines)


@router.post("/{resource_id}/comments", response_model=ResourceCommentRead)
def add_comment(
    resource_id: int,
    payload: ResourceCommentCreate,
    member_id: Optional[int] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    resource = session.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    get_membership(resource.group_id, session, current_user)

    comment = ResourceComment(resource_id=resource_id, member_id=member_id, content=payload.content)
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment


@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    resource = session.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    require_role(resource.group_id, session, current_user, "admin")

    versions = session.exec(select(ResourceVersion).where(ResourceVersion.resource_id == resource_id)).all()
    for v in versions:
        session.delete(v)
    comments = session.exec(select(ResourceComment).where(ResourceComment.resource_id == resource_id)).all()
    for c in comments:
        session.delete(c)
    session.delete(resource)
    session.commit()
    return {"ok": True}


