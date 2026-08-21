"""
Pydantic schemas for the messaging system.
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)

    @field_validator("content")
    @classmethod
    def no_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Message content cannot be blank")
        return v.strip()


class ConversationParticipant(BaseModel):
    id: str                    # user_id as string for consistency in frontend
    name: str
    role: str
    avatar: str                # Initials
    email: str

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_role: str
    sender_name: str
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationListItem(BaseModel):
    id: int
    student: ConversationParticipant
    faculty: ConversationParticipant
    last_message: Optional[str]
    last_message_time: Optional[datetime]
    unread_count: int

    model_config = {"from_attributes": True}


class ConversationDetail(BaseModel):
    id: int
    student: ConversationParticipant
    faculty: ConversationParticipant
    messages: List[MessageResponse]

    model_config = {"from_attributes": True}


class CreateConversationRequest(BaseModel):
    """Student creates/gets a conversation with a faculty member."""
    faculty_id: Optional[int] = None   # Used by student

    """Faculty creates/gets a conversation with a student."""
    student_id: Optional[str] = None   # Used by faculty
