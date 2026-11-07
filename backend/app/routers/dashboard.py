"""Signed-in user's library and review activity summary."""

from sqlalchemy import func, select

from fastapi import APIRouter

from app.dependencies import CurrentUser, DatabaseSession
from app.models import Book, Review, User, WishlistItem
from app.routers.books import book_with_rating
from app.schemas import DashboardRead, RecentReview


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardRead)
def get_dashboard(db: DatabaseSession, current_user: CurrentUser) -> DashboardRead:
    """Collect library totals, average personal rating, and five recent reviews."""
    total_books = db.scalar(select(func.count(Book.id))) or 0
    wishlist_count = db.scalar(select(func.count(WishlistItem.id)).where(WishlistItem.user_id == current_user.id)) or 0
    review_count = db.scalar(select(func.count(Review.id)).where(Review.user_id == current_user.id)) or 0
    average_rating = db.scalar(select(func.coalesce(func.avg(Review.rating), 0)).where(Review.user_id == current_user.id)) or 0
    recent_rows = db.execute(
        select(Review, Book.id.label("book_id"))
        .join(Book, Book.id == Review.book_id)
        .where(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
        .limit(5)
    ).all()
    recent_reviews = []
    for row in recent_rows:
        book = book_with_rating(db, row.book_id)
        if book is not None:
            recent_reviews.append(RecentReview(
                id=row.Review.id,
                rating=row.Review.rating,
                review_text=row.Review.review_text,
                created_at=row.Review.created_at,
                book=book,
            ))
    return DashboardRead(
        username=current_user.username,
        total_books=total_books,
        wishlist_count=wishlist_count,
        review_count=review_count,
        average_rating_given=float(average_rating),
        recent_reviews=recent_reviews,
    )
