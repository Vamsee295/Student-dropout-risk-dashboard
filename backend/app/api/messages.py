"""
Messaging API Router — /api/v1/messages/...

All endpoints require JWT authentication.
Authorization is fully enforced by message_service (users can only
access conversations they are a participant of).
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.auth.security import get_current_user
from app.models.user import User
from app.schemas.conversation_schema import (
    MessageCreate, MessageResponse, ConversationListItem,
    ConversationDetail, CreateConversationRequest
)
from app.services.message_service import message_service
from app.websocket.manager import manager

router = APIRouter(prefix="/messages", tags=["Messaging"])


# ── Faculty Directory ──────────────────────────────────────────────────────────

@router.get("/faculty-list")
def list_faculty(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return all faculty members (for students to choose recipients)."""
    return message_service.get_faculty_list(db)


# ── Conversations ──────────────────────────────────────────────────────────────

@router.get("/conversations", response_model=List[ConversationListItem])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return all conversations for the authenticated user."""
    return message_service.get_user_conversations(db, current_user)


@router.post("/conversations", response_model=ConversationListItem)
def create_or_get_conversation(
    body: CreateConversationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get or create a conversation.
    - Student: supply { faculty_id }
    - Faculty: supply { student_id }
    """
    return message_service.get_or_create_conversation(
        db, current_user,
        faculty_id=body.faculty_id,
        student_id=body.student_id,
    )


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch full conversation history. Enforces strict participant authorization."""
    return message_service.get_conversation_detail(db, conversation_id, current_user)


# ── Messages ──────────────────────────────────────────────────────────────────

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: int,
    body: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message in a conversation.
    Sender identity is determined exclusively from the JWT — the client
    cannot supply or override sender_id / sender_role.
    """
    from fastapi.encoders import jsonable_encoder
    msg = message_service.send_message(db, conversation_id, current_user, body)

    # Broadcast to all WebSocket connections in this conversation's channel
    event = {
        "type": "new_message",
        "data": jsonable_encoder(msg)
    }
    await manager.broadcast(f"conversation_{conversation_id}", event)
    return msg


@router.patch("/conversations/{conversation_id}/read")
def mark_conversation_read(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all unread incoming messages in this conversation as read."""
    return message_service.mark_as_read(db, conversation_id, current_user)
