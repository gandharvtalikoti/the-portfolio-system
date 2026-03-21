"""
dependencies.py — Reusable FastAPI dependencies.

The main one: get_current_user
  → reads JWT from Authorization header
  → verifies it
  → returns the User object
  → or raises 401 if anything is wrong

Add Depends(get_current_user) to any route that requires login.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import verify_access_token
from app.models.models import User

# HTTPBearer reads the "Authorization: Bearer <token>" header
# FastAPI handles this automatically — you don't parse the header yourself
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Protected route dependency.

    What it does step by step:
    1. Reads Authorization header → "Bearer eyJ..."
    2. Extracts the token → "eyJ..."
    3. Verifies the JWT signature and expiry
    4. Extracts user_id from token payload
    5. Looks up user in database
    6. Returns User object if everything is valid
    7. Raises 401 at any failure point

    Usage:
        @router.delete("/projects/{id}")
        def delete_project(
            id: str,
            db: Session = Depends(get_db),
            _: User = Depends(get_current_user)  ← protects this route
        ):
            ...

    The underscore _ means "I need auth but won't use the user object"
    If you need the user: current_user: User = Depends(get_current_user)
    """

    # This error is reused in multiple places below
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Step 1+2: HTTPBearer already extracted the token for us
    token = credentials.credentials

    # Step 3: verify signature and expiry
    payload = verify_access_token(token)
    if payload is None:
        raise unauthorized

    # Step 4: get user_id from payload
    user_id: str = payload.get("sub")
    if user_id is None:
        raise unauthorized

    # Step 5: look up user in database
    user = db.query(User).filter(User.id == user_id).first()

    # Step 6: user must exist and be active
    if user is None or not user.is_active:
        raise unauthorized

    return user