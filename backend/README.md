# SupportFlow Backend

This backend is the FastAPI-based API for SupportFlow. It exposes the `/api/v1` routes, handles CORS for the frontend, and creates database tables on startup.

## Requirements

- Python 3.10+
- `pip`
- Optional: a virtual environment

## Setup

1. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file at the project root with the required environment variables.

## Environment Variables

The backend reads settings from `.env` via `pydantic-settings`.
At minimum, set:

```bash
DATABASE_URL=sqlite:///./supportflow.db
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- `DATABASE_URL` is the SQLAlchemy database connection string.
- `FRONTEND_URL` is used by CORS middleware to allow requests from the frontend.
- `SUPABASE_*` values are available for any Supabase integration in the app.

## Running the API

Start the development server with Uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open:

- `http://localhost:8000/docs` for Swagger UI
- `http://localhost:8000/redoc` for Redoc

The app will also expose a health root endpoint at `http://localhost:8000/`.

## Database

The app auto-creates database tables on startup via SQLAlchemy models in `app.db`.

## Notes

- Use `DEBUG=False` in production.
- If you run the frontend locally, keep `FRONTEND_URL=http://localhost:3000`.
- API routes are mounted under `/api/v1`.

## Project Structure

- `app/main.py` — FastAPI application entrypoint.
- `app/core/config.py` — environment settings and defaults.
- `app/api/v1/` — API route modules.
- `app/db/` — database models and session management.
- `app/core/middleware.py` — request middleware.
