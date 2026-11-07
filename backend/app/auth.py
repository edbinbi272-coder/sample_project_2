"""Password hashing and signed JWT access-token helpers."""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from pwdlib import PasswordHash

from app.config import settings


ALGORITHM = "HS256"
password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a password so the original text is never stored in the database."""
    return password_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Check a submitted password against the stored password hash."""
    return password_hasher.verify(password, hashed_password)


def create_access_token(user_id: int) -> str:
    """Create a signed JWT containing a user's id and an expiration time."""
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": str(user_id), "exp": expires_at}, settings.secret_key, algorithm=ALGORITHM)


def read_access_token(token: str) -> int | None:
    """Return the user id in a valid token, or None for an invalid/expired token."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except (JWTError, KeyError, TypeError, ValueError):
        return None
