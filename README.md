# Readers Paradise

Readers Paradise is a local book discovery and review application. The frontend and backend are separate projects in this folder: React with Vite lives in `frontend/`, and FastAPI with SQLAlchemy lives in `backend/`.

## What you need

- VS Code
- Python 3.11 or newer
- Node.js 20 or newer (npm is included with Node.js)

The backend uses a local SQLite database by default, so you can run the app without installing a database server. Keep the backend `.env` file private; it is ignored by Git.

## 1. Prepare the local database

The local connection settings are in `backend/.env`. The default `sqlite:///./readers_paradise.db` stores data in `backend/readers_paradise.db`; the API creates its tables on first start. You can use PostgreSQL instead by setting `DATABASE_URL` to your local PostgreSQL connection string. Do not put database credentials in frontend files.

For a fresh checkout where `backend/.env` is missing, copy `backend/.env.example` to `backend/.env`, then set a private random `SECRET_KEY` before starting the API.

## 2. Start the FastAPI backend

Open a VS Code terminal in this project folder and run these PowerShell commands:

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal, then activate the environment again. The API runs at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the interactive API reference and `http://localhost:8000/api/health` for a quick health check.

## 3. Start the React frontend

Open a second terminal in the project folder:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the local address printed by Vite (usually `http://localhost:5173`). The frontend sends requests to `http://localhost:8000/api`; you can override this with `frontend/.env` using the name in `frontend/.env.example`.

## 4. Try the main features

1. Register with a username, email address, and password of at least eight characters.
2. Sign in, then add a book from **Add a book** or from the API reference.
3. Open a book to save it to your wishlist and post a one-to-five-star review.
4. Visit **My reviews** to edit or remove your review, and **My dashboard** to see your activity.
5. Register a second account to confirm that wishlists and review editing stay tied to each account.

To run the backend API checks from the backend folder, use `python -m pytest`. They create a temporary in-memory test database and do not modify the PostgreSQL library.

To include the PostgreSQL integration check (which creates and removes uniquely named test accounts and a test book), set the opt-in flag first:

```powershell
$env:READERS_PARADISE_LIVE_TESTS = "1"
python -m pytest -q
Remove-Item Env:READERS_PARADISE_LIVE_TESTS
```

## How the folders fit together

- `backend/app/models.py` defines the PostgreSQL tables and their relationships.
- `backend/app/schemas.py` validates API input and shapes API responses.
- `backend/app/routers/` contains authentication, book, review, wishlist, and dashboard endpoints.
- `backend/app/dependencies.py` provides a database session and verifies signed-in users for protected endpoints.
- `frontend/src/services/api.js` configures Axios and attaches the JWT access token.
- `frontend/src/context/AuthContext.jsx` shares sign-in state and logout across the React pages.
- `frontend/src/pages/` contains the screens; `frontend/src/components/` contains reusable interface pieces.

## Security and database notes

Passwords are hashed with Argon2 before storage. API access tokens are signed JWTs. The API validates ownership before editing or removing a review, and database unique constraints prevent duplicate wishlist entries and duplicate reviews by the same user for a book. The development server creates missing tables with SQLAlchemy; use Alembic migrations before making schema changes in a deployed application.
"# DEMO" 
"# sample_project_2" 
