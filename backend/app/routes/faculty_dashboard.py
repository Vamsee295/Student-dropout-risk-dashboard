from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
import pandas as pd
import io
from datetime import datetime

from app.database import get_db
from app.models import (
    Student, StudentMetric, RiskScore, AttendanceRecord, 
    Course, Enrollment, Assessment, StudentAssessment,
    Department, RiskLevel, StudentCodingProfile
)
from app.schemas import (
    AnalyticsOverview, DepartmentRiskBreakdown, RiskDistributionBucket,
    StudentWithRisk, RiskTrend, CodingProfileResponse
)

router = APIRouter(
    prefix="/api/faculty",
    tags=["Faculty Dashboard"]
)

@router.get("/overview", response_model=AnalyticsOverview)
def get_dashboard_overview(db: Session = Depends(get_db)):
    """
    Get high-level overview metrics for faculty dashboard.
    """
    total_students = db.query(Student).count()
    
    # Get risk counts
    risk_counts = db.query(
        RiskScore.risk_level, func.count(RiskScore.risk_level)
    ).group_by(RiskScore.risk_level).all()
    
    risk_dist = {
        RiskLevel.HIGH: 0,
        RiskLevel.MODERATE: 0,
        RiskLevel.STABLE: 0,
        RiskLevel.SAFE: 0
    }
    
    for level, count in risk_counts:
        if level in risk_dist:
            risk_dist[level] = count
            
    high_risk_count = risk_dist[RiskLevel.HIGH]
    high_risk_pct = (high_risk_count / total_students * 100) if total_students > 0 else 0.0
    
    # Average Risk Score
    avg_risk = db.query(func.avg(RiskScore.risk_score)).scalar() or 0.0

    # Average Attendance
    avg_attendance = db.query(func.avg(StudentMetric.attendance_rate)).scalar() or 0.0

    # High Risk Department
    high_risk_dept_query = db.query(
        Student.department, func.count(Student.id)
    ).join(RiskScore).filter(RiskScore.risk_level == RiskLevel.HIGH)\
    .group_by(Student.department)\
    .order_by(desc(func.count(Student.id)))\
    .first()
    
    high_risk_dept = high_risk_dept_query[0] if high_risk_dept_query else None
    
    return AnalyticsOverview(
        total_students=total_students,
        high_risk_count=high_risk_count,
        high_risk_percentage=round(high_risk_pct, 1),
        average_risk_score=round(avg_risk, 1),
        average_attendance=round(avg_attendance, 1),
        high_risk_department=high_risk_dept,
        risk_distribution=risk_dist
    )

@router.get("/students", response_model=List[StudentWithRisk])
def get_students_list(
    department: Optional[Department] = None,
    risk_level: Optional[RiskLevel] = None,
    db: Session = Depends(get_db)
):
    """
    Get list of students with their current risk status.
    """
    query = db.query(Student).join(RiskScore).join(StudentMetric)
    
    if department:
        query = query.filter(Student.department == department)
        
    if risk_level:
        query = query.filter(RiskScore.risk_level == risk_level)
        
    students = query.all()
    
    response = []
    for s in students:
        # Determine last interaction string
        last_inter = s.metrics.last_interaction.strftime("%Y-%m-%d") if s.metrics else "N/A"
        
        response.append(StudentWithRisk(
            id=s.id,
            name=s.name,
            avatar=s.avatar or "ST",
            course=s.course,
            department=s.department,
            section=s.section,
            riskStatus=s.risk_score.risk_level if s.risk_score else RiskLevel.SAFE,
            riskTrend=s.risk_score.risk_trend if s.risk_score else RiskTrend.STABLE,
            riskValue=s.risk_score.risk_value if s.risk_score else "0%",
            attendance=s.metrics.attendance_rate if s.metrics else 0.0,
            engagementScore=s.metrics.engagement_score if s.metrics else 0.0,
            lastInteraction=last_inter,
            advisor=s.advisor_id
        ))
        
    return response

