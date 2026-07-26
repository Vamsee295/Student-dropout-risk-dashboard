from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class InterventionBase(BaseModel):
    student_id: str
    type: str
    priority: str = "Medium"
    notes: Optional[str] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None

class InterventionCreate(InterventionBase):
    pass

class InterventionUpdateStatus(BaseModel):
    status: str
    outcome_notes: Optional[str] = None

class InterventionResponse(InterventionBase):
    id: int
    faculty_id: str
    status: str
    completed_at: Optional[datetime] = None
    outcome_notes: Optional[str] = None
    pre_intervention_risk: Optional[float] = None
    post_intervention_risk: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
