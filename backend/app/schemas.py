"""Pydantic request and response models used to validate API data."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[A-Za-z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def passwords_must_match(self) -> "UserCreate":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class UserLogin(BaseModel):
    username_or_email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class UserPublic(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class BookBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1, max_length=160)
    genre: str = Field(min_length=1, max_length=80)
    description: str = Field(default="", max_length=10000)
    cover_url: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def cover_url_must_be_http(self) -> "BookBase":
        if self.cover_url and not self.cover_url.strip().lower().startswith(("https://", "http://")):
            raise ValueError("Cover image URL must begin with http:// or https://.")
        return self


class BookCreate(BookBase):
    pass


class BookRead(BookBase):
    id: int
    created_at: datetime
    average_rating: float = 0
    review_count: int = 0


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    review_text: str = Field(min_length=1, max_length=2000)


class ReviewUpdate(ReviewCreate):
    pass


class ReviewRead(BaseModel):
    id: int
    book_id: int
    user_id: int
    username: str
    rating: int
    review_text: str
    created_at: datetime
    updated_at: datetime


class MyReview(ReviewRead):
    book: BookRead


class WishlistBook(BookRead):
    added_at: datetime


class RecentReview(BaseModel):
    id: int
    rating: int
    review_text: str
    created_at: datetime
    book: BookRead


class DashboardRead(BaseModel):
    username: str
    total_books: int
    wishlist_count: int
    review_count: int
    average_rating_given: float
    recent_reviews: list[RecentReview]
