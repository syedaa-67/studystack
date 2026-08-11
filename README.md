# StudyStack

A collaborative study planner API built with FastAPI and SQLModel. Students can create study groups, add members, and track shared deadlines.

## Features

- Create and manage study groups by subject
- Add members to groups
- Track deadlines per group, with completion status
- Auto-generated interactive API docs (Swagger)

## Tech Stack

- FastAPI
- SQLModel (SQLAlchemy + Pydantic)
- SQLite (dev) — swappable for PostgreSQL
- Uvicorn

## Getting Started

1. Clone the repo
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn app.main:app --reload`
6. Visit `http://127.0.0.1:8000/docs`

## API Overview

- `POST /study-groups/` — create a study group
- `GET /study-groups/` — list all groups
- `POST /members/` — add a member to a group
- `POST /deadlines/` — add a deadline to a group
- `PATCH /deadlines/{id}/complete` — mark a deadline complete

## Roadmap

- Authentication
- React frontend
- Progress dashboard per subject
