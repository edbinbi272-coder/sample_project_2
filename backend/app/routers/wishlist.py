"""Private, per-user wishlist endpoints."""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from app.dependencies import CurrentUser, DatabaseSession
from app.models import Book, Review, User, WishlistItem
from app.schemas import BookRead, WishlistBook


router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.get("", response_model=list[WishlistBook])
def get_wishlist(db: DatabaseSession, current_user: CurrentUser) -> list[WishlistBook]:
    """List only the signed-in user's saved books, newest saves first."""
    rows = db.execute(
        select(WishlistItem, Book, func.coalesce(func.avg(Review.rating), 0).label("average_rating"), func.count(Review.id).label("review_count"))
        .join(Book, Book.id == WishlistItem.book_id)
        .outerjoin(Review, Review.book_id == Book.id)
        .where(WishlistItem.user_id == current_user.id)
        .group_by(WishlistItem.id, Book.id)
        .order_by(WishlistItem.added_at.desc())
    ).all()
    return [
        WishlistBook.model_validate({**row.Book.__dict__, "average_rating": float(row.average_rating), "review_count": row.review_count, "added_at": row.WishlistItem.added_at})
        for row in rows
    ]


@router.post("/{book_id}", status_code=status.HTTP_201_CREATED, response_model=BookRead)
def add_to_wishlist(book_id: int, db: DatabaseSession, current_user: CurrentUser) -> BookRead:
    """Save a book to the caller's wishlist, rejecting duplicate saves."""
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    existing = db.scalar(select(WishlistItem).where(WishlistItem.user_id == current_user.id, WishlistItem.book_id == book_id))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This book is already in your wishlist.")
    db.add(WishlistItem(user_id=current_user.id, book_id=book_id))
    db.commit()
    db.refresh(book)
    rating, count = db.execute(select(func.coalesce(func.avg(Review.rating), 0), func.count(Review.id)).where(Review.book_id == book_id)).one()
    return BookRead.model_validate({**book.__dict__, "average_rating": float(rating), "review_count": count})


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(book_id: int, db: DatabaseSession, current_user: CurrentUser) -> None:
    """Remove a book only from the caller's wishlist."""
    item = db.scalar(select(WishlistItem).where(WishlistItem.user_id == current_user.id, WishlistItem.book_id == book_id))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="That book is not in your wishlist.")
    db.delete(item)
    db.commit()
