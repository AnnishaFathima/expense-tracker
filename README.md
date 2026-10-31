# Expense Tracker

Full-stack expense tracker with JWT login.

## Tech Stack
- Backend: FastAPI, SQLAlchemy, SQLite
- Auth: JWT (python-jose, passlib)
- Frontend: React + Vite

## Features
- Sign up / log in
- Add and delete expenses
- Spending chart by category

## Run Locally
Backend:
    pip install fastapi uvicorn sqlalchemy python-multipart python-jose "passlib[bcrypt]" "bcrypt==4.0.1"
    python create_tables.py
    uvicorn main:app --reload

Frontend:
    cd frontend
    npm install
    npm run dev