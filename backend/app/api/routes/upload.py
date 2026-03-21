"""
upload.py — File upload and delete routes.

POST   /api/upload          → upload file to S3 + save to DB
DELETE /api/upload/{id}     → delete file from S3 + remove from DB
PATCH  /api/upload/{id}/thumbnail → set file as project thumbnail
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import MediaFile, Project, User, MediaFileType
from app.schemas.schemas import MediaFileRead, MessageResponse
from app.core.dependencies import get_current_user
from app.services import s3_service

router = APIRouter(prefix="/upload", tags=["Upload"])


# ─────────────────────────────────────────────
# UPLOAD A FILE
# ─────────────────────────────────────────────

@router.post("", response_model=MediaFileRead)
async def upload_file(
    file: UploadFile = File(...),
    project_id: str  = Form(...),
    db: Session      = Depends(get_db),
    _: User          = Depends(get_current_user),
):
    """
    Upload a file to S3 and save its record to the database.

    Why async?
    File uploads involve I/O (reading bytes, network transfer).
    async lets FastAPI handle other requests while waiting.
    Any route that calls an async function must itself be async.

    What is File(...) and Form(...)?
    When sending files, we use multipart/form-data instead of JSON.
    File(...)     → tells FastAPI to expect a file in the request
    Form(...)     → tells FastAPI to expect a form field (not JSON body)
    The ... means required — FastAPI rejects request if missing.

    How the frontend sends this:
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('project_id', 'abc-123')
    axios.post('/api/upload', formData)
    """

    # ── Step 1: Verify project exists ──
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=404,
            detail=f"Project '{project_id}' not found"
        )

    # ── Step 2: Upload to S3 ──
    # s3_service handles validation + actual upload
    upload_result = await s3_service.upload_file(file, project_id)

    # ── Step 3: Save to database ──
    media_file = MediaFile(
        project_id = project_id,
        s3_key     = upload_result["s3_key"],
        public_url = upload_result["public_url"],
        file_name  = upload_result["file_name"],
        file_type  = MediaFileType(upload_result["file_type"]),
        file_size  = upload_result["file_size"],
        order      = 0,
    )

    db.add(media_file)

    # ── Step 4: Auto-set thumbnail if project has none ──
    # First uploaded file becomes the thumbnail automatically
    if not project.thumbnail_url:
        project.thumbnail_url = upload_result["public_url"]

    db.commit()
    db.refresh(media_file)

    return media_file


# ─────────────────────────────────────────────
# DELETE A FILE
# ─────────────────────────────────────────────

@router.delete("/{media_file_id}", response_model=MessageResponse)
def delete_file(
    media_file_id: str,
    db: Session = Depends(get_db),
    _: User     = Depends(get_current_user),
):
    """
    Delete a file from both S3 and the database.

    Order matters:
    1. Delete from S3 first
    2. Then delete from database

    Why this order?
    If DB delete fails after S3 delete → file is gone from S3
    but DB record remains → shows broken image → bad
    
    If S3 delete fails → we stop before deleting DB record
    → file still exists in S3 → consistent state → good

    Actually for a portfolio the simpler approach is fine.
    We delete S3 first, then DB regardless.
    """

    # find the media file record
    media_file = db.query(MediaFile).filter(
        MediaFile.id == media_file_id
    ).first()

    if not media_file:
        raise HTTPException(status_code=404, detail="File not found")

    # get the project to potentially update thumbnail
    project = db.query(Project).filter(
        Project.id == media_file.project_id
    ).first()

    # ── Delete from S3 ──
    s3_service.delete_file(media_file.s3_key)
    # if S3 delete fails, it raises HTTPException
    # and we never reach the DB delete below

    # ── Delete from database ──
    db.delete(media_file)

    # ── Update thumbnail if needed ──
    # if we deleted the file that was the thumbnail
    # set thumbnail to another file, or clear it
    if project and project.thumbnail_url == media_file.public_url:
        # find another file for this project
        other_file = db.query(MediaFile).filter(
            MediaFile.project_id == media_file.project_id,
            MediaFile.id != media_file_id
        ).first()

        project.thumbnail_url = other_file.public_url if other_file else None

    db.commit()

    return MessageResponse(message="File deleted successfully")


# ─────────────────────────────────────────────
# SET AS THUMBNAIL
# ─────────────────────────────────────────────

@router.patch("/{media_file_id}/thumbnail", response_model=MessageResponse)
def set_thumbnail(
    media_file_id: str,
    db: Session = Depends(get_db),
    _: User     = Depends(get_current_user),
):
    """
    Set a specific media file as the project's thumbnail.

    Thumbnail = the main preview image shown on the
    portfolio listing page before clicking into a project.
    """
    media_file = db.query(MediaFile).filter(
        MediaFile.id == media_file_id
    ).first()

    if not media_file:
        raise HTTPException(status_code=404, detail="File not found")

    project = db.query(Project).filter(
        Project.id == media_file.project_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.thumbnail_url = media_file.public_url
    db.commit()

    return MessageResponse(message="Thumbnail updated successfully")