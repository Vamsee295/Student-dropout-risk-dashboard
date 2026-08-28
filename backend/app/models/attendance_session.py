"""
AttendanceSession model — represents a single class occurrence that faculty can mark attendance for.

A session links a Course + Section + SessionType + Date together.
Individual AttendanceRecord rows (per student) are created when POST ATTENDANCE is clicked.
"""
from sqlalchemy import Column, String, Integer, DateTime, Date, Time, ForeignKey, Enum as SQLEnum, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class AttendanceSession(Base):
    """One class occurrence: Course + Section + Session Type + Date."""
    __tablename__ = "attendance_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # What course / section this session belongs to
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=False)
    section = Column(String(50), nullable=False)               # e.g. "Section 1", "Section 2", "A", "B"

    # Who is teaching
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Session classification
    session_type = Column(String(50), nullable=False)          # "Lecture", "Practical", "Tutorial"
    session_label = Column(String(100), nullable=False)        # "Lecture 1", "Lecture 2", "Practical", etc.

    # When
    session_date = Column(Date, nullable=False)                # The actual class date
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)

    # Completion state: "PENDING" or "COMPLETED"
    status = Column(String(20), nullable=False, default="PENDING")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    course = relationship("Course", back_populates="attendance_sessions")
    faculty = relationship("User", foreign_keys=[faculty_id])
    attendance_records = relationship(
        "AttendanceRecord",
        back_populates="session",
        cascade="all, delete-orphan",
        primaryjoin="AttendanceSession.id == AttendanceRecord.session_id",
        foreign_keys="[AttendanceRecord.session_id]"
    )

    __table_args__ = (
        Index("idx_session_course_date", "course_id", "session_date"),
        Index("idx_session_section", "section"),
        # A session is unique per: course + section + type + label + date
        UniqueConstraint("course_id", "section", "session_type", "session_label", "session_date",
                         name="uq_course_section_session_date"),
    )

    def __repr__(self):
        return f"<AttendanceSession {self.course_id} | {self.section} | {self.session_label} | {self.session_date}>"
