"""
projects.py — All project CRUD routes.

Public:
  GET /api/projects              list published projects
  GET /api/projects/{slug}       get one project

Admin only:
  GET    /api/projects/admin/all   list ALL including drafts
  POST   /api/projects             create
  PUT    /api/projects/{id}        update
  DELETE /api/projects/{id}        delete
  PATCH  /api/projects/{id}/publish toggle published/draft
"""

import re
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.models import Project, ProjectCategory, User
from app.schemas.schemas import (
    ProjectCreate, ProjectUpdate,
    ProjectRead, ProjectListItem,
    MessageResponse
)
from app.services import s3_service
from app.models.models import Project, ProjectCategory, User, MediaFile
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def slugify(text: str) -> str:
    """
    Convert any text to a URL-friendly slug.

    "My Beach Photos!"  →  "my-beach-photos"
    "Hello, World"      →  "hello-world"
    "  spaces  "        →  "spaces"
    """
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)     # remove special chars
    text = re.sub(r'[\s_-]+', '-', text)     # spaces/underscores → hyphens
    text = re.sub(r'^-+|-+$', '', text)      # trim leading/trailing hyphens
    return text


def make_unique_slug(db: Session, base_slug: str, exclude_id: str = None) -> str:
    """
    Make sure slug is unique in the database.
    If "beach-photos" exists, try "beach-photos-2", then "beach-photos-3" etc.

    exclude_id: when EDITING a project, exclude itself from the check
    """
    slug = base_slug
    counter = 2

    while True:
        query = db.query(Project).filter(Project.slug == slug)
        if exclude_id:
            query = query.filter(Project.id != exclude_id)

        exists = query.first()
        if not exists:
            return slug     # this slug is available

        # try the next number
        slug = f"{base_slug}-{counter}"
        counter += 1


# ─────────────────────────────────────────────
# PUBLIC ROUTES
# Anyone can call these — no token needed
# ─────────────────────────────────────────────

@router.get("", response_model=List[ProjectListItem])
def get_published_projects(
    category: Optional[ProjectCategory] = Query(
        None,
        description="Filter by category: photography, video, design, code, other"
    ),
    db: Session = Depends(get_db)
):
    """
    Returns all published projects.
    This is what your portfolio site displays.

    Optional filter: GET /api/projects?category=photography
    """
    query = db.query(Project).filter(Project.is_published == True)

    if category:
        query = query.filter(Project.category == category)

    # order by: lower number first, then newest first
    projects = query.order_by(
        Project.order.asc(),
        Project.created_at.desc()
    ).all()

    return projects


@router.get("/admin/all", response_model=List[ProjectRead])
def get_all_projects_admin(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Admin only: returns ALL projects including unpublished drafts.
    The admin dashboard uses this to show everything.
    """
    return db.query(Project).order_by(
        Project.order.asc(),
        Project.created_at.desc()
    ).all()


@router.get("/admin/{project_id}", response_model=ProjectRead)
def get_project_by_id_admin(
    project_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Admin only: get a single project by ID.
    Used by the edit page to load full project data
    including media_files.
    """
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project

@router.get("/{slug}", response_model=ProjectRead)
def get_project_by_slug(slug: str, db: Session = Depends(get_db)):
    """
    Returns a single published project with all its media files.
    Used by: yoursite.com/work/beach-photos
    """
    project = db.query(Project).filter(
        Project.slug == slug,
        Project.is_published == True
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{slug}' not found"
        )

    return project


# ─────────────────────────────────────────────
# ADMIN ROUTES
# All require valid JWT token
# ─────────────────────────────────────────────

@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Create a new project.

    FastAPI automatically:
    - Reads the JSON body
    - Validates it against ProjectCreate schema
    - Rejects with 422 if validation fails

    Then we:
    - Generate a unique slug
    - Create the Project object
    - Save to database
    - Return the created project
    """
    # generate slug from provided slug or title
    base_slug = slugify(data.slug if data.slug else data.title)
    unique_slug = make_unique_slug(db, base_slug)

    project = Project(
        title=data.title,
        slug=unique_slug,
        description=data.description,
        category=data.category,
        tags=data.tags or "",
        thumbnail_url=data.thumbnail_url,
        is_published=data.is_published,
        order=data.order
    )

    db.add(project)      # stage the new record
    db.commit()          # write to database
    db.refresh(project)  # reload from DB to get generated id, timestamps

    return project


@router.put("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: str,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Update a project. Only send the fields you want to change.

    Example — just update the title:
    PUT /api/projects/abc-123
    { "title": "New Title" }

    Everything else stays the same.
    """
    # find the project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # model_dump(exclude_unset=True) gives us only the fields
    # that were actually sent — not the ones that defaulted to None
    # So { "title": "New" } only updates title, not description etc.
    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(project, field, value)
        # setattr(project, "title", "New Title")
        # is the same as: project.title = "New Title"

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", response_model=MessageResponse)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    # /*
    # Delete a project and clean up everything:
    # 1. Find all media files belonging to this project
    # 2. Delete each file from S3
    # 3. Delete project from database (cascade deletes media_file rows)
    
    # Order matters:
    # - Delete from S3 first
    # - Then delete from DB
    
    # Why this order?
    # If DB delete happens first and then S3 fails,
    # we have orphaned S3 files with no DB records.
    # If S3 delete happens first and DB fails,
    # we have DB records pointing to missing files.
    # Both are bad but orphaned S3 files cost money
    # and are harder to clean up later.
    # We do S3 first, then DB.
    # */
    
    # /* Find the project */
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    
    # /* Get all media files before deleting */
    media_files = db.query(MediaFile).filter(
        MediaFile.project_id == project_id
    ).all()
    
    # /* Delete each file from S3 */
    s3_errors = []
    for media_file in media_files:
        try:
            s3_service.delete_file(media_file.s3_key)
        except Exception as e:
            # /* 
            # Don't stop the whole operation if one S3 delete fails.
            # Collect errors and continue.
            # We still want to delete the project even if S3 has issues.
            # */
            s3_errors.append(media_file.s3_key)
            print(f"Warning: Could not delete S3 file {media_file.s3_key}: {e}")
    
    # /* Delete from database */
    # /* cascade="all, delete-orphan" handles media_files rows automatically */
    db.delete(project)
    db.commit()
    
    # /* Build response message */
    if s3_errors:
        return MessageResponse(
            message=f"Project deleted. Warning: {len(s3_errors)} S3 file(s) could not be deleted and may need manual cleanup."
        )
    
    return MessageResponse(
        message=f"Project and {len(media_files)} file(s) deleted successfully"
    )

@router.patch("/{project_id}/publish", response_model=ProjectRead)
def toggle_publish(
    project_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Toggle a project between published and draft.
    Published → Draft, or Draft → Published.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # flip the boolean
    project.is_published = not project.is_published

    db.commit()
    db.refresh(project)
    return project

