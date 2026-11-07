"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app import models  # noqa: F401 - importing registers every model with SQLAlchemy metadata.
from app.routers import auth, books, dashboard, reviews, wishlist


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Create missing tables when the local development server starts."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Readers Paradise API",
    description="A book discovery, wishlist, and review API.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(wishlist.router)
app.include_router(reviews.router)
app.include_router(dashboard.router)


@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Simple check that confirms the API process is responding."""
    return {"status": "ok"}
