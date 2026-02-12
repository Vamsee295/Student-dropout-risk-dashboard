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
    metrics = relationship("StudentMetric", back_populates="student", uselist=False, cascade="all, delete-orphan")
    risk_score = relationship("RiskScore", back_populates="student", uselist=False, cascade="all, delete-orphan")
    risk_history = relationship("RiskHistory", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_student_department', 'department'),
        Index('idx_student_section', 'section'),
    )


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
