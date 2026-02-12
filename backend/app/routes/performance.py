"""
Performance analytics API routes.
Aggregates student academic performance metrics from database.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.database import get_db
from app.models import Student, StudentMetric, Department

router = APIRouter()


@router.get("/aggregate")
def get_performance_aggregate(department: str = None, db: Session = Depends(get_db)):
    """
    Get aggregated performance metrics across all students or filtered by department.
    Derives coding, MCQ, and project metrics from academic_performance_index.
    
    Args:
        department: Optional department name to filter by (e.g., "CSE", "AI-DS")
    """
    # Build query
    query = db.query(Student).join(StudentMetric)
    
    # Filter by department if provided
    if department and department != "All Departments":
        # Map frontend department names to database enum values
        dept_mapping = {
            "CSE": Department.CSE,
            "CS IT": Department.AI_DS,  # Map CS IT to AI-DS
            "AEROSPACE": Department.AEROSPACE,
            "AI-DS": Department.AI_DS,
            "AIML": Department.AI_DS,  # Map AIML to AI-DS
            "DATA SCIENCE": Department.DATA_SCIENCE
        }
        
        if department in dept_mapping:
            query = query.filter(Student.department == dept_mapping[department])
    
    students = query.all()
    
    if not students:
        return {
            "total_students": 0,
            "avg_performance": 0,
            "avg_attendance": 0,
            "avg_engagement": 0,
            "neo_pat_score": 0,
            "coding_stats": {},
            "mcq_stats": {},
            "projects_stats": {},
            "solved_questions": {}
        }
    
    # Aggregate calculations
    total = len(students)
    total_performance = sum(s.metrics.academic_performance_index for s in students)
    total_attendance = sum(s.metrics.attendance_rate for s in students)
    total_engagement = sum(s.metrics.engagement_score for s in students)
    
    avg_performance = total_performance / total
    avg_attendance = total_attendance / total
    avg_engagement = total_engagement / total
    
    # Derive Neo-PAT score from academic performance (normalized to 0-500 scale)
    neo_pat_score = int((avg_performance / 100) * 500)
    
    # Derive coding stats from performance metrics
    # Assume performance correlates with coding proficiency
    coding_attended = int(avg_performance * 0.4)  # Simulated
    coding_solved = int(coding_attended * (avg_performance / 100))
    
    # Derive MCQ stats
    mcq_attended = int(avg_engagement * 0.8)  # Simulated from engagement
    mcq_solved = int(mcq_attended * 0.45)  # ~45% accuracy
    
    # Derive Projects stats (based on completion rate)
    projects_major = int(total * 0.02)  # 2% completed major projects
    projects_minor = int(total * 0.05)  # 5% completed minor projects
    
    # Solved questions breakdown by difficulty
    easy_total = 83
    medium_total = 91
    hard_total = 45
    
    easy_solved = int(easy_total * (avg_performance / 100))
    medium_solved = int(medium_total * (avg_performance / 100) * 0.8)
    hard_solved = int(hard_total * (avg_performance / 100) * 0.4)
    
    return {
        "total_students": total,
        "department": department or "All Departments",
        "avg_performance_index": round(avg_performance, 2),
        "avg_attendance": round(avg_attendance, 2),
        "avg_engagement": round(avg_engagement, 2),
        "neo_pat_score": neo_pat_score,
        "neo_pat_level": _get_pat_level(neo_pat_score),
        "coding_stats": {
            "questions_attended": coding_attended,
            "solved_correctly": coding_solved,
            "your_score": coding_solved * 10,
            "accuracy": round((coding_solved / coding_attended * 100) if coding_attended > 0 else 0, 2)
        },
        "mcq_stats": {
            "questions_attended": mcq_attended,
            "solved_correctly": mcq_solved,
            "your_score": mcq_solved,
            "accuracy": round((mcq_solved / mcq_attended * 100) if mcq_attended > 0 else 0, 2)
        },
        "projects_stats": {
            "major_attended": projects_major,
            "minor_attended": projects_minor,
            "your_score": 0  # Default to 0 for now
        },
        "solved_questions": {
            "easy": {"solved": easy_solved, "total": easy_total},
            "medium": {"solved": medium_solved, "total": medium_total},
            "hard": {"solved": hard_solved, "total": hard_total},
            "total_solved": easy_solved + medium_solved + hard_solved,
            "total_questions": easy_total + medium_total + hard_total
        }
    }


@router.get("/institutional-avg")
def get_institutional_average(db: Session = Depends(get_db)):
    """Get institutional average risk percentage."""
    from app.models import RiskScore
    
    avg_risk = db.query(func.avg(RiskScore.risk_score)).scalar() or 0
    
    return {
        "avg_risk_percentage": round(float(avg_risk), 2),
        "trend": -1.2,  # Simulated trend
        "target": 10.0
    }


@router.get("/department-breakdown")
def get_department_performance(db: Session = Depends(get_db)):
    """Get performance breakdown by department."""
    results = []
    
    for dept in Department:
        students_in_dept = db.query(Student).join(StudentMetric).filter(
            Student.department == dept
        ).all()
        
        if not students_in_dept:
            continue
        
        total = len(students_in_dept)
        avg_perf = sum(s.metrics.academic_performance_index for s in students_in_dept) / total
        avg_attend = sum(s.metrics.attendance_rate for s in students_in_dept) / total
        
        results.append({
            "department": dept.value,
            "total_students": total,
            "avg_performance": round(avg_perf, 2),
            "avg_attendance": round(avg_attend, 2)
        })
    
    return results


def _get_pat_level(score: int) -> str:
    """Determine PAT level based on score."""
    if score >= 400:
        return "Level 3"
    elif score >= 250:
        return "Level 2" 
    elif score >= 100:
        return "Level 1"
    else:
        return "Level 0"
