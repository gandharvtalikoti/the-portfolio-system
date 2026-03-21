"""
models.py — All database tables as Python classes.

Each class = one table in PostgreSQL.
Each attribute = one column.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Boolean,
    Integer, DateTime, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.db.database import Base


# ─────────────────────────────────────────────
# ENUMS
# These are fixed sets of allowed values.
# Like a dropdown — only these options are valid.
# ─────────────────────────────────────────────

class ProjectCategory(str, enum.Enum):
    photography = "photography"
    video       = "video"
    design      = "design"
    code        = "code"
    other       = "other"


class MediaFileType(str, enum.Enum):
    image = "image"
    video = "video"
    pdf   = "pdf"


# ─────────────────────────────────────────────
# HELPER
# ─────────────────────────────────────────────

def generate_uuid():
    """Generate a new UUID string for use as a primary key."""
    return str(uuid.uuid4())


# ─────────────────────────────────────────────
# USER TABLE
# Stores admin users. Just you, for now.
# ─────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    # We NEVER store plain text passwords — always a bcrypt hash
    # "changeme123" becomes "$2b$12$..." (unrecognizable)

    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email}>"


# ─────────────────────────────────────────────
# PROJECT TABLE
# One portfolio piece — photos, video, design etc.
# ─────────────────────────────────────────────

class Project(Base):
    __tablename__ = "projects"

    id            = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    title         = Column(String(255), nullable=False)
    slug          = Column(String(255), unique=True, nullable=False, index=True)
    # slug = URL-friendly title
    # "My Beach Photos" → "my-beach-photos"
    # Used in the URL: yoursite.com/work/my-beach-photos

    description   = Column(Text, nullable=True)
    category      = Column(SAEnum(ProjectCategory), nullable=False)
    tags          = Column(String(500), default="")
    # Tags stored as comma-separated string: "nature,travel,film"
    # Simple approach — good enough for a portfolio

    thumbnail_url = Column(String(1000), nullable=True)
    # The main preview image (stored in S3, we save the URL here)

    is_published  = Column(Boolean, default=False)
    # False = draft, only you see it
    # True  = live on your portfolio site

    order         = Column(Integer, default=0)
    # Controls display order on portfolio
    # Lower number = appears first
    # You'll be able to drag-to-reorder in the admin

    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship: project.media_files gives you all files for this project
    # cascade="all, delete-orphan" means:
    # if you delete a project, all its media files are also deleted automatically
    media_files   = relationship(
        "MediaFile",
        back_populates="project",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Project {self.title}>"


# ─────────────────────────────────────────────
# MEDIA FILE TABLE
# A single image/video/pdf belonging to a project.
# The actual file lives in AWS S3.
# We only store the URL + metadata here.
# ─────────────────────────────────────────────

class MediaFile(Base):
    __tablename__ = "media_files"

    id         = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    project_id = Column(
        UUID(as_uuid=False),
        ForeignKey("projects.id"),   # links to the projects table
        nullable=False
    )

    s3_key     = Column(String(1000), nullable=False)
    # The path inside your S3 bucket
    # Example: "projects/abc-123/hero-photo.jpg"

    public_url = Column(String(1000), nullable=False)
    # The full URL to access the file
    # Example: "https://your-bucket.s3.amazonaws.com/projects/abc-123/hero-photo.jpg"

    file_type  = Column(SAEnum(MediaFileType), nullable=False)
    file_name  = Column(String(255), nullable=False)
    file_size  = Column(Integer, nullable=True)   # in bytes
    order      = Column(Integer, default=0)       # order within project gallery

    created_at = Column(DateTime, default=datetime.utcnow)

    # Back-reference: media_file.project gives you the parent project object
    project    = relationship("Project", back_populates="media_files")

    def __repr__(self):
        return f"<MediaFile {self.file_name}>"


# ─────────────────────────────────────────────
# BLOG POST TABLE
# Written content. Stored as Markdown text.
# Frontend renders Markdown → HTML
# ─────────────────────────────────────────────

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    title           = Column(String(255), nullable=False)
    slug            = Column(String(255), unique=True, nullable=False, index=True)
    content         = Column(Text, nullable=False)
    # Full markdown content
    # "# Hello\n\nThis is my **post**"

    excerpt         = Column(String(500), nullable=True)
    # Short preview shown on the blog listing page
    # Like a summary of the post

    cover_image_url = Column(String(1000), nullable=True)
    is_published    = Column(Boolean, default=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<BlogPost {self.title}>"