"""SQLAlchemy engine, session factory, and shared declarative base."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    """Base class inherited by every database model."""


engine_options = {"pool_pre_ping": True}
if settings.database_url.startswith("sqlite"):
    # FastAPI runs synchronous database work in worker threads. SQLite connections
    # need this option when a request can use a connection from another thread.
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.database_url, **engine_options)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    """Give one database session to a request and always close it afterward."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
