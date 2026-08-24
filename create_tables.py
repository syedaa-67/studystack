import sys
sys.path.insert(0, '.')
from app.database import engine
from app.models import StudyGroup, Member, Deadline, Resource, Badge, PomodoroSession
from sqlmodel import SQLModel

print('Creating tables...')
SQLModel.metadata.create_all(engine)
print('✅ Tables created successfully!')
