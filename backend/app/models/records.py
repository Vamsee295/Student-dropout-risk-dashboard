from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Index, UniqueConstraint, func
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base
from app.models.enums import AttendanceStatus, SubmissionStatus

class AttendanceRecord(Base):
    """Daily attendance record for a student in a course."""
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    status = Column(SQLEnum(AttendanceStatus), nullable=False)
    marked_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # faculty user id
    session_id = Column(Integer, ForeignKey("attendance_sessions.id", ondelete="SET NULL"), nullable=True)  # linked session
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    student = relationship("Student", back_populates="attendance_records")
    course = relationship("Course", back_populates="attendance_records")
    marked_by_user = relationship("User", foreign_keys=[marked_by])
    session = relationship("AttendanceSession", back_populates="attendance_records", foreign_keys=[session_id])

    __table_args__ = (
        Index('idx_attendance_student_course', 'student_id', 'course_id'),
        Index('idx_attendance_date', 'date'),
        UniqueConstraint('student_id', 'course_id', 'date', name='uq_student_course_date'),
    )


class StudentAssessment(Base):
    """Student score for an assessment."""
    __tablename__ = "student_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    
    obtained_marks = Column(Float, nullable=True)
    writing_marks = Column(Float, nullable=True)
    understanding_marks = Column(Float, nullable=True)
    learning_marks = Column(Float, nullable=True)
    application_marks = Column(Float, nullable=True)
    knowledge_marks = Column(Float, nullable=True)
    graded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    graded_at = Column(DateTime, nullable=True)
    status = Column(SQLEnum(SubmissionStatus), nullable=False, default=SubmissionStatus.PENDING)
    submission_date = Column(DateTime, nullable=True)

    student = relationship("Student", back_populates="student_assessments")
    assessment = relationship("Assessment", back_populates="student_assessments")
    grader = relationship("User", foreign_keys=[graded_by])

    __table_args__ = (
        UniqueConstraint('student_id', 'assessment_id', name='idx_unique_student_assessment'),
    )


class StudentRawAttendance(Base):
    """Raw attendance rows ingested from CSV upload."""
    __tablename__ = "student_raw_attendance"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, nullable=False)
    subject = Column(String(200), nullable=False, default="General")
    status = Column(String(20), nullable=False)  # Present / Absent / Late
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    student = relationship("Student", back_populates="raw_attendance")

    __table_args__ = (
        Index('idx_raw_attendance_student', 'student_id'),
        Index('idx_raw_attendance_date', 'date'),
    )


class StudentRawMarks(Base):
    """Raw marks rows ingested from CSV upload."""
    __tablename__ = "student_raw_marks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(200), nullable=False, default="General")
    exam_type = Column(String(100), nullable=False, default="Internal")
    marks_obtained = Column(Float, nullable=False)
    max_marks = Column(Float, nullable=False, default=100.0)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    student = relationship("Student", back_populates="raw_marks")

    __table_args__ = (
        Index('idx_raw_marks_student', 'student_id'),
    )


class StudentRawAssignments(Base):
    """Raw assignment submission rows ingested from CSV upload."""
    __tablename__ = "student_raw_assignments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(200), nullable=False, default="General")
    assignment_name = Column(String(300), nullable=False, default="Assignment")
    submitted = Column(Boolean, nullable=False, default=False)
    score = Column(Float, nullable=True)
    max_score = Column(Float, nullable=False, default=10.0)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    student = relationship("Student", back_populates="raw_assignments")

    __table_args__ = (
        Index('idx_raw_assignments_student', 'student_id'),
    )
