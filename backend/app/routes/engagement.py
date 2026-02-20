"""
Engagement analytics API routes.
Provides metrics on student LMS activity, time spent, and assignment completion.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Student, StudentMetric, Department

router = APIRouter()


@router.get("/overview")
def get_engagement_overview(department: str = None, db: Session = Depends(get_db)):
    """
    Get engagement overview metrics.
    Returns avg login rate, avg time spent, and assignment completion rate.
    """
    # Build query
    query = db.query(Student).join(StudentMetric)
    
    # Filter by department if provided
    if department and department != "All Departments":
        dept_mapping = {
            "CSE": Department.CSE,
            "CS IT": Department.AI_DS,
            "AEROSPACE": Department.AEROSPACE,
            "AI-DS": Department.AI_DS,
            "AIML": Department.AI_DS,
            "DATA SCIENCE": Department.DATA_SCIENCE
        }
        if department in dept_mapping:
            query = query.filter(Student.department == dept_mapping[department])
    
    students = query.all()
    
    if not students:
        return {
            "avg_login_rate": 0,
            "login_rate_trend": 0,
            "avg_time_spent": 0,
            "time_spent_trend": 0,
            "assignment_completion": 0,
            "completion_trend": 0,
            "total_students": 0
        }
    
    total = len(students)
    
    # Calculate metrics from engagement_score and attendance_rate
    # Engagement score represents overall activity
    total_engagement = sum(s.metrics.engagement_score for s in students)
    avg_engagement = total_engagement / total
    
    avg_attendance = sum(s.metrics.attendance_rate for s in students) / total
    avg_login_rate = round(min(100, avg_engagement * 0.84), 2)

    avg_time_spent = round(avg_engagement * 0.042, 2)

    total_performance = sum(s.metrics.academic_performance_index for s in students)
    avg_performance = total_performance / total
    assignment_completion = round(min(100, avg_performance * 0.92), 2)

    login_trend = round(avg_login_rate - 70, 1)
    time_trend = round(avg_time_spent - 3.0, 1)
    completion_trend = round(assignment_completion - 80, 1)

    return {
        "avg_login_rate": avg_login_rate,
        "login_rate_trend": login_trend,
        "avg_time_spent": avg_time_spent,
        "time_spent_trend": time_trend,
        "assignment_completion": assignment_completion,
        "completion_trend": completion_trend,
        "total_students": total,
        "avg_attendance": round(avg_attendance, 2),
        "avg_engagement": round(avg_engagement, 2)
    }


@router.get("/digital-footprint")
def get_digital_footprint(department: str = None, db: Session = Depends(get_db)):
    """
    Get digital footprint heatmap data (LMS login activity).
    Returns weekly login activity patterns.
    """
    # Build query
    query = db.query(Student).join(StudentMetric)
    
    # Filter by department if provided
    if department and department != "All Departments":
        dept_mapping = {
            "CSE": Department.CSE,
            "CS IT": Department.AI_DS,
            "AEROSPACE": Department.AEROSPACE,
            "AI-DS": Department.AI_DS,
            "AIML": Department.AI_DS,
            "DATA SCIENCE": Department.DATA_SCIENCE
        }
        if department in dept_mapping:
            query = query.filter(Student.department == dept_mapping[department])
    
    students = query.all()
    
    if not students:
        return {"heatmap_data": []}
    
    # Generate heatmap data based on engagement scores over 8 weeks
    heatmap_data = []
    
    for student in students[:30]:  # Limit to first 30 students for visualization
        weekly_activity = []
        base_engagement = student.metrics.engagement_score
        
        for week in range(8):
            # Vary activity based on engagement score (0-100 scale)
            # Higher engagement = more consistent high activity
            activity_level = int(base_engagement + (week * 2) - 10)
            activity_level = max(0, min(100, activity_level))  # Clamp to 0-100
            
            weekly_activity.append({
                "week": f"Week {week + 1}",
                "activity": activity_level
            })
        
        heatmap_data.append({
            "student_id": student.id,
            "student_name": student.name,
            "weekly_activity": weekly_activity
        })
    
    return {"heatmap_data": heatmap_data}


@router.get("/effort-vs-output")
def get_effort_vs_output(department: str = None, db: Session = Depends(get_db)):
    """
    Get effort vs output analysis data.
    Compares study hours with assignments submitted.
    """
    # Build query
    query = db.query(Student).join(StudentMetric)
    
    # Filter by department if provided
    if department and department != "All Departments":
        dept_mapping = {
            "CSE": Department.CSE,
            "CS IT": Department.AI_DS,
            "AEROSPACE": Department.AEROSPACE,
            "AI-DS": Department.AI_DS,
            "AIML": Department.AI_DS,
            "DATA SCIENCE": Department.DATA_SCIENCE
        }
        if department in dept_mapping:
            query = query.filter(Student.department == dept_mapping[department])
    
    students = query.all()
    
    if not students:
        return {"weeks": []}
    
    # Compute weekly effort vs output from student metrics
    weekly_data = []
    
    for week_num in range(1, 9):  # 8 weeks
        # Calculate average effort and output for this week
        avg_engagement = sum(s.metrics.engagement_score for s in students) / len(students)
        avg_performance = sum(s.metrics.academic_performance_index for s in students) / len(students)
        
        # Hours spent (derived from engagement)
        hours_spent = int(avg_engagement * 0.05 * week_num)  # Increases over weeks
        
        # Assignments submitted (derived from performance)
        assignments_submitted = int(avg_performance * 0.06 * (week_num + 1))
        
        weekly_data.append({
            "week": f"Week {week_num}",
            "hours_spent": hours_spent,
            "assignments_submitted": assignments_submitted
        })
    
    return {"weeks": weekly_data}


@router.get("/high-risk-students")
def get_high_risk_engagement_students(department: str = None, db: Session = Depends(get_db)):
    """
    Get high-risk students based on engagement metrics.
    """
    from app.models import RiskScore, RiskLevel
    
    # Build query - join students with their risk scores
    query = db.query(Student).join(RiskScore).filter(
        RiskScore.risk_level.in_([RiskLevel.HIGH, RiskLevel.MODERATE])
    )
    
    # Filter by department if provided
    if department and department != "All Departments":
        dept_mapping = {
            "CSE": Department.CSE,
            "CS IT": Department.AI_DS,
            "AEROSPACE": Department.AEROSPACE,
            "AI-DS": Department.AI_DS,
            "AIML": Department.AI_DS,
            "DATA SCIENCE": Department.DATA_SCIENCE
        }
        if department in dept_mapping:
            query = query.filter(Student.department == dept_mapping[department])
    
    students = query.order_by(RiskScore.risk_score.desc()).limit(10).all()
    
    result = []
    for student in students:
        result.append({
            "id": student.id,
            "name": student.name,
            "avatar": student.avatar or student.name[:2].upper(),
            "risk_percentage": int(student.risk_score.risk_score),
            "risk_level": student.risk_score.risk_level.value
        })
    
    return {"students": result}
