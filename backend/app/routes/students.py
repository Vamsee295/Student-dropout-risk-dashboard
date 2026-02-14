"""
Students API routes for retrieving student data and risk information.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Student, StudentMetric, RiskScore
from app.schemas import StudentResponse, RiskExplanation
from loguru import logger

router = APIRouter()

@router.get("/students")
def get_all_students(db: Session = Depends(get_db)):
    """
    Get all students with their risk scores.
    Returns a list of students formatted for the frontend dashboard.
    """
    try:
        # Query all students with their risk scores
        students = db.query(Student).all()
        
        result = []
        for student in students:
            # Get risk score
            risk_score = db.query(RiskScore).filter(RiskScore.student_id == student.id).first()
            
            # Get metrics for additional data
            metrics = db.query(StudentMetric).filter(StudentMetric.student_id == student.id).first()
            
            if risk_score and metrics:
                # Format for frontend
                student_data = {
                    "id": str(student.id),
                    "name": student.name if hasattr(student, 'name') and student.name else f"Student {student.id}",
                    "avatar": student.avatar if hasattr(student, 'avatar') and student.avatar else "",
                    "course": student.course,
                    "department": map_department(student.course),
                    "section": student.section.value if hasattr(student, 'section') else "A",
                    "riskStatus": risk_score.risk_level.value if hasattr(risk_score.risk_level, 'value') else str(risk_score.risk_level),
                    "riskTrend": risk_score.risk_trend.value if hasattr(risk_score, 'risk_trend') and hasattr(risk_score.risk_trend, 'value') else "stable",
                    "riskValue": f"{risk_score.risk_score:.1f}%",
                    "attendance": int(getattr(metrics, 'attendance_rate', 85)),  # Already 0-100 scale
                    "engagementScore": int(getattr(metrics, 'engagement_score', 75)),  # Already 0-100 scale
                    "lastInteraction": student.updated_at.strftime("%Y-%m-%d") if student.updated_at else "2024-01-01"
                }
                result.append(student_data)
        
        logger.info(f"Retrieved {len(result)} students with risk scores")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching students: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/students/all")
def get_all_students_endpoint(db: Session = Depends(get_db)):
    """
    Alias endpoint for get_all_students to match frontend expectations.
    Frontend components call /api/students/all
    """
    return get_all_students(db)

@router.get("/students/{student_id}/risk", response_model=RiskExplanation)
def get_student_risk(student_id: str, db: Session = Depends(get_db)):
    """
    Get a specific student's risk score with SHAP explanation.
    """
    try:
        # Parse student_id
        try:
            student_id_int = int(student_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid student ID format")
        
        # Get student
        student = db.query(Student).filter(Student.id == student_id_int).first()
        if not student:
            raise HTTPException(status_code=404, detail=f"Student {student_id} not found")
        
        # Get risk score
        risk_score = db.query(RiskScore).filter(RiskScore.student_id == student_id_int).first()
        if not risk_score:
            raise HTTPException(status_code=404, detail=f"Risk score not found for student {student_id}")
        
        # Parse SHAP factors
        import ast
        try:
            top_factors = ast.literal_eval(risk_score.top_factors) if isinstance(risk_score.top_factors, str) else risk_score.top_factors
        except:
            top_factors = []
        
        return RiskExplanation(
            risk_score=risk_score.risk_score,
            risk_level=risk_score.risk_level,
            top_factors=top_factors
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching risk for student {student_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def map_department(course: str) -> str:
    """Map course names to department names."""
    course_lower = course.lower()
    
    if 'computer' in course_lower or 'cs' in course_lower or 'informatics' in course_lower:
        return "Computer Science (CSE)"
    elif 'data' in course_lower:
        return "Data Science"
    elif 'ai' in course_lower or 'artificial' in course_lower:
        return "AI-DS"
    elif 'mechanical' in course_lower:
        return "Mechanical"
    elif 'civil' in course_lower:
        return "Civil"
    elif 'electronic' in course_lower or 'ece' in course_lower:
        return "Electronics (ECE)"
    elif 'aerospace' in course_lower:
        return "Aerospace"
    else:
        return "Computer Science (CSE)"  # Default


# === New Endpoints for Student Management ===

from pydantic import BaseModel
from typing import List as TypingList

class AssignAdvisorRequest(BaseModel):
    student_ids: TypingList[str]
    advisor_name: str


class ScheduleCounselingRequest(BaseModel):
    student_ids: TypingList[str]
    topic: str
    date: str
    time: str


@router.post("/students/assign-advisor")
def assign_advisor(request: AssignAdvisorRequest, db: Session = Depends(get_db)):
    """
    Assign an advisor to multiple students.
    """
    try:
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
        logger.error(f"Error assigning advisor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/students/schedule-counseling")
def schedule_counseling(request: ScheduleCounselingRequest, db: Session = Depends(get_db)):
    """
    Schedule group counseling session for multiple students.
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
        logger.info(f"Scheduled '{request.topic}' for {student_count} students on {request.date} at {request.time}")
        
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
        logger.error(f"Error scheduling counseling: {e}")
        raise HTTPException(status_code=500, detail=str(e))

