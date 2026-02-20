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
from app.models import Student, Intervention, InterventionType, InterventionStatus

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
                student.advisor_id = request.advisor_name
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
    Creates an Intervention record (type=counseling) for each student.
    """
    try:
        students = db.query(Student).filter(
            Student.id.in_(request.student_ids)
        ).all()

        if len(students) != len(request.student_ids):
            raise HTTPException(
                status_code=404,
                detail="Some students not found"
            )

        created_ids = []
        for student in students:
            intervention = Intervention(
                student_id=student.id,
                intervention_type=InterventionType.COUNSELING,
                status=InterventionStatus.PENDING,
                assigned_to=student.advisor_id,
                notes=f"Counseling: {request.topic} — Scheduled {request.date} at {request.time}",
            )
            db.add(intervention)
            created_ids.append(student.id)

        db.commit()

        return {
            "success": True,
            "student_count": len(created_ids),
            "intervention_ids": created_ids,
            "topic": request.topic,
            "scheduled_date": request.date,
            "scheduled_time": request.time,
            "message": f"Successfully scheduled '{request.topic}' for {len(created_ids)} students on {request.date} at {request.time}"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
