"""
SQLAlchemy ORM models for Student Dropout Risk Analytics System.

Tables:
- students: Student demographic and enrollment data
- student_metrics: Engineered features for ML
- risk_scores: Current risk predictions
- risk_history: Historical risk scores for trend analysis
- interventions: Intervention tracking
- model_versions: ML model versioning and metadata
"""

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, 
    ForeignKey, Enum as SQLEnum, JSON, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


# Enums
class Department(str, enum.Enum):
    """Department enumeration matching frontend."""
    CSE = "Computer Science (CSE)"
    MECHANICAL = "Mechanical"
    AEROSPACE = "Aerospace"
    DATA_SCIENCE = "Data Science"
    AI_DS = "AI-DS"
    CIVIL = "Civil"
    ECE = "Electronics (ECE)"


class Section(str, enum.Enum):
    """Section enumeration."""
    A = "A"
    B = "B"
    C = "C"


class RiskLevel(str, enum.Enum):
    """Risk level categories."""
    HIGH = "High Risk"
    MODERATE = "Moderate Risk"
    STABLE = "Stable"
    SAFE = "Safe"


class RiskTrend(str, enum.Enum):
    """Risk trend direction."""
    UP = "up"
    DOWN = "down"
    STABLE = "stable"


class InterventionType(str, enum.Enum):
    """Intervention type categories."""
    COUNSELING = "counseling"
    TUTORING = "tutoring"
    MENTORING = "mentoring"
    FINANCIAL = "financial"
    ACADEMIC = "academic"


