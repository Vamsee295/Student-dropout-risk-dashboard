from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base
from app.models.enums import Department, Section

class Student(Base):
    """Student demographic and enrollment information."""
    __tablename__ = "students"
    
    id = Column(String(50), primary_key=True)  # Student ID
    name = Column(String(200), nullable=False)
    avatar = Column(String(10))  # Initials for UI
    course = Column(String(100), nullable=False)
    department = Column(SQLEnum(Department), nullable=False)
    section = Column(SQLEnum(Section), nullable=False)
    advisor_id = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user_account = relationship("User", back_populates="student", uselist=False)
    metrics = relationship("StudentMetric", back_populates="student", uselist=False, cascade="all, delete-orphan")
    risk_score = relationship("RiskScore", back_populates="student", uselist=False, cascade="all, delete-orphan")
    risk_history = relationship("RiskHistory", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")
    coding_profile = relationship("StudentCodingProfile", back_populates="student", uselist=False, cascade="all, delete-orphan")
    
    # Avoid circular import, these are defined in other files
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="student", cascade="all, delete-orphan")
    student_assessments = relationship("StudentAssessment", back_populates="student", cascade="all, delete-orphan")
    
    # Raw data tracking
    raw_attendance = relationship("StudentRawAttendance", back_populates="student", cascade="all, delete-orphan")
    raw_marks = relationship("StudentRawMarks", back_populates="student", cascade="all, delete-orphan")
    raw_assignments = relationship("StudentRawAssignments", back_populates="student", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_student_department', 'department'),
        Index('idx_student_section', 'section'),
    )


class StudentCodingProfile(Base):
    """Student performance on coding platforms."""
    __tablename__ = "student_coding_profiles"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    hackerrank_score = Column(Float, default=0.0)
    hackerrank_solved = Column(Integer, default=0)
    leetcode_rating = Column(Float, default=0.0)
    leetcode_solved = Column(Integer, default=0)
    codechef_rating = Column(Float, default=0.0)
    codeforces_rating = Column(Float, default=0.0)
    interviewbit_score = Column(Float, default=0.0)
    spoj_score = Column(Float, default=0.0)
    
    overall_score = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    student = relationship("Student", back_populates="coding_profile")


class StudentMetric(Base):
    """Engineered features for ML model."""
    __tablename__ = "student_metrics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    attendance_rate = Column(Float, nullable=False)  # 0-100
    engagement_score = Column(Float, nullable=False)  # 0-100
    academic_performance_index = Column(Float, nullable=False)  # Weighted GPA
    login_gap_days = Column(Integer, nullable=False)  # Days since last login
    failure_ratio = Column(Float, nullable=False)  # Failed/total courses
    financial_risk_flag = Column(Boolean, nullable=False, default=False)
    commute_risk_score = Column(Integer, nullable=False)  # 1-4 scale
    semester_performance_trend = Column(Float, nullable=False)  # Trend %
    
    last_interaction = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    student = relationship("Student", back_populates="metrics")
    
    __table_args__ = (
        Index('idx_student_metrics_student_id', 'student_id'),
    )