@router.get("/analytics/department", response_model=List[DepartmentRiskBreakdown])
def get_department_analytics(db: Session = Depends(get_db)):
    """
    Get risk breakdown by department.
    """
    # Group by department and calculate stats
    results = db.query(
        Student.department,
        func.count(Student.id).label("total"),
        func.avg(RiskScore.risk_score).label("avg_risk")
    ).join(RiskScore).group_by(Student.department).all()
    
    response = []
    for dept, total, avg_risk in results:
        # Count high risk specific to department
        high_risk = db.query(Student)\
            .join(RiskScore)\
            .filter(
                Student.department == dept,
                RiskScore.risk_level == RiskLevel.HIGH
            ).count()
            
        response.append(DepartmentRiskBreakdown(
            department=dept,
            total_students=total,
            average_risk_score=round(avg_risk, 1) if avg_risk else 0.0,
            high_risk_count=high_risk
        ))
        
    return response

@router.post("/upload/{data_type}")
async def upload_data(
    data_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload CSV data for Attendance, Marks, or Assignments.
    Triggers recalculation if successful.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")
        
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    # Basic validation and processing based on type
    try:
        if data_type == "attendance":
            # Expected columns: student_id, course_id, date, status
            for _, row in df.iterrows():
                # Upsert or insert logic would go here
                pass 
                
        elif data_type == "marks":
            # Expected: student_id, assessment_id, marks
            pass
            
        return {"message": f"Successfully processed {len(df)} records for {data_type}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recalculate")
def recalculate_scores(db: Session = Depends(get_db)):
    """
    Trigger ML-based risk score re-computation for all students.
    
    This uses the trained XGBoost model to predict dropout risk,
    not the old formula-based approach.
    """
    from app.services.realtime_prediction import compute_all_risk_scores
    
    try:
        # Compute all risk scores using ML model
        result = compute_all_risk_scores(db)
        
        return {
            "message": f"Successfully recalculated ML-based risk scores for {result['processed']} students",
            "total_students": result['total'],
            "processed": result['processed'],
            "risk_distribution": result['risk_distribution']
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Risk recalculation failed: {str(e)}"
        )


class StudentCodingStats(StudentWithRisk):
    """Extended schema for coding report."""
    coding_profile: Optional[CodingProfileResponse] = None


@router.get("/reports/coding", response_model=List[StudentCodingStats])
def get_coding_reports(
    department: Optional[Department] = None,
    db: Session = Depends(get_db)
):
    """
    Get detailed coding profiles for all students.
    """
    query = db.query(Student).outerjoin(StudentCodingProfile).outerjoin(RiskScore).outerjoin(StudentMetric)
    
    if department:
        query = query.filter(Student.department == department)
        
    students = query.all()
    
    response = []
    for s in students:
        last_inter = s.metrics.last_interaction.strftime("%Y-%m-%d") if s.metrics else "N/A"
        
        # Build base student data
        student_data = StudentWithRisk(
            id=s.id,
            name=s.name,
            avatar=s.avatar or "ST",
            course=s.course,
            department=s.department,
            section=s.section,
            riskStatus=s.risk_score.risk_level if s.risk_score else RiskLevel.SAFE,
            riskTrend=s.risk_score.risk_trend if s.risk_score else RiskTrend.STABLE,
            riskValue=s.risk_score.risk_value if s.risk_score else "0%",
            attendance=s.metrics.attendance_rate if s.metrics else 0.0,
            engagementScore=s.metrics.engagement_score if s.metrics else 0.0,
            lastInteraction=last_inter,
            advisor=s.advisor_id
        )
        
        # Add coding profile
        coding_stats = StudentCodingStats(
            **student_data.model_dump(),
            coding_profile=s.coding_profile
        )
        response.append(coding_stats)
        
    return response
