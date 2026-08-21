from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.websocket.manager import manager
from app.auth.security import get_current_user
from typing import Optional

router = APIRouter(prefix="/ws", tags=["WebSockets"])

# In a real production system, WebSockets would also require authentication.
# For simplicity, we assume the frontend connects with the correct channel paths.
# e.g., ws://localhost:8000/api/v1/ws/student/123

@router.websocket("/student/{student_id}")
async def websocket_student(websocket: WebSocket, student_id: str):
    channel = f"student_{student_id}"
    await manager.connect(websocket, channel)
    try:
        while True:
            # We don't expect the client to send much, but we need to keep the connection open
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)

@router.websocket("/faculty/{faculty_id}")
async def websocket_faculty(websocket: WebSocket, faculty_id: str):
    channel = f"faculty_{faculty_id}"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)

@router.websocket("/dean")
async def websocket_dean(websocket: WebSocket):
    channel = "dean"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)

@router.websocket("/notifications")
async def websocket_notifications(websocket: WebSocket):
    channel = "notifications"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
        
@router.websocket("/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    channel = "dashboard"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)

@router.websocket("/calendar")
async def websocket_calendar(websocket: WebSocket):
    channel = "calendar"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)



@router.websocket("/messages/{conversation_id}")
async def websocket_messages(websocket: WebSocket, conversation_id: int):
    """
    Real-time channel for a specific conversation.
    Both Student and Faculty connect here after opening a conversation.
    The backend broadcasts new messages to this channel when POST /messages/conversations/{id}/messages is called.

    Auth: pass ?token=<jwt> as a query param since browser WebSocket API
    does not support Authorization headers.
    """
    from app.auth.security import get_current_user as _get_user
    from app.database.session import SessionLocal
    from app.models.conversation import Conversation
    from app.models.enums import Role

    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)
        return

    db = SessionLocal()
    try:
        from jose import jwt, JWTError
        from app.core.config import get_settings
        from app.repositories.user_repo import user_repo
        settings = get_settings()

        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email = payload.get("sub")
        if not email:
            await websocket.close(code=4001)
            return

        user = user_repo.get_by_email(db, email=email)
        if not user:
            await websocket.close(code=4001)
            return

        # Verify user is a participant of this conversation
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            await websocket.close(code=4004)
            return

        authorized = False
        if user.role == Role.STUDENT and user.student_id == conv.student_id:
            authorized = True
        elif user.role in (Role.FACULTY, Role.DEAN, Role.ADMIN) and user.id == conv.faculty_id:
            authorized = True

        if not authorized:
            await websocket.close(code=4003)
            return

    finally:
        db.close()

    channel = f"conversation_{conversation_id}"
    await manager.connect(websocket, channel)
    try:
        while True:
            # Keep alive — client can send pings, we ignore them
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)

