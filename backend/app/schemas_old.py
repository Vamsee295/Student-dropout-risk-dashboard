"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models import Department, Section, RiskLevel, RiskTrend, InterventionType, InterventionStatus, Role


# Base Schemas
class UserBase(BaseModel):
    """Base user schema."""
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    name: str = Field(..., min_length=1, max_length=200)
    role: Role = Role.STUDENT
    student_id: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    """Response schema for user."""
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """JWT token schema."""
    access_token: str
    token_type: str
    role: str
    user_id: int
    student_id: Optional[str] = None
    name: Optional[str] = None


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


class CodingProfileResponse(BaseModel):
    """Response schema for student coding profile."""
    hackerrank_score: float
    hackerrank_solved: int
    leetcode_rating: float
    leetcode_solved: int
    codechef_rating: float
    codeforces_rating: float
    interviewbit_score: float
    spoj_score: float
    overall_score: float
    
    model_config = ConfigDict(from_attributes=True)


class StudentCodingStats(BaseModel):
    """Response schema for coding reports list view."""
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
    coding_profile: Optional[CodingProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)


class StudentDetailResponse(StudentResponse):
    """Detailed student response with metrics and risk."""
    metrics: Optional[StudentMetricResponse] = None
    risk_score: Optional[RiskScoreResponse] = None
    coding_profile: Optional[CodingProfileResponse] = None
    
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
    average_attendance: float
    high_risk_department: Optional[str] = None
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
    primaryRiskDriver: Optional[str] = "AI Prediction"
    
    model_config = ConfigDict(from_attributes=True)


# Course & Academic Schemas
class CourseBase(BaseModel):
    """Base course schema."""
    id: str
    name: str
    department: Department
    credits: int
    semester: int


class CourseResponse(CourseBase):
    """Response schema for course."""
    model_config = ConfigDict(from_attributes=True)


class AttendanceRecordResponse(BaseModel):
    """Response schema for attendance."""
    id: int
    course_id: str
    course_name: Optional[str] = None
    date: datetime
    status: str
    
    model_config = ConfigDict(from_attributes=True)


class AssessmentResponse(BaseModel):
    """Response schema for assessment."""
    id: int
    course_id: str
    course_name: Optional[str] = None
    title: str
    type: str
    total_marks: float
    weightage: float
    due_date: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class StudentAssessmentResponse(BaseModel):
    """Response schema for student assessment."""
    id: int
    assessment_id: int
    assessment: Optional[AssessmentResponse] = None
    obtained_marks: Optional[float] = None
    status: str
    submission_date: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class StudentDashboardOverview(BaseModel):
    """Overview data for student dashboard."""
    attendance_rate: float
    avg_marks: float
    engagement_score: float
    risk_level: RiskLevel
    risk_trend: RiskTrend
    risk_value: str
    dropout_probability: float
    upcoming_deadlines: List[AssessmentResponse]
    recent_attendance: List[AttendanceRecordResponse]


class SubjectPerformance(BaseModel):
    """Subject-wise performance metrics."""
    course_id: str
    course_name: str
    credits: int
    internal_marks: float
    external_marks: float
    total_marks: float
    grade: str
    attendance_percentage: float


class SemesterPerformance(BaseModel):
    """Semester-wise performance."""
    semester: int
    gpa: float
    subjects: List[SubjectPerformance]


class AssignmentProgress(BaseModel):
    """Assignment completion stats."""
    total: int
    completed: int
    pending: int
    completion_percentage: float
    overdue_count: int
    assignments: List[StudentAssessmentResponse]


class GradeForecast(BaseModel):
    """Grade forecast prediction."""
    student_id: str
    current_gpa: float
    projected_gpa: float
    confidence_interval: List[float]  # [min, max]
    prediction_factors: dict  # {"Attendance Impact": +0.2, "Missing Assignments": -0.5}
    trend: str  # "Improving", "Declining", "Stable"


# ─────────────────────────────────────────────────────────────────────────────
# Faculty Dashboard — New Schemas
# ─────────────────────────────────────────────────────────────────────────────

class FacultyStudentListItem(BaseModel):
    """Single row in the paginated faculty student directory."""
    id: str
    name: str
    avatar: str
    department: str
    course: str
    section: str
    risk_score: float
    risk_level: str
    risk_trend: str
    risk_value: str
    attendance_rate: float
    engagement_score: float
    academic_performance_index: float
    last_updated: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedStudentList(BaseModel):
    """Paginated faculty student directory response."""
    items: List[FacultyStudentListItem]
    total: int
    page: int
    page_size: int
    pages: int


class RiskHistoryItem(BaseModel):
    """Slim risk history entry for student profile."""
    risk_score: float
    risk_level: str
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterventionItem(BaseModel):
    """Intervention entry for student profile."""
    id: int
    intervention_type: str
    status: str
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SHAPFeatureItem(BaseModel):
    """Single SHAP feature contribution."""
    feature: str
    impact: float
    direction: str  # "positive" or "negative"


class FacultyStudentProfile(BaseModel):
    """Full student profile for faculty drill-down view."""
    # Base info
    id: str
    name: str
    avatar: str
    department: str
    course: str
    section: str
    advisor: Optional[str] = None
    created_at: Optional[datetime] = None

    # Engineered features
    attendance_rate: float
    engagement_score: float
    academic_performance_index: float
    failure_ratio: float
    semester_performance_trend: float
    login_gap_days: int
    financial_risk_flag: bool
    commute_risk_score: int

    # Current risk
    risk_score: float
    risk_level: str
    risk_trend: str
    risk_value: str

    # Risk history (last 30 entries)
    risk_history: List[RiskHistoryItem] = []

    # SHAP explanation
    shap_factors: List[SHAPFeatureItem] = []

    # Interventions
    interventions: List[InterventionItem] = []


class CreateStudentRequest(BaseModel):
    """Manual student creation payload."""
    id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=200)
    department: Department
    section: Section
    course: str = Field(..., min_length=1, max_length=100)
    advisor_id: Optional[str] = None
    # Optional initial metric overrides (if not provided, use safe defaults)
    attendance_rate: float = Field(default=75.0, ge=0, le=100)
    engagement_score: float = Field(default=70.0, ge=0, le=100)
    academic_performance_index: float = Field(default=65.0, ge=0)
    failure_ratio: float = Field(default=0.1, ge=0, le=1)
    financial_risk_flag: bool = False
    commute_risk_score: int = Field(default=1, ge=1, le=4)


class UploadSummary(BaseModel):
    """Response after CSV upload."""
    rows_processed: int
    students_affected: int
    recalculations_triggered: int
    errors: List[str] = []
    message: str


class RecalculateRequest(BaseModel):
    """Optional body for risk recalculation endpoint."""
    student_id: Optional[str] = None


class DepartmentTrendPoint(BaseModel):
    """Single date/avg-risk point for the 7-day trend."""
    date: str
    avg_risk: float


class DepartmentAnalytics(BaseModel):
    """Per-department analytics including 7-day risk trend."""
    department: str
    total_students: int
    avg_risk_score: float
    avg_attendance: float
    high_risk_count: int
    trend_7d: List[DepartmentTrendPoint] = []


class SHAPExplanationResponse(BaseModel):
    """SHAP explanation response for a single student."""
    student_id: str
    risk_score: float
    risk_level: str
    top_features: List[SHAPFeatureItem]


