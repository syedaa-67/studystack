from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import create_db_and_tables
from app.routers import study_groups, members, deadlines, auth, analytics, resources, ai, notifications
from app.routers import ws
from app.services.reminders import check_deadlines

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    scheduler.add_job(check_deadlines, "interval", minutes=15, id="check_deadlines", next_run_time=None)
    scheduler.add_job(check_deadlines, id="check_deadlines_initial")
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="StudyStack API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(study_groups.router)
app.include_router(members.router)
app.include_router(deadlines.router)
app.include_router(analytics.router)
app.include_router(resources.router)
app.include_router(ai.router)
app.include_router(notifications.router)
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "Welcome to StudyStack API"}

app.include_router(ws.router)


