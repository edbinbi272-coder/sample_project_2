"""API tests use an isolated SQLite database so they never touch a reader's data."""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.routers import auth, books, dashboard, reviews, wishlist


@pytest.fixture
def client():
    """Build a fresh API app and in-memory database for each test."""
    test_engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=test_engine)
    TestingSession = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)

    def override_get_db():
        with TestingSession() as session:
            yield session

    test_app = FastAPI()
    test_app.include_router(auth.router)
    test_app.include_router(books.router)
    test_app.include_router(wishlist.router)
    test_app.include_router(reviews.router)
    test_app.include_router(dashboard.router)
    test_app.dependency_overrides[get_db] = override_get_db

    with TestClient(test_app) as test_client:
        yield test_client

    test_app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


def create_account(client: TestClient, username: str, email: str) -> tuple[dict, dict]:
    """Register an account, sign in, and return its public data and auth header."""
    registration = client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": "Reading123", "confirm_password": "Reading123"},
    )
    assert registration.status_code == 201
    login = client.post("/api/auth/login", json={"username_or_email": email, "password": "Reading123"})
    assert login.status_code == 200
    return registration.json(), {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_registration_login_and_protected_endpoints(client: TestClient) -> None:
    reader, headers = create_account(client, "first_reader", "first@example.com")
    _, other_headers = create_account(client, "second_reader", "second@example.com")

    assert reader["username"] == "first_reader"
    assert client.get("/api/auth/me", headers=headers).json()["id"] == reader["id"]
    assert client.post("/api/auth/register", json={
        "username": "first_reader", "email": "duplicate@example.com", "password": "Reading123", "confirm_password": "Reading123",
    }).status_code == 409
    assert client.post("/api/auth/register", json={
        "username": "short", "email": "invalid@example.com", "password": "short", "confirm_password": "short",
    }).status_code == 422
    assert client.post("/api/auth/login", json={"username_or_email": "first_reader", "password": "wrong-password"}).status_code == 401
    assert client.get("/api/wishlist").status_code == 401
    assert client.post("/api/books", json={"title": "No token", "author": "Reader", "genre": "Fiction"}).status_code == 401
    assert other_headers["Authorization"] != headers["Authorization"]


def test_books_wishlist_reviews_and_dashboard(client: TestClient) -> None:
    reader, headers = create_account(client, "book_reader", "books@example.com")
    _, other_headers = create_account(client, "another_reader", "another@example.com")
    payload = {
        "title": "The Quiet Library",
        "author": "A. Reader",
        "genre": "Fiction",
        "description": "A story about the books that find us.",
        "cover_url": None,
    }

    created = client.post("/api/books", json=payload, headers=headers)
    assert created.status_code == 201
    book_id = created.json()["id"]
    assert client.get("/api/books", params={"q": "quiet", "author": "Reader", "genre": "Fiction"}).json()[0]["id"] == book_id
    assert "Fiction" in client.get("/api/books/genres").json()
    assert client.get(f"/api/books/{book_id}").json()["review_count"] == 0

    assert client.post(f"/api/wishlist/{book_id}", headers=headers).status_code == 201
    assert client.post(f"/api/wishlist/{book_id}", headers=headers).status_code == 409
    assert len(client.get("/api/wishlist", headers=headers).json()) == 1
    assert client.get("/api/wishlist", headers=other_headers).json() == []

    invalid_review = client.post(f"/api/reviews/{book_id}", json={"rating": 6, "review_text": "Too many stars"}, headers=headers)
    assert invalid_review.status_code == 422
    review = client.post(f"/api/reviews/{book_id}", json={"rating": 5, "review_text": "A warm and thoughtful story."}, headers=headers)
    assert review.status_code == 201
    review_id = review.json()["id"]
    updated = client.post(f"/api/reviews/{book_id}", json={"rating": 4, "review_text": "Still a lovely story."}, headers=headers)
    assert updated.status_code == 200
    assert updated.json()["id"] == review_id
    assert client.get(f"/api/books/{book_id}/reviews").json()[0]["rating"] == 4
    assert client.put(f"/api/reviews/{review_id}", json={"rating": 3, "review_text": "An edited thought."}, headers=other_headers).status_code == 404
    my_reviews = client.get("/api/reviews/mine", headers=headers)
    assert my_reviews.status_code == 200 and my_reviews.json()[0]["book"]["id"] == book_id

    direct_update = client.put(f"/api/reviews/{review_id}", json={"rating": 3, "review_text": "A second, edited thought."}, headers=headers)
    assert direct_update.status_code == 200 and direct_update.json()["rating"] == 3
    assert client.delete(f"/api/reviews/{review_id}", headers=headers).status_code == 204
    assert client.get("/api/reviews/mine", headers=headers).json() == []
    assert client.delete(f"/api/reviews/{review_id}", headers=other_headers).status_code == 404

    client.post(f"/api/reviews/{book_id}", json={"rating": 5, "review_text": "A final review for the dashboard."}, headers=headers)
    dashboard_data = client.get("/api/dashboard", headers=headers).json()
    assert dashboard_data["username"] == reader["username"]
    assert dashboard_data["total_books"] == 1
    assert dashboard_data["wishlist_count"] == 1
    assert dashboard_data["review_count"] == 1
    assert dashboard_data["recent_reviews"][0]["book"]["id"] == book_id

    changed_book = {**payload, "title": "The Quiet Reading Room"}
    assert client.put(f"/api/books/{book_id}", json=changed_book, headers=headers).json()["title"] == changed_book["title"]
    assert client.delete(f"/api/books/{book_id}", headers=headers).status_code == 204
    assert client.get(f"/api/books/{book_id}").status_code == 404
    assert client.get("/api/wishlist", headers=headers).json() == []
    assert client.get("/api/reviews/mine", headers=headers).json() == []
