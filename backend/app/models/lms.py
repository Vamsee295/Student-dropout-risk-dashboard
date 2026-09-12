from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base

class CourseMaterial(Base):
    """Lecture notes, PDFs, and documents uploaded by faculty."""
    __tablename__ = "course_materials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(String(50), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=False)  # path/URL to the file
    material_type = Column(String(50), nullable=False, default="document")  # e.g., pdf, docx, pptx
    unit = Column(String(100), nullable=True)       # e.g., "Unit 1 - Introduction"
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    course = relationship("Course")
    uploader = relationship("User")


class RecordedClass(Base):
    """Video lectures recorded and added by faculty."""
    __tablename__ = "recorded_classes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(String(50), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=0)
    recording_date = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    course = relationship("Course")
    creator = relationship("User")
    progress = relationship("VideoProgress", back_populates="recording", cascade="all, delete-orphan")


class VideoProgress(Base):
    """Student watch progress for recorded classes."""
    __tablename__ = "video_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    recording_id = Column(Integer, ForeignKey("recorded_classes.id", ondelete="CASCADE"), nullable=False)
    progress_percent = Column(Float, nullable=False, default=0.0)
    completed = Column(Boolean, nullable=False, default=False)
    last_watched_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    student = relationship("Student")
    recording = relationship("RecordedClass", back_populates="progress")


class CourseDiscussion(Base):
    """Course-specific discussion threads."""
    __tablename__ = "course_discussions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(String(50), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)  # can be student or faculty
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, nullable=False, default=False)
    is_locked = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    course = relationship("Course")
    user = relationship("User")
    replies = relationship("CourseDiscussionReply", back_populates="discussion", cascade="all, delete-orphan")


class CourseDiscussionReply(Base):
    """Replies to course-specific discussion threads."""
    __tablename__ = "course_discussion_replies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    discussion_id = Column(Integer, ForeignKey("course_discussions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_faculty_answer = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    discussion = relationship("CourseDiscussion", back_populates="replies")
    user = relationship("User")
