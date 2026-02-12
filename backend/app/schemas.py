"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models import Department, Section, RiskLevel, RiskTrend, InterventionType, InterventionStatus


# Base Schemas
class StudentBase(BaseModel):
    """Base student schema."""
    name: str = Field(..., min_length=1, max_length=200)
    course: str = Field(..., min_length=1, max_length=100)
    department: Department
    section: Section
    advisor_id: Optional[str] = None


class StudentMetricBase(BaseModel):
    """Base student metric schema."""
    attendance_rate: float = Field(..., ge=0, le=100)
    engagement_score: float = Field(..., ge=0, le=100)
    academic_performance_index: float
    login_gap_days: int = Field(..., ge=0)
    failure_ratio: float = Field(..., ge=0, le=1)
    financial_risk_flag: bool
    commute_risk_score: int = Field(..., ge=1, le=4)
    semester_performance_trend: float
    last_interaction: datetime


class RiskScoreBase(BaseModel):
    """Base risk score schema."""
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    risk_trend: RiskTrend
    risk_value: str


class InterventionBase(BaseModel):
    """Base intervention schema."""
    student_id: str
    intervention_type: InterventionType
    status: InterventionStatus
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


# Request Schemas
class StudentCreate(StudentBase):
    """Schema for creating a new student."""
    id: str = Field(..., min_length=1, max_length=50)
    avatar: str = Field(..., max_length=10)


class StudentUpdate(BaseModel):
    """Schema for updating student information."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    course: Optional[str] = Field(None, min_length=1, max_length=100)
    department: Optional[Department] = None
    section: Optional[Section] = None
    advisor_id: Optional[str] = None


class StudentMetricUpdate(StudentMetricBase):
    """Schema for updating student metrics (triggers real-time loop)."""
    pass


class InterventionCreate(InterventionBase):
    """Schema for creating a new intervention."""
    pass


class InterventionUpdate(BaseModel):
    """Schema for updating intervention status."""
    status: Optional[InterventionStatus] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    outcome_label: Optional[int] = Field(None, ge=0, le=1)  # 0=improved, 1=no change


class PredictionRequest(BaseModel):
    """Schema for real-time prediction request."""
    student_id: str
    metrics: StudentMetricBase


# Response Schemas
class SHAPFactor(BaseModel):
    """SHAP feature importance factor."""
    feature: str
    impact: float
    direction: str  # "positive" or "negative"


class RiskExplanation(BaseModel):
    """Risk prediction with SHAP explanation."""
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    top_factors: List[SHAPFactor]
    
    model_config = ConfigDict(from_attributes=True)


class StudentMetricResponse(StudentMetricBase):
    """Response schema for student metrics."""
    id: int
    student_id: str
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class RiskScoreResponse(RiskScoreBase):
    """Response schema for risk score."""
    id: int
    student_id: str
    model_version_id: int
    shap_explanation: Optional[dict] = None
    predicted_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class RiskScoreWithExplanation(RiskScoreResponse):
    """Risk score with parsed SHAP explanation."""
    explanation: Optional[RiskExplanation] = None


class StudentResponse(StudentBase):
    """Response schema for student."""
    id: str
    avatar: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class StudentDetailResponse(StudentResponse):
    """Detailed student response with metrics and risk."""
    metrics: Optional[StudentMetricResponse] = None
    risk_score: Optional[RiskScoreResponse] = None
    
    model_config = ConfigDict(from_attributes=True)


class StudentWithRisk(BaseModel):
    """Student with risk information for directory listing."""
    id: str
    name: str
    avatar: str
    course: str
    department: Department
    section: Section
    riskStatus: RiskLevel
    riskTrend: RiskTrend
    riskValue: str
    attendance: float
    engagementScore: float
    lastInteraction: str
    advisor: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class RiskHistoryResponse(BaseModel):
    """Response schema for risk history."""
    id: int
    student_id: str
    risk_score: float
    risk_level: RiskLevel
    recorded_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class InterventionResponse(InterventionBase):
    """Response schema for intervention."""
    id: int
    outcome_label: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class ModelVersionResponse(BaseModel):
    """Response schema for model version."""
    id: int
    version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    training_samples: int
    feature_importance: dict
    is_active: bool
    trained_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Analytics Schemas
class AnalyticsOverview(BaseModel):
    """Dashboard overview metrics."""
    total_students: int
    high_risk_count: int
    high_risk_percentage: float
    average_risk_score: float
    risk_distribution: dict  # {level: count}


class DepartmentRiskBreakdown(BaseModel):
    """Risk breakdown by department."""
    department: Department
    total_students: int
    average_risk_score: float
    high_risk_count: int


class FeatureImportance(BaseModel):
    """Global feature importance."""
    feature: str
    importance: float


class RiskDistributionBucket(BaseModel):
    """Risk distribution histogram bucket."""
    bucket_start: float
    bucket_end: float
    count: int


# Health Check
class HealthCheck(BaseModel):
    """Health check response."""
    status: str
    database: str
    model_loaded: bool
    active_model_version: Optional[str] = None


# Frontend Integration
class StudentFrontendResponse(BaseModel):
    """Student response formatted for frontend dashboard."""
    id: str
    name: str
    avatar: str  
    course: str
    department: str
    section: str
    riskStatus: str
    riskTrend: str
    riskValue: str
    attendance: float
    engagementScore: float
    lastInteraction: str
    advisor: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
