from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.enums import Department, Section, RiskLevel, RiskTrend

class CodingProfileResponse(BaseModel):
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

class StudentMetricBase(BaseModel):
    attendance_rate: float = Field(..., ge=0, le=100)
    engagement_score: float = Field(..., ge=0, le=100)
    academic_performance_index: float
    login_gap_days: int = Field(..., ge=0)
    failure_ratio: float = Field(..., ge=0, le=1)
    financial_risk_flag: bool
    commute_risk_score: int = Field(..., ge=1, le=4)
    semester_performance_trend: float
    last_interaction: datetime

class StudentMetricResponse(StudentMetricBase):
    id: int
    student_id: str
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class StudentMetricUpdate(StudentMetricBase):
    pass

class StudentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    course: str = Field(..., min_length=1, max_length=100)
    department: Department
    section: Section
    advisor_id: Optional[str] = None

class StudentCreate(StudentBase):
    id: str = Field(..., min_length=1, max_length=50)
    avatar: str = Field(..., max_length=10)

class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    course: Optional[str] = Field(None, min_length=1, max_length=100)
    department: Optional[Department] = None
    section: Optional[Section] = None
    advisor_id: Optional[str] = None

class StudentResponse(StudentBase):
    id: str
    avatar: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CreateStudentRequest(BaseModel):
    id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=200)
    department: Department
    section: Section
    course: str = Field(..., min_length=1, max_length=100)
    advisor_id: Optional[str] = None
    attendance_rate: float = Field(default=75.0, ge=0, le=100)
    engagement_score: float = Field(default=70.0, ge=0, le=100)
    academic_performance_index: float = Field(default=65.0, ge=0)
    failure_ratio: float = Field(default=0.1, ge=0, le=1)
    financial_risk_flag: bool = False
    commute_risk_score: int = Field(default=1, ge=1, le=4)
