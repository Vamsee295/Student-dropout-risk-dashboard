from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.enums import Department

class CourseBase(BaseModel):
    id: str
    name: str
    department: Department
    credits: int
    semester: int

class CourseResponse(CourseBase):
    model_config = ConfigDict(from_attributes=True)

class AssessmentResponse(BaseModel):
    id: int
    course_id: str
    course_name: Optional[str] = None
    title: str
    type: str
    total_marks: float
    weightage: float
    due_date: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
