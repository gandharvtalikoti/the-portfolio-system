"""
main.py — FastAPI application entry point.

This file:
1. Creates the FastAPI app
2. Sets up CORS
3. Registers all route files
4. Creates DB tables and seeds first admin on startup
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import engine, SessionLocal
from app.models import models
from app.db.seed import seed_first_admin
from app.api.routes import auth, projects, blog, upload


# ─────────────────────────────────────────────
# LIFESPAN
# Code that runs on startup and shutdown
# ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── STARTUP ──────────────────────────────
    print("🚀 Starting Portfolio API...")

    # Create all tables that don't exist yet
    # In production we'll use Alembic migrations
    # For now this is fine for development
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database tables ready")

    # Create first admin user if none exists
    db = SessionLocal()
    try:
        seed_first_admin(db)
    finally:
        db.close()

    yield   # ← app runs here, handling requests

    # ── SHUTDOWN ─────────────────────────────
    print("👋 Shutting down...")


# ─────────────────────────────────────────────
# CREATE APP
# ─────────────────────────────────────────────

app = FastAPI(
    title="Portfolio API",
    description="Backend for portfolio site and admin dashboard",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",    # Swagger UI at http://localhost:8000/docs
    redoc_url="/redoc",  # ReDoc UI  at http://localhost:8000/redoc
)


# ─────────────────────────────────────────────
# CORS MIDDLEWARE
# ─────────────────────────────────────────────
# CORS = Cross-Origin Resource Sharing
#
# Browsers BLOCK requests from one domain to another by default.
# Your frontend on localhost:3000 calling your API on localhost:8000
# is a "cross-origin" request — different ports = different origins.
#
# Without CORS middleware:
#   Browser blocks the request before it even leaves
#   You see: "Access to fetch blocked by CORS policy"
#
# With CORS middleware:
#   Server tells browser "these origins are allowed"
#   Browser allows the request through

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",")],
    # ["http://localhost:3000", "http://localhost:3001"]
    allow_credentials=True,
    allow_methods=["*"],    # allow GET, POST, PUT, DELETE etc.
    allow_headers=["*"],    # allow Authorization, Content-Type etc.
)


# ─────────────────────────────────────────────
# REGISTER ROUTES
# All routes prefixed with /api
# ─────────────────────────────────────────────

app.include_router(auth.router,     prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(blog.router,     prefix="/api")
app.include_router(upload.router,   prefix="/api")
# Final route map:
# /api/auth/login
# /api/auth/me
# /api/projects
# /api/projects/{slug}
# /api/blog
# /api/blog/{slug}


# ─────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health_check():
    """
    Simple endpoint to verify the API is running.
    Deployment services ping this to check app health.
    """
    return {
        "status": "healthy",
        "environment": settings.APP_ENV
    }