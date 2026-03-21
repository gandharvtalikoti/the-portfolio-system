"""
auth.py — Login and user info routes.

POST /api/auth/login  → verify credentials → return JWT token
GET  /api/auth/me     → return current logged-in user info
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import LoginRequest, TokenResponse, UserRead
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_user

# APIRouter is like a mini-app
# prefix="/auth" means all routes here start with /auth
# tags=["Auth"] groups them in the /docs page
router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password.
    Returns a JWT token to use in future requests.

    Step by step:
    1. Frontend sends { "email": "...", "password": "..." }
    2. We find the user by email in the database
    3. We verify the password against the stored hash
    4. We create a JWT token with the user's id
    5. We return the token + user info

    The frontend saves this token and sends it with every
    future request in the Authorization header.
    """

    # Step 1: find user by email
    user = db.query(User).filter(User.email == request.email).first()

    # Step 2: verify password
    # IMPORTANT: we use the same error message for both cases
    # "user not found" vs "wrong password"
    # Why? If we said "user not found" an attacker learns
    # which emails exist in your system
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Step 3: check account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )

    # Step 4: create JWT token
    token = create_access_token(user_id=user.id, email=user.email)

    # Step 5: return token + user info
    # response_model=TokenResponse tells FastAPI to validate
    # and serialize this return value using the TokenResponse schema
    return TokenResponse(
        access_token=token,
        user=UserRead.model_validate(user)
        # model_validate converts SQLAlchemy User object → UserRead schema
    )


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns info about the currently logged-in user.

    The admin dashboard calls this on page load to check:
    - Is my token still valid?
    - Who am I logged in as?

    Depends(get_current_user) protects this route automatically.
    If token is missing or invalid → 401 returned before this code runs.
    """
    return current_user