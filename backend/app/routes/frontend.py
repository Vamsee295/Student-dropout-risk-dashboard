"""
Simple API endpoint to return all students with risk scores for frontend integration.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Student, StudentMetric, RiskScore
from loguru import logger

router = APIRouter()

@router.get("/api/students/all")
def get_all_students_frontend(db: Session = Depends(get_db)):
    """
    Get all students formatted for frontend dashboard.
    Returns students with risk scores in the format expected by the UI.
    """
    try:
        students = db.query(Student).all()
        
        result = []
        for student in students:
            risk_score_obj = db.query(RiskScore).filter(RiskScore.student_id == student.id).first()
            metrics = db.query(StudentMetric).filter(StudentMetric.student_id == student.id).first()
            
            # Only include students with computed risk scores
            if not risk_score_obj:
                continue
            
            # Map course to department
            course_lower = student.course.lower() if student.course else ""
            if 'computer' in course_lower or 'informatics' in course_lower:
                department = "Computer Science (CSE)"
            elif 'data' in course_lower:
                department = "Data Science"
            elif 'ai' in course_lower:
                department = "AI-DS"
            elif 'mechanical' in course_lower:
                department = "Mechanical"
            elif 'civil' in course_lower:
                department = "Civil"
            elif 'electronic' in course_lower:
                department = "Electronics (ECE)"
            elif 'aerospace' in course_lower:
                department = "Aerospace"
            else:
                department = "Computer Science (CSE)"
            
            
            # Calculate engagement score - prefer metrics, fallback to calculated value
            if metrics:
                attendance = float(metrics.attendance_rate) if metrics.attendance_rate else 85.0
                engagement = float(metrics.engagement_score) if metrics.engagement_score else 0.0
                
                # If engagement_score is 0 or null, calculate from other metrics
                if engagement == 0.0:
                    # Calculate based on api (academic performance index) and attendance
                    api_score = float(metrics.academic_performance_index) if hasattr(metrics, 'academic_performance_index') and metrics.academic_performance_index else 0.0
                    # Weighted: 60% API + 40% Attendance
                    engagement = (api_score * 0.6 + attendance * 0.4) if api_score > 0 else attendance * 0.7
            else:
                attendance = 85.0
                engagement = 75.0
            
            student_data = {
                "id": str(student.id),
                "name": f"Student {student.id}",
                "avatar": f"S{str(student.id)[-1]}",  # Use last digit for avatar
                "course": student.course or "Unknown",
                "department": department,
                "section": "A",  # Default section
                "year": getattr(student, 'year', 1),  # Default to year 1
                "email": f"student{student.id}@university.edu",  # Generated email
                "risk_score": float(risk_score_obj.risk_score),  # Numeric risk score
                "risk_level": risk_score_obj.risk_level,  # HIGH, MODERATE, LOW, SAFE
                "riskStatus": risk_score_obj.risk_level,
                "riskTrend": "stable",  # Default, can be enhanced from risk_history
                "riskValue": f"{risk_score_obj.risk_score:.1f}%",
                "attendance": attendance,
                "engagementScore": engagement,
                "lastInteraction": student.updated_at.strftime("%b %d, %Y") if student.updated_at else "Jan 01, 2024",
                "updated_at": student.updated_at.isoformat() if student.updated_at else None,
                "advisor": getattr(student, 'advisor', None)
            }
            result.append(student_data)
        
        logger.info(f"Retrieved {len(result)} students for frontend")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching students: {e}")
        return {"error": str(e)}
