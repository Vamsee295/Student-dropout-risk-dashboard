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
