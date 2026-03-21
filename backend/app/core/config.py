"""
config.py — Reads your .env file into Python.

Instead of doing os.environ["DATABASE_URL"] everywhere,
you import settings and use settings.DATABASE_URL

Clean, typed, and autocomplete works in VS Code.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # First admin
    FIRST_ADMIN_EMAIL: str = "admin@example.com"
    FIRST_ADMIN_PASSWORD: str = "changeme123"

    # AWS (empty for now)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = ""
    CLOUDFRONT_DOMAIN: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Single instance — import this everywhere in the app
settings = Settings()