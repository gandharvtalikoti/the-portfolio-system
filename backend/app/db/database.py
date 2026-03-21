"""
database.py — Connects Python to PostgreSQL.

Three things this file creates:

1. engine   — the actual connection to your database
               like opening a phone line to PostgreSQL

2. SessionLocal — a factory that creates sessions
                  a session = one conversation with the DB
                  open it → do stuff → close it

3. Base     — parent class for all your models
               every model inherits from this so SQLAlchemy
               knows about your tables
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


# Create the engine
# echo=True means it prints every SQL query in the terminal (helpful for learning)
engine = create_engine(
    settings.DATABASE_URL,
    echo=True if settings.APP_ENV == "development" else False,
    pool_pre_ping=True,    # test connection before using it
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class — all models inherit from this
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that gives routes a database session.

    How it works:
    - Opens a session before the route runs
    - Passes it to the route
    - Closes it after the route finishes
    - Even if an error occurs, it still closes (the finally block)

    Usage in any route:
        @router.get("/projects")
        def get_projects(db: Session = Depends(get_db)):
            projects = db.query(Project).all()
            return projects
    """
    db = SessionLocal()
    try:
        yield db        # ← route runs here, using this db session
    finally:
        db.close()      # ← always closes, success or error