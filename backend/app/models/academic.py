from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base
from app.models.enums import Department, AssessmentType

class Course(Base):
    """Course information."""
    __tablename__ = "courses"

    id = Column(String(50), primary_key=True)  # Course Code e.g. CS101
    name = Column(String(200), nullable=False)
    department = Column(SQLEnum(Department), nullable=False)
    credits = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)

    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="course", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="course", cascade="all, delete-orphan")


class Enrollment(Base):
    """Student enrollment in a course."""
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    
    enrolled_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

    __table_args__ = (
        UniqueConstraint('student_id', 'course_id', name='idx_unique_enrollment'),
    )


class Assessment(Base):
    """Assessment definition for a course."""
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=False)
    title = Column(String(200), nullable=False)
    type = Column(SQLEnum(AssessmentType), nullable=False)
    total_marks = Column(Float, nullable=False)
    weightage = Column(Float, nullable=False)  # Percentage contribution to final grade
    due_date = Column(DateTime, nullable=True)

    course = relationship("Course", back_populates="assessments")
    student_assessments = relationship("StudentAssessment", back_populates="assessment", cascade="all, delete-orphan")
