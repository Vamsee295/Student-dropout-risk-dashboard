"""
Message Service — encapsulates all business logic for the messaging domain.
All authorization is performed here. No caller can bypass participant checks.
"""
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.conversation import Conversation, Message
from app.models.user import User
from app.models.student import Student
from app.models.enums import Role
from app.schemas.conversation_schema import (
    MessageCreate, MessageResponse, ConversationListItem,
    ConversationDetail, ConversationParticipant
)


def _make_avatar(name: str) -> str:
    parts = name.split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return name[:2].upper()


def _participant_from_user(user: User) -> ConversationParticipant:
    return ConversationParticipant(
        id=str(user.id),
        name=user.name,
        role=user.role.value,
        avatar=_make_avatar(user.name),
        email=user.email,
    )


def _participant_from_student(student: Student, user: User) -> ConversationParticipant:
    return ConversationParticipant(
        id=str(user.id),
        name=student.name if student else user.name,
        role="STUDENT",
        avatar=_make_avatar(student.name if student else user.name),
        email=user.email,
    )


def _message_response(msg: Message) -> MessageResponse:
    return MessageResponse(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_id=msg.sender_id,
        sender_role=msg.sender_role.value,
        sender_name=msg.sender.name if msg.sender else "Unknown",
        content=msg.content,
        is_read=msg.is_read,
        created_at=msg.created_at,
    )


