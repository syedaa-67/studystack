from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables
from app.routers import study_groups, members, deadlines, auth

app = FastAPI(title="StudyStack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
