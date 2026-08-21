"""
Conversation and Message models for Student ↔ Faculty messaging system.
"""
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime,
    ForeignKey, Enum as SQLEnum, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base
from app.models.enums import Role


class Conversation(Base):
    """A messaging thread between exactly one student and one faculty member."""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(
        String(50),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    faculty_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    student = relationship("Student", foreign_keys=[student_id])
    faculty = relationship("User", foreign_keys=[faculty_id])
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at"
    )

    __table_args__ = (
        UniqueConstraint("student_id", "faculty_id", name="uq_student_faculty_conversation"),
    )


class Message(Base):
    """A single message within a conversation."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False
    )
    sender_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    sender_role = Column(SQLEnum(Role), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])

    __table_args__ = (
        Index("idx_message_conversation_id", "conversation_id"),
        Index("idx_message_sender_id", "sender_id"),
        Index("idx_message_created_at", "created_at"),
        Index("idx_message_is_read", "is_read"),
    )
