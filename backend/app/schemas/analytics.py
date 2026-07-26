from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.enums import RiskLevel, RiskTrend, InterventionType, InterventionStatus
from app.schemas.student import StudentMetricResponse, CodingProfileResponse

class SHAPFactor(BaseModel):
    feature: str
    impact: float
    direction: str

class RiskExplanation(BaseModel):
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    top_factors: List[SHAPFactor]
    model_config = ConfigDict(from_attributes=True)

class RiskScoreBase(BaseModel):
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    risk_trend: RiskTrend
    risk_value: str

class RiskScoreResponse(RiskScoreBase):
    id: int
    student_id: str
    model_version_id: int
    shap_explanation: Optional[dict] = None
    predicted_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RiskScoreWithExplanation(RiskScoreResponse):
    explanation: Optional[RiskExplanation] = None

class RiskHistoryResponse(BaseModel):
    id: int
    student_id: str
    risk_score: float
    risk_level: RiskLevel
    recorded_at: datetime
    model_config = ConfigDict(from_attributes=True)

class InterventionBase(BaseModel):
    student_id: str
    intervention_type: InterventionType
    status: InterventionStatus
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

class InterventionCreate(InterventionBase):
    pass

class InterventionUpdate(BaseModel):
    status: Optional[InterventionStatus] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    outcome_label: Optional[int] = Field(None, ge=0, le=1)

class InterventionResponse(InterventionBase):
    id: int
    outcome_label: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ModelVersionResponse(BaseModel):
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
