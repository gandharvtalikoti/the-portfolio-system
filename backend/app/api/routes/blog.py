"""
blog.py — Blog post CRUD routes.
Exactly the same pattern as projects.py
"""

import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import BlogPost, User
from app.schemas.schemas import (
    BlogPostCreate, BlogPostUpdate,
    BlogPostRead, BlogPostListItem,
    MessageResponse
)
from app.services import s3_service
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/blog", tags=["Blog"])


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return re.sub(r'^-+|-+$', '', text)


def make_unique_slug(db: Session, base_slug: str, exclude_id: str = None) -> str:
    slug = base_slug
    counter = 2
    while True:
        query = db.query(BlogPost).filter(BlogPost.slug == slug)
        if exclude_id:
            query = query.filter(BlogPost.id != exclude_id)
        if not query.first():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


# ─── Public ───────────────────────────────────

@router.get("", response_model=List[BlogPostListItem])
def get_published_posts(db: Session = Depends(get_db)):
    """Returns all published blog posts. Portfolio site uses this."""
    return db.query(BlogPost).filter(
        BlogPost.is_published == True
    ).order_by(BlogPost.created_at.desc()).all()


@router.get("/admin/all", response_model=List[BlogPostListItem])
def get_all_posts_admin(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Admin only: returns all posts including drafts."""
    return db.query(BlogPost).order_by(
        BlogPost.created_at.desc()
    ).all()


@router.get("/{slug}", response_model=BlogPostRead)
def get_post_by_slug(slug: str, db: Session = Depends(get_db)):
    """Returns a single published blog post by slug."""
    post = db.query(BlogPost).filter(
        BlogPost.slug == slug,
        BlogPost.is_published == True
    ).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return post


# ─── Admin ────────────────────────────────────

@router.post("", response_model=BlogPostRead, status_code=201)
def create_post(
    data: BlogPostCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    base_slug = slugify(data.slug if data.slug else data.title)
    slug = make_unique_slug(db, base_slug)

    post = BlogPost(
        title=data.title,
        slug=slug,
        content=data.content,
        excerpt=data.excerpt,
        cover_image_url=data.cover_image_url,
        is_published=data.is_published
    )

    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=BlogPostRead)
def update_post(
    post_id: str,
    data: BlogPostUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", response_model=MessageResponse)
def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    # /*
    # Delete a blog post.
    # If it has a cover image stored in S3, delete that too.
    # */
    post = db.query(BlogPost).filter(
        BlogPost.id == post_id
    ).first()
    
    if not post:
        raise HTTPException(
            status_code=404,
            detail="Post not found"
        )
    
    # /*
    # Delete cover image from S3 if it exists.
    # We need to extract the S3 key from the URL.
    
    # URL format:
    # https://bucket.s3.region.amazonaws.com/blog/filename.jpg
    
    # S3 key = everything after the domain:
    # blog/filename.jpg
    # */
    if post.cover_image_url:
        try:
            # /* Extract s3_key from the public URL */
            from urllib.parse import urlparse
            parsed = urlparse(post.cover_image_url)
            # /* parsed.path = "/blog/filename.jpg" */
            # /* Remove leading slash to get the key */
            s3_key = parsed.path.lstrip("/")
            
            if s3_key:
                s3_service.delete_file(s3_key)
        except Exception as e:
            print(f"Warning: Could not delete cover image from S3: {e}")
    
    db.delete(post)
    db.commit()
    
    return MessageResponse(message="Post deleted successfully")