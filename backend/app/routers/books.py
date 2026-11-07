"""Book collection endpoints, including search and genre filtering."""

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import delete, func, or_, select

from app.dependencies import CurrentUser, DatabaseSession
from app.models import Book, Review, WishlistItem
from app.schemas import BookCreate, BookRead


router = APIRouter(prefix="/api/books", tags=["books"])


def book_with_rating(db: DatabaseSession, book_id: int) -> BookRead | None:
    """Load one book together with its average rating and review count."""
    row = db.execute(
        select(Book, func.coalesce(func.avg(Review.rating), 0).label("average_rating"), func.count(Review.id).label("review_count"))
        .outerjoin(Review, Review.book_id == Book.id)
        .where(Book.id == book_id)
        .group_by(Book.id)
    ).first()
    return BookRead.model_validate({**row.Book.__dict__, "average_rating": float(row.average_rating), "review_count": row.review_count}) if row else None


@router.get("", response_model=list[BookRead])
def list_books(
    db: DatabaseSession,
    q: str | None = Query(default=None, max_length=120),
    title: str | None = Query(default=None, max_length=120),
    author: str | None = Query(default=None, max_length=120),
    genre: str | None = Query(default=None, max_length=80),
) -> list[BookRead]:
    """List books with optional title, author, general search, and genre filters."""
    statement = (
        select(Book, func.coalesce(func.avg(Review.rating), 0).label("average_rating"), func.count(Review.id).label("review_count"))
        .outerjoin(Review, Review.book_id == Book.id)
        .group_by(Book.id)
        .order_by(Book.created_at.desc(), Book.id.desc())
    )
    if q and q.strip():
        search = f"%{q.strip()}%"
        statement = statement.where(or_(Book.title.ilike(search), Book.author.ilike(search)))
    if title and title.strip():
        statement = statement.where(Book.title.ilike(f"%{title.strip()}%"))
    if author and author.strip():
        statement = statement.where(Book.author.ilike(f"%{author.strip()}%"))
    if genre and genre.strip() and genre.lower() != "all":
        statement = statement.where(Book.genre.ilike(genre.strip()))
    rows = db.execute(statement).all()
    return [BookRead.model_validate({**row.Book.__dict__, "average_rating": float(row.average_rating), "review_count": row.review_count}) for row in rows]


@router.get("/genres", response_model=list[str])
def list_genres(db: DatabaseSession) -> list[str]:
    """Return the distinct genres currently represented in the collection."""
    return list(db.scalars(select(Book.genre).distinct().order_by(Book.genre)).all())


@router.post("", response_model=BookRead, status_code=status.HTTP_201_CREATED)
def create_book(payload: BookCreate, db: DatabaseSession, _current_user: CurrentUser) -> BookRead:
    """Add a book to the shared collection; a signed-in user is required."""
    book = Book(**payload.model_dump())
    db.add(book)
    db.commit()
    db.refresh(book)
    return BookRead.model_validate({**book.__dict__, "average_rating": 0, "review_count": 0})


@router.get("/{book_id}", response_model=BookRead)
def get_book(book_id: int, db: DatabaseSession) -> BookRead:
    """Fetch book details with an up-to-date average and review total."""
    book = book_with_rating(db, book_id)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    return book


@router.put("/{book_id}", response_model=BookRead)
def update_book(book_id: int, payload: BookCreate, db: DatabaseSession, _current_user: CurrentUser) -> BookRead:
    """Update a book's catalog details; a signed-in user is required."""
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    for field, value in payload.model_dump().items():
        setattr(book, field, value)
    db.commit()
    return book_with_rating(db, book_id)  # type: ignore[return-value]


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: DatabaseSession, _current_user: CurrentUser) -> None:
    """Remove a catalog book and its dependent wishlist entries and reviews."""
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    db.execute(delete(WishlistItem).where(WishlistItem.book_id == book_id))
    db.execute(delete(Review).where(Review.book_id == book_id))
    db.delete(book)
    db.commit()
