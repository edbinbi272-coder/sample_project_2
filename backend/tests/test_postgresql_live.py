"""Opt-in integration smoke test against the PostgreSQL database in backend/.env."""

import os
import uuid

import pytest
from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models import User


pytestmark = pytest.mark.skipif(
    os.getenv("READERS_PARADISE_LIVE_TESTS") != "1",
    reason="Set READERS_PARADISE_LIVE_TESTS=1 to exercise the configured PostgreSQL database.",
)


def test_postgres_backed_account_library_and_review_flow() -> None:
    """Exercise actual PostgreSQL writes and reads, then remove the temporary accounts."""
    marker = uuid.uuid4().hex[:10]
    accounts = [
        (f"reader_{marker}", f"reader_{marker}@example.com"),
        (f"other_{marker}", f"other_{marker}@example.com"),
    ]
    try:
        with TestClient(app) as client:
            headers = []
            for username, email in accounts:
                registered = client.post(
                    "/api/auth/register",
                    json={"username": username, "email": email, "password": "Reading123", "confirm_password": "Reading123"},
                )
                assert registered.status_code == 201, registered.text
                login = client.post("/api/auth/login", json={"username_or_email": email, "password": "Reading123"})
                assert login.status_code == 200, login.text
                headers.append({"Authorization": f"Bearer {login.json()['access_token']}"})

            reader, other_reader = headers
            book = client.post(
                "/api/books",
                headers=reader,
                json={"title": f"Postgres Smoke {marker}", "author": "Test Reader", "genre": "Testing", "description": "Database integration check", "cover_url": None},
            )
            assert book.status_code == 201, book.text
            book_id = book.json()["id"]
            assert client.get("/api/books", params={"q": f"Postgres Smoke {marker}"}).status_code == 200
            assert client.post(f"/api/wishlist/{book_id}", headers=reader).status_code == 201
            assert client.get("/api/wishlist", headers=other_reader).json() == []

            review = client.post(
                f"/api/reviews/{book_id}",
                headers=reader,
                json={"rating": 5, "review_text": "The PostgreSQL review check."},
            )
            assert review.status_code == 201, review.text
            assert client.post(
                f"/api/reviews/{book_id}",
                headers=reader,
                json={"rating": 4, "review_text": "Updated PostgreSQL review."},
            ).status_code == 200
            assert client.get(f"/api/books/{book_id}").json()["average_rating"] == 4.0
            assert client.get("/api/dashboard", headers=reader).status_code == 200
            assert client.get("/api/reviews/mine", headers=reader).json()[0]["book"]["id"] == book_id

            updated_book = client.put(
                f"/api/books/{book_id}",
                headers=reader,
                json={"title": f"Changed {marker}", "author": "Test Reader", "genre": "Testing", "description": "Updated", "cover_url": None},
            )
            assert updated_book.status_code == 200, updated_book.text
            assert client.delete(f"/api/books/{book_id}", headers=reader).status_code == 204
            assert client.get(f"/api/books/{book_id}").status_code == 404
    finally:
        session = SessionLocal()
        try:
            session.query(User).filter(User.username.in_([username for username, _ in accounts])).delete(synchronize_session=False)
            session.commit()
        finally:
            session.close()
