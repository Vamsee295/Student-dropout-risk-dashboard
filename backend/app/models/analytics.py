from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum, JSON, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base
from app.models.enums import RiskLevel, RiskTrend, InterventionType, InterventionStatus

class ModelVersion(Base):
    """ML model versioning and metadata."""
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    version = Column(String(50), unique=True, nullable=False)
    model_path = Column(String(500), nullable=False)
    
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    
    training_samples = Column(Integer, nullable=False)
    feature_importance = Column(JSON, nullable=False)
    feature_means = Column(JSON, nullable=True)
    
    is_active = Column(Boolean, nullable=False, default=False)
    trained_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    __table_args__ = (
        Index('idx_model_versions_is_active', 'is_active'),
    )


class RiskScore(Base):
    """Current risk prediction for each student."""
    __tablename__ = "risk_scores"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    risk_score = Column(Float, nullable=False)
    risk_level = Column(SQLEnum(RiskLevel), nullable=False)
    risk_trend = Column(SQLEnum(RiskTrend), nullable=False)
    risk_value = Column(String(50), nullable=False)
    
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False)
    shap_explanation = Column(JSON, nullable=True)
    
    predicted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    student = relationship("Student", back_populates="risk_score")
    model_version = relationship("ModelVersion")
    
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
    
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    student = relationship("Student", back_populates="risk_history")
    model_version = relationship("ModelVersion")
    
    __table_args__ = (
        Index('idx_risk_history_student_id', 'student_id'),
        Index('idx_risk_history_recorded_at', 'recorded_at'),
    )


