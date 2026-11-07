"""Registration, login, and current-user endpoints."""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, or_, select

from app.auth import create_access_token, hash_password, verify_password
from app.dependencies import CurrentUser, DatabaseSession
from app.models import User
from app.schemas import TokenResponse, UserCreate, UserLogin, UserPublic


router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: DatabaseSession) -> User:
    """Validate, normalize, and save a new account with a secure password hash."""
    username = payload.username.strip().lower()
    email = str(payload.email).strip().lower()
    existing_user = db.scalar(
        select(User).where(or_(func.lower(User.username) == username, func.lower(User.email) == email))
    )
    if existing_user:
        if existing_user.username.lower() == username:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That username is already in use.")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with that email already exists.")

    user = User(username=username, email=email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: DatabaseSession) -> TokenResponse:
    """Accept a username or email and return a signed access token."""
    identifier = payload.username_or_email.strip().lower()
    user = db.scalar(
        select(User).where(or_(func.lower(User.username) == identifier, func.lower(User.email) == identifier))
    )
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="The username/email or password is incorrect.")
    return TokenResponse(access_token=create_access_token(user.id), user=UserPublic.model_validate(user))


@router.get("/me", response_model=UserPublic)
def get_me(current_user: CurrentUser) -> User:
    """Return the account associated with the caller's access token."""
    return current_user
