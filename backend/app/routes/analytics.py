"""
Analytics API routes for dashboard metrics and insights.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models import Student, RiskScore, ModelVersion, RiskLevel, Department
from app.schemas import (
    AnalyticsOverview, DepartmentRiskBreakdown,
    FeatureImportance, RiskDistributionBucket
)

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Get dashboard overview metrics.
    
    Returns:
    - total_students
    - high_risk_count and percentage
    - average_risk_score
    - risk_distribution by level
    """
    # Total students
    total_students = db.query(func.count(Student.id)).scalar()
    
    # High risk count
    high_risk_count = db.query(func.count(RiskScore.id)).filter(
        RiskScore.risk_level == RiskLevel.HIGH
    ).scalar()
    
    high_risk_percentage = (high_risk_count / total_students * 100) if total_students > 0 else 0
    
    # Average risk score
    avg_risk_score = db.query(func.avg(RiskScore.risk_score)).scalar() or 0
    
    # Risk distribution
    risk_distribution = {}
    for level in RiskLevel:
        count = db.query(func.count(RiskScore.id)).filter(
            RiskScore.risk_level == level
        ).scalar()
        risk_distribution[level.value] = count
    
    return AnalyticsOverview(
        total_students=total_students,
        high_risk_count=high_risk_count,
        high_risk_percentage=round(high_risk_percentage, 2),
        average_risk_score=round(float(avg_risk_score), 2),
        risk_distribution=risk_distribution
    )


@router.get("/risk-distribution", response_model=List[RiskDistributionBucket])
def get_risk_distribution(db: Session = Depends(get_db)):
    """
    Get risk score distribution for histogram chart.
    
    Returns buckets of risk scores (0-10, 10-20, ..., 90-100).
    """
    buckets = []
    
    for i in range(0, 100, 10):
        bucket_start = i
        bucket_end = i + 10
        
        count = db.query(func.count(RiskScore.id)).filter(
            RiskScore.risk_score >= bucket_start,
            RiskScore.risk_score < bucket_end
        ).scalar()
        
        buckets.append(RiskDistributionBucket(
            bucket_start=bucket_start,
            bucket_end=bucket_end,
            count=count
        ))
    
    return buckets


@router.get("/feature-importance", response_model=List[FeatureImportance])
def get_feature_importance(db: Session = Depends(get_db)):
    """
    Get global feature importance from active model.
    """
    active_model = db.query(ModelVersion).filter(
        ModelVersion.is_active == True
    ).first()
    
    if not active_model or not active_model.feature_importance:
        return []
    
    # Convert to list of FeatureImportance objects
    importance_list = [
        FeatureImportance(feature=feature, importance=importance)
        for feature, importance in active_model.feature_importance.items()
    ]
    
    # Sort by importance descending
    importance_list.sort(key=lambda x: x.importance, reverse=True)
    
    return importance_list


@router.get("/department-breakdown", response_model=List[DepartmentRiskBreakdown])
def get_department_breakdown(db: Session = Depends(get_db)):
    """
    Get risk breakdown by department.
    
    Returns average risk score and high-risk count per department.
    """
    results = []
    
    for dept in Department:
        # Get students in department
        students_in_dept = db.query(Student.id).filter(
            Student.department == dept
        ).subquery()
        
        # Total students
        total = db.query(func.count(students_in_dept.c.id)).scalar()
        
        if total == 0:
            continue
        
        # Average risk score
        avg_risk = db.query(func.avg(RiskScore.risk_score)).join(
            students_in_dept, RiskScore.student_id == students_in_dept.c.id
        ).scalar() or 0
        
        # High risk count
        high_risk = db.query(func.count(RiskScore.id)).join(
            students_in_dept, RiskScore.student_id == students_in_dept.c.id
        ).filter(RiskScore.risk_level == RiskLevel.HIGH).scalar()
        
        results.append(DepartmentRiskBreakdown(
            department=dept,
            total_students=total,
            average_risk_score=round(float(avg_risk), 2),
            high_risk_count=high_risk
        ))
    
    # Sort by average risk score descending
    results.sort(key=lambda x: x.average_risk_score, reverse=True)
    
    return results
