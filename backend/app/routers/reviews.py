"""Public book reviews and private review editing endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import func, select

from app.dependencies import CurrentUser, DatabaseSession
from app.models import Book, Review, User
from app.schemas import BookRead, MyReview, ReviewCreate, ReviewRead, ReviewUpdate


router = APIRouter(tags=["reviews"])


def to_review_read(review: Review) -> ReviewRead:
    """Add the author's public username to a review response."""
    return ReviewRead(
        id=review.id,
        book_id=review.book_id,
        user_id=review.user_id,
        username=review.user.username,
        rating=review.rating,
        review_text=review.review_text,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )


@router.get("/api/books/{book_id}/reviews", response_model=list[ReviewRead])
def get_book_reviews(book_id: int, db: DatabaseSession) -> list[ReviewRead]:
    """List public reviews for one book, newest first."""
    if db.get(Book, book_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    reviews = db.scalars(select(Review).where(Review.book_id == book_id).order_by(Review.created_at.desc())).all()
    return [to_review_read(review) for review in reviews]


@router.get("/api/reviews/mine", response_model=list[MyReview])
def get_my_reviews(db: DatabaseSession, current_user: CurrentUser) -> list[dict]:
    """List the caller's reviews with book details for the My Reviews page."""
    rows = db.execute(
        select(Review, Book, func.coalesce(func.avg(Review.rating).over(partition_by=Book.id), 0).label("average_rating"))
        .join(Book, Book.id == Review.book_id)
        .where(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
    ).all()
    results = []
    for row in rows:
        book = BookRead.model_validate({**row.Book.__dict__, "average_rating": float(row.average_rating), "review_count": 0})
        results.append({**to_review_read(row.Review).model_dump(), "book": book.model_dump()})
    return results


@router.post("/api/reviews/{book_id}", response_model=ReviewRead)
def create_or_update_review(
    book_id: int,
    payload: ReviewCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
    response: Response,
) -> ReviewRead:
    """Create a review or update the signed-in user's existing book review."""
    book = db.get(Book, book_id)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    review = db.scalar(select(Review).where(Review.user_id == current_user.id, Review.book_id == book_id))
    if review:
        review.rating = payload.rating
        review.review_text = payload.review_text.strip()
        review.updated_at = datetime.now(timezone.utc)
    else:
        review = Review(user_id=current_user.id, book_id=book_id, rating=payload.rating, review_text=payload.review_text.strip())
        db.add(review)
        response.status_code = status.HTTP_201_CREATED
    db.commit()
    db.refresh(review)
    return to_review_read(review)


@router.put("/api/reviews/{review_id}", response_model=ReviewRead)
def update_review(review_id: int, payload: ReviewUpdate, db: DatabaseSession, current_user: CurrentUser) -> ReviewRead:
    """Edit a review only when it belongs to the signed-in user."""
    review = db.scalar(select(Review).where(Review.id == review_id, Review.user_id == current_user.id))
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found.")
    review.rating = payload.rating
    review.review_text = payload.review_text.strip()
    review.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(review)
    return to_review_read(review)


@router.delete("/api/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, db: DatabaseSession, current_user: CurrentUser) -> None:
    """Delete a review only when it belongs to the signed-in user."""
    review = db.scalar(select(Review).where(Review.id == review_id, Review.user_id == current_user.id))
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found.")
    db.delete(review)
    db.commit()
