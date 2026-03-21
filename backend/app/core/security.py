"""
security.py — Password hashing and JWT token creation/verification.

Two responsibilities:
1. hash_password() / verify_password()  → safe password storage
2. create_access_token() / verify_access_token() → JWT auth
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings


# ─────────────────────────────────────────────
# PASSWORD HASHING
# ─────────────────────────────────────────────

# CryptContext manages hashing algorithms
# bcrypt is the industry standard for passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """
    Turn a plain password into a bcrypt hash.

    "mypassword123" → "$2b$12$Kix/GbfhS..."

    Call this when:
    - Creating a new user
    - User changes their password

    Never store the plain password anywhere.
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Check if a plain password matches a stored hash.

    Returns True if match, False if not.

    Call this during login:
    verify_password("mypassword123", "$2b$12$Kix...") → True
    verify_password("wrongpassword", "$2b$12$Kix...") → False
    """
    return pwd_context.verify(plain_password, hashed_password)


# ─────────────────────────────────────────────
# JWT TOKENS
# ─────────────────────────────────────────────

def create_access_token(user_id: str, email: str) -> str:
    """
    Create a signed JWT token containing user_id and email.

    The token:
    - Contains: user_id, email, expiry time
    - Is signed with SECRET_KEY
    - Expires after ACCESS_TOKEN_EXPIRE_MINUTES (30 min default)

    After expiry, token is invalid → user must log in again.
    """
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,     # "subject" — standard JWT field for who this is
        "email": email,
        "exp": expire,      # expiry — jose library checks this automatically
        "type": "access"    # we add this to distinguish from other token types
    }

    # jwt.encode signs the payload with your SECRET_KEY
    # Anyone can READ a JWT (it's just base64)
    # But only YOUR SERVER can create a VALID one (needs the secret key)
    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM   # HS256
    )

    return token


def verify_access_token(token: str) -> Optional[dict]:
    """
    Verify a JWT token and return its payload if valid.
    Returns None if token is invalid, expired, or tampered with.

    Called on every protected API request.

    Returns the payload dict:
    {
        "sub": "user-id-abc-123",
        "email": "you@email.com",
        "exp": 1234567890,
        "type": "access"
    }
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
            # jose automatically checks:
            # ✅ signature is valid (not tampered)
            # ✅ token is not expired (checks "exp" field)
        )

        # Extra check: make sure it's an access token
        if payload.get("type") != "access":
            return None

        return payload

    except JWTError:
        # Any problem (wrong signature, expired, malformed) → return None
        return None