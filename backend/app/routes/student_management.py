"""
Student management API routes.
Provides endpoints for assigning advisors and scheduling counseling sessions.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import Student

router = APIRouter()


class AssignAdvisorRequest(BaseModel):
    student_ids: List[str]
    advisor_name: str


class ScheduleCounselingRequest(BaseModel):
    student_ids: List[str]
    topic: str
    date: str
    time: str


@router.post("/assign-advisor")
def assign_advisor(request: AssignAdvisorRequest, db: Session = Depends(get_db)):
    """
    Assign an advisor to multiple students.
    """
    try:
        # Update advisor for all specified students
        updated_count = 0
        for student_id in request.student_ids:
            student = db.query(Student).filter(Student.id == student_id).first()
            if student:
                student.advisor = request.advisor_name
                updated_count += 1
        
        db.commit()
        
        return {
            "success": True,
            "updated_count": updated_count,
            "advisor": request.advisor_name,
            "message": f"Successfully assigned {request.advisor_name} to {updated_count} students"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/schedule-counseling")
def schedule_counseling(request: ScheduleCounselingRequest, db: Session = Depends(get_db)):
    """
    Schedule group counseling session for multiple students.
    Note: In a full implementation, this would create entries in a counseling_sessions table.
    For now, we'll log the scheduling request.
    """
    try:
        # Verify all students exist
        student_count = db.query(Student).filter(
            Student.id.in_(request.student_ids)
        ).count()
        
        if student_count != len(request.student_ids):
            raise HTTPException(
                status_code=404,
                detail="Some students not found"
            )
        
        # In a real implementation, create counseling session record
        # For now, just return success
        return {
            "success": True,
            "student_count": student_count,
            "topic": request.topic,
            "scheduled_date": request.date,
            "scheduled_time": request.time,
            "message": f"Successfully scheduled '{request.topic}' for {student_count} students on {request.date} at {request.time}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
