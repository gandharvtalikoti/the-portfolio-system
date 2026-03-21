"""
schemas.py — Pydantic models defining API request/response shapes.

Pydantic validates data automatically:
- Wrong type → automatic error
- Missing required field → automatic error
- Extra fields → ignored or rejected

FastAPI uses these to:
1. Validate incoming JSON from frontend
2. Generate the /docs API documentation automatically
3. Serialize Python objects → JSON for responses
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.models import ProjectCategory, MediaFileType


# ══════════════════════════════════════════
# MEDIA FILE SCHEMAS
# ══════════════════════════════════════════

class MediaFileBase(BaseModel):
    file_name: str
    file_type: MediaFileType
    order: int = 0


class MediaFileCreate(MediaFileBase):
    """
    Used internally when saving an uploaded file to the DB.
    Frontend doesn't call this directly — the upload endpoint
    calls this after saving to S3.
    """
    s3_key: str
    public_url: str
    file_size: Optional[int] = None
    project_id: str


class MediaFileRead(MediaFileBase):
    """
    What the API sends back when returning media files.
    Includes all fields the frontend needs to display the file.
    """
    id: str
    s3_key: str
    public_url: str
    file_size: Optional[int]
    project_id: str
    created_at: datetime

    class Config:
        from_attributes = True
        # from_attributes = True tells Pydantic:
        # "the data might come from a SQLAlchemy object, not a dict"
        # Without this, pydantic can't read SQLAlchemy model attributes


# ══════════════════════════════════════════
# PROJECT SCHEMAS
# ══════════════════════════════════════════

class ProjectBase(BaseModel):
    """Fields shared between Create and Read schemas."""
    title: str = Field(..., min_length=1, max_length=255)
    # Field(...) means required
    # min_length=1 means can't be empty string
    # FastAPI validates this automatically

    description: Optional[str] = None
    # Optional means this field can be missing or null

    category: ProjectCategory
    # Must be one of: photography, video, design, code, other
    # Anything else → automatic validation error

    tags: Optional[str] = ""
    # Comma-separated: "nature,travel,film"

    is_published: bool = False
    # Defaults to False (draft) if not provided

    order: int = 0


class ProjectCreate(ProjectBase):
    """
    What the frontend sends to CREATE a project.
    POST /api/projects
    Body: { "title": "...", "category": "...", ... }
    """
    slug: Optional[str] = None
    # If not provided, backend auto-generates from title
    # "Beach Photos" → "beach-photos"

    thumbnail_url: Optional[str] = None


class ProjectUpdate(BaseModel):
    """
    What the frontend sends to UPDATE a project.
    PUT /api/projects/{id}

    ALL fields are optional here.
    Only send the fields you want to change:
    { "title": "New Title" }  ← only updates title, leaves rest unchanged
    """
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[ProjectCategory] = None
    tags: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None
    order: Optional[int] = None


class ProjectRead(ProjectBase):
    """
    What the API sends BACK after create/read/update.
    Includes database-generated fields (id, timestamps)
    and nested media_files list.
    """
    id: str
    slug: str
    thumbnail_url: Optional[str]
    media_files: List[MediaFileRead] = []
    # Nested list — when you fetch a project, you get its files too
    # { "id": "...", "title": "...", "media_files": [ {...}, {...} ] }

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListItem(BaseModel):
    """
    Lighter version used for listing pages.
    Does NOT include media_files — keeps the response small.

    Imagine loading 50 projects each with 10 files = 500 objects.
    For a list view, you only need the thumbnail, not all files.
    """
    id: str
    title: str
    slug: str
    category: ProjectCategory
    tags: str
    thumbnail_url: Optional[str]
    is_published: bool
    order: int
    created_at: datetime

    class Config:
        from_attributes = True


# ══════════════════════════════════════════
# BLOG POST SCHEMAS
# ══════════════════════════════════════════

class BlogPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_published: bool = False


class BlogPostCreate(BlogPostBase):
    """
    What frontend sends to CREATE a blog post.
    POST /api/blog
    """
    slug: Optional[str] = None


class BlogPostUpdate(BaseModel):
    """
    What frontend sends to UPDATE a blog post.
    All optional — only send what changed.
    """
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_published: Optional[bool] = None


class BlogPostRead(BlogPostBase):
    """Full blog post returned by the API."""
    id: str
    slug: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlogPostListItem(BaseModel):
    """
    Lighter version for listing pages.
    Does NOT include full content (could be thousands of words).
    Only includes excerpt for preview.
    """
    id: str
    title: str
    slug: str
    excerpt: Optional[str]
    cover_image_url: Optional[str]
    is_published: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ══════════════════════════════════════════
# AUTH SCHEMAS
# ══════════════════════════════════════════

class UserCreate(BaseModel):
    email: EmailStr
    # EmailStr validates it's actually an email format
    # "notanemail" → validation error
    # "user@example.com" → passes

    password: str = Field(..., min_length=8)
    # min_length=8 enforces minimum password length


class UserRead(BaseModel):
    """
    What the API returns for user info.
    Notice: hashed_password is NOT here — never exposed.
    """
    id: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """What the frontend sends to log in."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """What the API sends back after successful login."""
    access_token: str
    token_type: str = "bearer"
    user: UserRead
    # We return user info alongside the token
    # So the frontend knows who is logged in immediately


# ══════════════════════════════════════════
# GENERIC SCHEMAS
# ══════════════════════════════════════════

class MessageResponse(BaseModel):
    """
    Simple response for operations that don't return data.
    Used for: delete, toggle publish etc.
    { "message": "Project deleted successfully" }
    """
    message: str