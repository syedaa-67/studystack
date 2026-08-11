from fastapi import FastAPI
from app.database import create_db_and_tables
from app.routers import study_groups, members, deadlines, auth

app = FastAPI(title="StudyStack API")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(auth.router)
app.include_router(study_groups.router)
app.include_router(members.router)
app.include_router(deadlines.router)

@app.get("/")
def root():
    return {"message": "Welcome to StudyStack API"}
