from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.academic import AssessmentResponse

class AttendanceRecordResponse(BaseModel):
    id: int
    course_id: str
    course_name: Optional[str] = None
    date: datetime
    status: str
    model_config = ConfigDict(from_attributes=True)

class StudentAssessmentResponse(BaseModel):
    id: int
    assessment_id: int
    assessment: Optional[AssessmentResponse] = None
    obtained_marks: Optional[float] = None
    status: str
    submission_date: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class UploadSummary(BaseModel):
    rows_processed: int
    students_affected: int
    recalculations_triggered: int
    errors: List[str] = []
    message: str
