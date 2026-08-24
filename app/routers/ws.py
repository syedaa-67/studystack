from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, List, Set, Optional
from datetime import datetime, timezone
from jose import jwt, JWTError
from sqlmodel import Session
from app.auth import SECRET_KEY, ALGORITHM
from app.database import engine
from app.models import PomodoroSession

router = APIRouter()

class PomodoroState:
    def __init__(self):
        self.running: bool = False
        self.duration: int = 25 * 60
        self.start_time: Optional[str] = None
        self.current_session_id: Optional[int] = None

    def to_dict(self):
        return {
            "running": self.running,
            "duration": self.duration,
            "start_time": self.start_time,
        }

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[tuple]] = {}
        self.pomodoro_state: Dict[int, PomodoroState] = {}

    def get_pomodoro(self, group_id: int) -> PomodoroState:
        return self.pomodoro_state.setdefault(group_id, PomodoroState())

    async def connect(self, group_id: int, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections.setdefault(group_id, []).append((websocket, user_id))
        await self.broadcast_presence(group_id)
        await websocket.send_json({"type": "pomodoro_state", **self.get_pomodoro(group_id).to_dict()})

    async def disconnect(self, group_id: int, websocket: WebSocket):
        if group_id in self.active_connections:
            self.active_connections[group_id] = [
                (ws, uid) for ws, uid in self.active_connections[group_id] if ws != websocket
            ]
            if not self.active_connections[group_id]:
                del self.active_connections[group_id]
        await self.broadcast_presence(group_id)

    def online_users(self, group_id: int) -> Set[str]:
        return {uid for _, uid in self.active_connections.get(group_id, [])}

    async def broadcast(self, group_id: int, message: dict):
        for connection, _ in self.active_connections.get(group_id, []):
            await connection.send_json(message)

    async def send_to_user(self, group_id: int, user_id: str, message: dict):
        for connection, uid in self.active_connections.get(group_id, []):
            if uid == user_id:
                await connection.send_json(message)

    async def broadcast_presence(self, group_id: int):
        await self.broadcast(group_id, {
            "type": "presence",
            "online_users": list(self.online_users(group_id))
        })

    async def handle_pomodoro_action(self, group_id: int, action: str, duration: Optional[int] = None):
        state = self.get_pomodoro(group_id)

        if action == "start":
            state.running = True
            state.start_time = datetime.now(timezone.utc).isoformat()
            if duration:
                state.duration = duration
            with Session(engine) as session:
                db_session = PomodoroSession(
                    group_id=group_id,
                    started_at=datetime.now(timezone.utc),
                )
                session.add(db_session)
                session.commit()
                session.refresh(db_session)
                state.current_session_id = db_session.id

        elif action in ("pause", "reset"):
            if state.current_session_id is not None:
                with Session(engine) as session:
                    db_session = session.get(PomodoroSession, state.current_session_id)
                    if db_session and db_session.ended_at is None:
                        db_session.ended_at = datetime.now(timezone.utc)
                        started = db_session.started_at
                        if started.tzinfo is None:
                            started = started.replace(tzinfo=timezone.utc)
                        db_session.duration_seconds = int(
                            (db_session.ended_at - started).total_seconds()
                        )
                        session.add(db_session)
                        session.commit()
                state.current_session_id = None

            state.running = False
            if action == "reset":
                state.start_time = None
                if duration:
                    state.duration = duration

        await self.broadcast(group_id, {"type": "pomodoro_state", **state.to_dict()})

manager = ConnectionManager()

def get_user_from_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

@router.websocket("/ws/groups/{group_id}")
async def group_websocket(websocket: WebSocket, group_id: int, token: str = Query(...)):
    user = get_user_from_token(token)
    if user is None:
        await websocket.close(code=1008)
        return

    await manager.connect(group_id, websocket, user)
    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "pomodoro_action":
                await manager.handle_pomodoro_action(
                    group_id,
                    data.get("action"),
                    data.get("duration")
                )
            else:
                data["user"] = user
                await manager.broadcast(group_id, data)
    except WebSocketDisconnect:
        await manager.disconnect(group_id, websocket)