class InterventionStatus(str, enum.Enum):
    """Intervention status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Role(str, enum.Enum):
    """User roles."""
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    ADMIN = "ADMIN"



# Models
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
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    # Relationships
    metrics = relationship("StudentMetric", back_populates="student", uselist=False, cascade="all, delete-orphan")
    risk_score = relationship("RiskScore", back_populates="student", uselist=False, cascade="all, delete-orphan")
    risk_history = relationship("RiskHistory", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")
    coding_profile = relationship("StudentCodingProfile", back_populates="student", uselist=False, cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_student_department', 'department'),
        Index('idx_student_section', 'section'),
    )


class StudentCodingProfile(Base):
    """Student performance on coding platforms."""
    __tablename__ = "student_coding_profiles"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Platform Scores
    hackerrank_score = Column(Float, default=0.0)
    hackerrank_solved = Column(Integer, default=0)
    
    leetcode_rating = Column(Float, default=0.0)
    leetcode_solved = Column(Integer, default=0)
    
    codechef_rating = Column(Float, default=0.0)
    codeforces_rating = Column(Float, default=0.0)
    
    interviewbit_score = Column(Float, default=0.0)
    spoj_score = Column(Float, default=0.0)
    
    # Aggregated Score (for sorting/ranking)
    overall_score = Column(Float, default=0.0)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    student = relationship("Student", back_populates="coding_profile")


class StudentMetric(Base):
    """Engineered features for ML model."""
    __tablename__ = "student_metrics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Engineered features (MUST be dataset-derived)
    attendance_rate = Column(Float, nullable=False)  # 0-100
    engagement_score = Column(Float, nullable=False)  # 0-100
    academic_performance_index = Column(Float, nullable=False)  # Weighted GPA
    login_gap_days = Column(Integer, nullable=False)  # Days since last login
    failure_ratio = Column(Float, nullable=False)  # Failed/total courses
    financial_risk_flag = Column(Boolean, nullable=False, default=False)
    commute_risk_score = Column(Integer, nullable=False)  # 1-4 scale
    semester_performance_trend = Column(Float, nullable=False)  # Trend %
    
    # Last interaction timestamp
    last_interaction = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Update timestamp
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship
    student = relationship("Student", back_populates="metrics")
    
    # Index
    __table_args__ = (
        Index('idx_student_metrics_student_id', 'student_id'),
    )


class RiskScore(Base):
    """Current risk prediction for each student."""
    __tablename__ = "risk_scores"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Risk prediction
    risk_score = Column(Float, nullable=False)  # 0-100 calibrated score
    risk_level = Column(SQLEnum(RiskLevel), nullable=False)
    risk_trend = Column(SQLEnum(RiskTrend), nullable=False)
    risk_value = Column(String(50), nullable=False)  # Display string (e.g., "+12% Risk")
    
    # Model tracking
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False)
    
    # SHAP explanation (top factors)
    shap_explanation = Column(JSON, nullable=True)  # Store top factors as JSON
    
    # Timestamps
    predicted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    student = relationship("Student", back_populates="risk_score")
    model_version = relationship("ModelVersion")
    
    # Indexes
    __table_args__ = (
        Index('idx_risk_scores_student_id', 'student_id'),
        Index('idx_risk_scores_risk_level', 'risk_level'),
    )


class RiskHistory(Base):
    """Historical risk scores for trend analysis."""
    __tablename__ = "risk_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    
    risk_score = Column(Float, nullable=False)
    risk_level = Column(SQLEnum(RiskLevel), nullable=False)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False)
    
    # Timestamp
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    student = relationship("Student", back_populates="risk_history")
    model_version = relationship("ModelVersion")
    
    # Indexes
    __table_args__ = (
        Index('idx_risk_history_student_id', 'student_id'),
        Index('idx_risk_history_recorded_at', 'recorded_at'),
    )


class Intervention(Base):
    """Intervention tracking for students."""
    __tablename__ = "interventions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    
    intervention_type = Column(SQLEnum(InterventionType), nullable=False)
    status = Column(SQLEnum(InterventionStatus), nullable=False, default=InterventionStatus.PENDING)
    assigned_to = Column(String(200), nullable=True)  # Faculty/mentor name
    notes = Column(Text, nullable=True)
    
    # Outcome tracking for feedback loop
    outcome_label = Column(Integer, nullable=True)  # 0=improved, 1=no change, for retraining
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationship
    student = relationship("Student", back_populates="interventions")
    
    # Indexes
    __table_args__ = (
        Index('idx_interventions_student_id', 'student_id'),
        Index('idx_interventions_status', 'status'),
    )


class ModelVersion(Base):
    """ML model versioning and metadata."""
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    version = Column(String(50), unique=True, nullable=False)  # Timestamp-based version
    model_path = Column(String(500), nullable=False)  # Path to .pkl file
    
    # Performance metrics
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    
    # Training metadata
    training_samples = Column(Integer, nullable=False)
    feature_importance = Column(JSON, nullable=False)  # Feature names and importance scores
    
    # Feature drift tracking
    feature_means = Column(JSON, nullable=True)  # Mean values for drift detection
    
    # Active model flag
    is_active = Column(Boolean, nullable=False, default=False)
    
    # Timestamp
    trained_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Index
    __table_args__ = (
        Index('idx_model_versions_is_active', 'is_active'),
    )


class AssessmentType(str, enum.Enum):
    """Type of assessment."""
    INTERNAL = "Internal"
    EXTERNAL = "External"
    ASSIGNMENT = "Assignment"
    PROJECT = "Project"


class AttendanceStatus(str, enum.Enum):
    """Attendance status."""
    PRESENT = "Present"
    ABSENT = "Absent"
    LATE = "Late"
    EXCUSED = "Excused"


class SubmissionStatus(str, enum.Enum):
    """Assignment submission status."""
    SUBMITTED = "Submitted"
    PENDING = "Pending"
    OVERDUE = "Overdue"
    GRADED = "Graded"


class User(Base):
    """User account for authentication."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(200), nullable=False)
    role = Column(SQLEnum(Role), nullable=False, default=Role.STUDENT)
    is_active = Column(Boolean, default=True)
    
    # Optional link to student profile if role is STUDENT
    student_id = Column(String(50), ForeignKey("students.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    student = relationship("Student", backref="user_account")


class Course(Base):
    """Course information."""
    __tablename__ = "courses"

    id = Column(String(50), primary_key=True)  # Course Code e.g. CS101
    name = Column(String(200), nullable=False)
    department = Column(SQLEnum(Department), nullable=False)
    credits = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="course")
    assessments = relationship("Assessment", back_populates="course")


class Enrollment(Base):
    """Student enrollment in a course."""
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    
    # Timestamps
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("Student", backref="enrollments")
    course = relationship("Course", back_populates="enrollments")

    __table_args__ = (
        UniqueConstraint('student_id', 'course_id', name='idx_unique_enrollment'),
    )


class AttendanceRecord(Base):
    """Daily attendance record for a student in a course."""
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    status = Column(SQLEnum(AttendanceStatus), nullable=False)

    # Relationships
    student = relationship("Student", backref="attendance_records")
    course = relationship("Course", backref="attendance_records")

    __table_args__ = (
        Index('idx_attendance_student_course', 'student_id', 'course_id'),
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

    # Relationships
    course = relationship("Course", back_populates="assessments")
    student_assessments = relationship("StudentAssessment", back_populates="assessment")


class StudentAssessment(Base):
    """Student score for an assessment."""
    __tablename__ = "student_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    
    obtained_marks = Column(Float, nullable=True)
    status = Column(SQLEnum(SubmissionStatus), nullable=False, default=SubmissionStatus.PENDING)
    submission_date = Column(DateTime, nullable=True)

    # Relationships
    student = relationship("Student", backref="student_assessments")
    assessment = relationship("Assessment", back_populates="student_assessments")

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
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    student = relationship("Student", backref="raw_attendance")

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
    exam_type = Column(String(100), nullable=False, default="Internal")  # Internal / External / Mid
    marks_obtained = Column(Float, nullable=False)
    max_marks = Column(Float, nullable=False, default=100.0)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    student = relationship("Student", backref="raw_marks")

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
    score = Column(Float, nullable=True)  # None = not graded / not submitted
    max_score = Column(Float, nullable=False, default=10.0)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    student = relationship("Student", backref="raw_assignments")

    __table_args__ = (
        Index('idx_raw_assignments_student', 'student_id'),
    )