class MessageService:

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _get_conversation_or_403(
        self, db: Session, conversation_id: int, current_user: User
    ) -> Conversation:
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Authorization: student may only access their own conversation
        if current_user.role == Role.STUDENT:
            student_user = db.query(User).filter(
                User.id == current_user.id
            ).first()
            if not student_user or student_user.student_id != conv.student_id:
                raise HTTPException(status_code=403, detail="Access denied")

        # Authorization: faculty may only access conversations assigned to them
        elif current_user.role in (Role.FACULTY, Role.DEAN, Role.ADMIN):
            if conv.faculty_id != current_user.id:
                raise HTTPException(status_code=403, detail="Access denied")

        return conv

    def _build_list_item(
        self, db: Session, conv: Conversation, current_user: User
    ) -> ConversationListItem:
        # Last message
        last_msg = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .first()
        )

        # Unread count — messages received by current user that are not yet read
        if current_user.role == Role.STUDENT:
            unread_role = Role.FACULTY
        else:
            unread_role = Role.STUDENT

        unread_count = (
            db.query(Message)
            .filter(
                Message.conversation_id == conv.id,
                Message.sender_role == unread_role,
                Message.is_read == False,
            )
            .count()
        )

        # Participants
        student_user = db.query(User).filter(
            User.student_id == conv.student_id
        ).first()
        faculty_user = db.query(User).filter(User.id == conv.faculty_id).first()

        student_obj = db.query(Student).filter(Student.id == conv.student_id).first()

        student_part = _participant_from_student(student_obj, student_user) if student_user else ConversationParticipant(
            id=conv.student_id, name=conv.student_id, role="STUDENT", avatar="ST", email=""
        )
        faculty_part = _participant_from_user(faculty_user) if faculty_user else ConversationParticipant(
            id=str(conv.faculty_id), name="Faculty", role="FACULTY", avatar="FA", email=""
        )

        return ConversationListItem(
            id=conv.id,
            student=student_part,
            faculty=faculty_part,
            last_message=last_msg.content if last_msg else None,
            last_message_time=last_msg.created_at if last_msg else None,
            unread_count=unread_count,
        )

    # ── Public API ─────────────────────────────────────────────────────────────

    def get_faculty_list(self, db: Session) -> List[dict]:
        """Return all faculty users for students to initiate conversations."""
        faculty_users = db.query(User).filter(
            User.email == "faculty@gmail.com",
            User.role == Role.FACULTY,
            User.is_active == True,
        ).all()
        return [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role.value,
                "avatar": _make_avatar(u.name),
            }
            for u in faculty_users
        ]

    def get_user_conversations(
        self, db: Session, current_user: User
    ) -> List[ConversationListItem]:
        if current_user.role == Role.STUDENT:
            if not current_user.student_id:
                return []
            convs = db.query(Conversation).filter(
                Conversation.student_id == current_user.student_id
            ).order_by(Conversation.updated_at.desc()).all()
        else:
            convs = db.query(Conversation).filter(
                Conversation.faculty_id == current_user.id
            ).order_by(Conversation.updated_at.desc()).all()

        return [self._build_list_item(db, c, current_user) for c in convs]

    def get_or_create_conversation(
        self,
        db: Session,
        current_user: User,
        faculty_id: Optional[int] = None,
        student_id: Optional[str] = None,
    ) -> ConversationListItem:
        """Get or create a conversation. Student provides faculty_id; Faculty provides student_id."""
        if current_user.role == Role.STUDENT:
            s_id = current_user.student_id
            if not s_id:
                raise HTTPException(status_code=400, detail="No student profile linked to this account")
            if not faculty_id:
                raise HTTPException(status_code=400, detail="faculty_id is required")
            f_id = faculty_id
        else:
            if not student_id:
                raise HTTPException(status_code=400, detail="student_id is required")
            s_id = student_id
            f_id = current_user.id

        # Check faculty exists and has correct role
        faculty_user = db.query(User).filter(
            User.id == f_id,
            User.role.in_([Role.FACULTY, Role.DEAN, Role.ADMIN])
        ).first()
        if not faculty_user:
            raise HTTPException(status_code=404, detail="Faculty not found")

        # Upsert conversation
        conv = db.query(Conversation).filter(
            Conversation.student_id == s_id,
            Conversation.faculty_id == f_id,
        ).first()

        if not conv:
            conv = Conversation(student_id=s_id, faculty_id=f_id)
            db.add(conv)
            db.commit()
            db.refresh(conv)

        return self._build_list_item(db, conv, current_user)

    def get_conversation_detail(
        self, db: Session, conversation_id: int, current_user: User
    ) -> ConversationDetail:
        conv = self._get_conversation_or_403(db, conversation_id, current_user)

        student_user = db.query(User).filter(User.student_id == conv.student_id).first()
        faculty_user = db.query(User).filter(User.id == conv.faculty_id).first()
        student_obj = db.query(Student).filter(Student.id == conv.student_id).first()

        student_part = _participant_from_student(student_obj, student_user) if student_user else ConversationParticipant(
            id=conv.student_id, name=conv.student_id, role="STUDENT", avatar="ST", email=""
        )
        faculty_part = _participant_from_user(faculty_user) if faculty_user else ConversationParticipant(
            id=str(conv.faculty_id), name="Faculty", role="FACULTY", avatar="FA", email=""
        )

        messages = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.created_at.asc())
            .all()
        )

        return ConversationDetail(
            id=conv.id,
            student=student_part,
            faculty=faculty_part,
            messages=[_message_response(m) for m in messages],
        )

    def send_message(
        self,
        db: Session,
        conversation_id: int,
        current_user: User,
        payload: MessageCreate,
    ) -> MessageResponse:
        conv = self._get_conversation_or_403(db, conversation_id, current_user)

        msg = Message(
            conversation_id=conv.id,
            sender_id=current_user.id,
            sender_role=current_user.role,
            content=payload.content,
            is_read=False,
        )
        db.add(msg)

        # Update conversation timestamp
        conv.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(msg)
        db.refresh(msg.sender)  # load relationship

        return _message_response(msg)

    def mark_as_read(
        self, db: Session, conversation_id: int, current_user: User
    ) -> dict:
        conv = self._get_conversation_or_403(db, conversation_id, current_user)

        # Mark messages sent by the OTHER party as read
        opposite_role = Role.FACULTY if current_user.role == Role.STUDENT else Role.STUDENT

        updated = (
            db.query(Message)
            .filter(
                Message.conversation_id == conv.id,
                Message.sender_role == opposite_role,
                Message.is_read == False,
            )
            .all()
        )
        for m in updated:
            m.is_read = True

        db.commit()
        return {"marked_read": len(updated)}


message_service = MessageService()
