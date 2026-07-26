from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.enums import Department, Section, RiskLevel, RiskTrend
from app.schemas.analytics import RiskHistoryResponse as RiskHistoryItem, InterventionResponse as InterventionItem, SHAPFactor as SHAPFeatureItem
from app.schemas.academic import AssessmentResponse
from app.schemas.records import AttendanceRecordResponse, StudentAssessmentResponse

class StudentFrontendResponse(BaseModel):
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

class FacultyStudentListItem(BaseModel):
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
    items: List[FacultyStudentListItem]
    total: int
    page: int
    page_size: int
    pages: int

class FacultyStudentProfile(BaseModel):
    id: str
    name: str
    avatar: str
    department: str
    course: str
    section: str
    advisor: Optional[str] = None
    created_at: Optional[datetime] = None
    attendance_rate: float
    engagement_score: float
    academic_performance_index: float
    failure_ratio: float
    semester_performance_trend: float
    login_gap_days: int
    financial_risk_flag: bool
    commute_risk_score: int
    risk_score: float
    risk_level: str
    risk_trend: str
    risk_value: str
    risk_history: List[RiskHistoryItem] = []
    shap_factors: List[SHAPFeatureItem] = []
    interventions: List[InterventionItem] = []

class AnalyticsOverview(BaseModel):
    total_students: int
    high_risk_count: int
    high_risk_percentage: float
    average_risk_score: float
    average_attendance: float
    high_risk_department: Optional[str] = None
    risk_distribution: dict

class DepartmentRiskBreakdown(BaseModel):
    department: Department
    total_students: int
    average_risk_score: float
    high_risk_count: int

class StudentDashboardOverview(BaseModel):
    attendance_rate: float
    avg_marks: float
    engagement_score: float
    risk_level: RiskLevel
    risk_trend: RiskTrend
    risk_value: str
    dropout_probability: float
    upcoming_deadlines: List[AssessmentResponse]
    recent_attendance: List[AttendanceRecordResponse]
