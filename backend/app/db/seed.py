"""
seed.py — Creates the first admin user on startup.

Checks if any users exist.
If not → creates one using FIRST_ADMIN_EMAIL and FIRST_ADMIN_PASSWORD from .env
"""

from sqlalchemy.orm import Session
from app.models.models import User
from app.core.security import hash_password
from app.core.config import settings


def seed_first_admin(db: Session):
    # check if any user exists already
    existing_user = db.query(User).first()
    if existing_user:
        return  # already set up, skip

    print(f"🌱 No users found. Creating first admin: {settings.FIRST_ADMIN_EMAIL}")

    admin = User(
        email=settings.FIRST_ADMIN_EMAIL,
        hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
        is_active=True
    )

    db.add(admin)
    db.commit()

    print("✅ Admin user created successfully!")
    print("👉 Please change your password after first login.")