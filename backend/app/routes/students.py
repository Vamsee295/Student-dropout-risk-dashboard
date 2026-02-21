"""
Students API routes for retrieving student data and risk information.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Student, StudentMetric, RiskScore, Intervention, InterventionType, InterventionStatus
from app.schemas import StudentResponse, RiskExplanation
from loguru import logger
from datetime import datetime

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
                    "lastInteraction": student.updated_at.strftime("%Y-%m-%d") if student.updated_at else "2024-01-01",
                    "primaryRiskDriver": get_primary_driver(risk_score.shap_explanation)
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


@router.get("/students/{student_id}")
def get_student_by_id(student_id: str, db: Session = Depends(get_db)):
    """
    Get a specific student by ID with metrics and risk score.
    """
    try:
        # Get student
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail=f"Student {student_id} not found")
        
        # Get risk score
        risk_score = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
        
        # Get metrics
        metrics = db.query(StudentMetric).filter(StudentMetric.student_id == student_id).first()
        
        # Format response
        student_data = {
            "id": str(student.id),
            "name": student.name,
            "avatar": student.avatar or "",
            "course": student.course,
            "department": map_department(student.course),
            "section": student.section.value if hasattr(student, 'section') else "A",
            "advisor": student.advisor_id, # Or lookup name
            "riskStatus": str(risk_score.risk_level.value) if risk_score else "Unknown",
            "riskTrend": str(risk_score.risk_trend.value) if risk_score and hasattr(risk_score, 'risk_trend') else "stable",
            "riskValue": f"{risk_score.risk_score:.1f}%" if risk_score else "0.0%",
            "attendance": int(getattr(metrics, 'attendance_rate', 0)) if metrics else 0,
            "engagementScore": int(getattr(metrics, 'engagement_score', 0)) if metrics else 0,
            "lastInteraction": student.updated_at.strftime("%Y-%m-%d") if student.updated_at else datetime.utcnow().strftime("%Y-%m-%d")
        }
        
        return student_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching student {student_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/students/{student_id}/risk", response_model=RiskExplanation)
def get_student_risk(student_id: str, db: Session = Depends(get_db)):
    """
    Get a specific student's risk score with SHAP explanation.
    """
    try:
        # Get student (Student.id is String, no int conversion needed)
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail=f"Student {student_id} not found")
        
        # Get risk score
        risk_score = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
        if not risk_score:
            raise HTTPException(status_code=404, detail=f"Risk score not found for student {student_id}")
        
        # Parse SHAP factors
        top_factors = []
        if risk_score.shap_explanation:
            shap_data = risk_score.shap_explanation
            if isinstance(shap_data, dict):
                top_factors = shap_data.get('top_factors', [])
            
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


def get_primary_driver(shap_explanation: dict) -> str:
    """
    Extract the primary risk driver from SHAP explanation.
    """
    if not shap_explanation or not isinstance(shap_explanation, dict):
        return "AI Prediction"
    
    top_factors = shap_explanation.get('top_factors', [])
    if not top_factors:
        return "AI Prediction"
    
    # Get the factor with the highest impact
    # Assuming top_factors is already sorted by impact, but let's be safe
    try:
        # If it's a list of dicts
        first_factor = top_factors[0]
        if isinstance(first_factor, dict):
             return f"{first_factor.get('feature', 'Unknown')} ({int(first_factor.get('impact', 0) * 100)}%)"
        # If it's an object (pydantic model dumped)
        elif hasattr(first_factor, 'feature'):
            return f"{first_factor.feature} ({int(first_factor.impact * 100)}%)"
            
        return "Complex Factors"
    except Exception:
        return "AI Prediction"


# === New Endpoints for Student Management ===

from pydantic import BaseModel
from typing import List as TypingList, Optional

class AssignAdvisorRequest(BaseModel):
    student_ids: TypingList[str]
    advisor_name: str


class ScheduleCounselingRequest(BaseModel):
    student_ids: TypingList[str]
    topic: str
    date: str
    time: str


class CaseNoteRequest(BaseModel):
    note: str


class CounselingRequest(BaseModel):
    date: str
    time: str
    type: str = "Academic"


class MentorRequest(BaseModel):
    mentor_id: str
    mentor_name: str


class EmailRequest(BaseModel):
    subject: str
    body: str


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
        logger.error(f"Error assigning advisor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/students/schedule-counseling")
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
        logger.error(f"Error scheduling counseling: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Single-student action endpoints ─────────────────────────────────────────

@router.post("/students/{student_id}/notes")
def add_case_note(student_id: str, request: CaseNoteRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    intervention = Intervention(
        student_id=student_id,
        intervention_type=InterventionType.ACADEMIC,
        status=InterventionStatus.IN_PROGRESS,
        assigned_to=student.advisor_id,
        notes=request.note,
    )
    db.add(intervention)
    student.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "message": "Case note added.", "intervention_id": intervention.id}


@router.patch("/students/{student_id}/reviewed")
def mark_reviewed(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "message": "Student profile marked as reviewed.", "reviewed_at": student.updated_at.isoformat()}


@router.post("/students/{student_id}/escalate")
def escalate_case(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    intervention = Intervention(
        student_id=student_id,
        intervention_type=InterventionType.COUNSELING,
        status=InterventionStatus.PENDING,
        assigned_to="Dean of Students",
        notes="ESCALATED — Requires immediate review by Dean of Students.",
    )
    db.add(intervention)
    db.commit()
    return {"success": True, "message": "Case escalated to Dean of Students.", "intervention_id": intervention.id}


@router.post("/students/{student_id}/counseling")
def schedule_single_counseling(student_id: str, request: CounselingRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    intervention = Intervention(
        student_id=student_id,
        intervention_type=InterventionType.COUNSELING,
        status=InterventionStatus.PENDING,
        assigned_to=student.advisor_id,
        notes=f"{request.type} counseling — Scheduled {request.date} at {request.time}",
    )
    db.add(intervention)
    db.commit()
    return {"success": True, "message": f"Counseling scheduled for {request.date} at {request.time}.", "intervention_id": intervention.id}


@router.post("/students/{student_id}/mentor")
def assign_mentor(student_id: str, request: MentorRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.advisor_id = request.mentor_name
    intervention = Intervention(
        student_id=student_id,
        intervention_type=InterventionType.MENTORING,
        status=InterventionStatus.IN_PROGRESS,
        assigned_to=request.mentor_name,
        notes=f"Peer mentor {request.mentor_name} assigned.",
    )
    db.add(intervention)
    db.commit()
    return {"success": True, "message": f"Mentor {request.mentor_name} assigned.", "intervention_id": intervention.id}


@router.post("/students/{student_id}/email")
def email_student(student_id: str, request: EmailRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    intervention = Intervention(
        student_id=student_id,
        intervention_type=InterventionType.ACADEMIC,
        status=InterventionStatus.COMPLETED,
        assigned_to=student.advisor_id,
        notes=f"Email sent — Subject: {request.subject}",
        outcome_label="Email sent",
    )
    db.add(intervention)
    db.commit()
    return {"success": True, "message": "Email sent to student."}


@router.get("/students/{student_id}/coding-profile")
def get_coding_profile(student_id: str, db: Session = Depends(get_db)):
    from app.models import StudentCodingProfile

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    profile = db.query(StudentCodingProfile).filter(StudentCodingProfile.student_id == student_id).first()
    if not profile:
        return {
            "student_id": student_id,
            "hackerrank_score": 0, "hackerrank_solved": 0,
            "leetcode_rating": 0, "leetcode_solved": 0,
            "codechef_rating": 0, "codeforces_rating": 0,
            "overall_score": 0, "global_rank": 0,
        }

    return {
        "student_id": student_id,
        "hackerrank_score": profile.hackerrank_score or 0,
        "hackerrank_solved": profile.hackerrank_solved or 0,
        "leetcode_rating": profile.leetcode_rating or 0,
        "leetcode_solved": profile.leetcode_solved or 0,
        "codechef_rating": profile.codechef_rating or 0,
        "codeforces_rating": profile.codeforces_rating or 0,
        "overall_score": profile.overall_score or 0,
        "global_rank": 0,
    }


# ── Faculty intervention creation ────────────────────────────────────────────

class CreateInterventionRequest(BaseModel):
    student_id: str
    type: str = "counseling"
    notes: str = ""
    assigned_to: Optional[str] = None


@router.post("/faculty/interventions")
def create_intervention(request: CreateInterventionRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    type_map = {
        "counseling": InterventionType.COUNSELING,
        "tutoring": InterventionType.TUTORING,
        "mentoring": InterventionType.MENTORING,
        "financial": InterventionType.FINANCIAL,
        "academic": InterventionType.ACADEMIC,
    }
    i_type = type_map.get(request.type.lower(), InterventionType.ACADEMIC)

    intervention = Intervention(
        student_id=request.student_id,
        intervention_type=i_type,
        status=InterventionStatus.PENDING,
        assigned_to=request.assigned_to or student.advisor_id,
        notes=request.notes,
    )
    db.add(intervention)
    db.commit()
    return {
        "success": True,
        "intervention_id": intervention.id,
        "message": f"Intervention created for student {student.name}.",
    }

