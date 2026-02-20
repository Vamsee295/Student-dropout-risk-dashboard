"""
Analytics API routes for dashboard metrics and insights.
"""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database import get_db
from app.models import Student, RiskScore, ModelVersion, RiskLevel, Department, StudentMetric, RiskHistory, Intervention, InterventionStatus, User, Role
from app.schemas import (
    AnalyticsOverview, DepartmentRiskBreakdown,
    FeatureImportance, RiskDistributionBucket
)

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Get dashboard overview metrics.
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
    
    # Average attendance from StudentMetric
    avg_attendance = db.query(func.avg(StudentMetric.attendance_rate)).scalar() or 0

    # High risk department: department with the most high-risk students
    high_risk_dept = None
    high_risk_dept_row = (
        db.query(Student.department, func.count(RiskScore.id).label("cnt"))
        .join(RiskScore, RiskScore.student_id == Student.id)
        .filter(RiskScore.risk_level == RiskLevel.HIGH)
        .group_by(Student.department)
        .order_by(func.count(RiskScore.id).desc())
        .first()
    )
    if high_risk_dept_row:
        high_risk_dept = high_risk_dept_row[0].value if hasattr(high_risk_dept_row[0], 'value') else str(high_risk_dept_row[0])

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
        average_attendance=round(float(avg_attendance), 2),
        high_risk_department=high_risk_dept,
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


@router.get("/risk-trend")
def get_risk_trend(db: Session = Depends(get_db)):
    """
    Returns monthly aggregated risk, attendance, and engagement data
    for the dropout risk trend chart. Derives from current student metrics
    with semester-trend-based historical projection.
    """
    students = db.query(Student).join(StudentMetric).all()
    if not students:
        return {"months": []}

    total = len(students)
    avg_risk = db.query(func.avg(RiskScore.risk_score)).scalar() or 30
    avg_attend = sum(s.metrics.attendance_rate for s in students) / total
    avg_engage = sum(s.metrics.engagement_score for s in students) / total
    avg_trend = sum(s.metrics.semester_performance_trend for s in students) / total
    step = avg_trend / 100 * 3

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    data = []
    for i, m in enumerate(months):
        risk_val = round(max(0, min(100, float(avg_risk) - step * (5 - i))), 1)
        attend_val = round(max(0, min(100, avg_attend + step * (5 - i) * 0.5)), 1)
        engage_val = round(max(0, min(10, avg_engage / 10 + step * (5 - i) * 0.02)), 1)
        data.append({
            "month": m,
            "risk": risk_val,
            "attendance": attend_val,
            "engagement": engage_val,
            "grades": round(max(0, 100 - risk_val * 0.5), 1),
        })

    return {"months": data}


@router.get("/ml-metrics")
def get_ml_metrics(db: Session = Depends(get_db)):
    """
    Returns live ML model performance metrics and student analysis counts.
    """
    active_model = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
    total_students = db.query(func.count(Student.id)).scalar() or 0
    high_risk_count = db.query(func.count(RiskScore.id)).filter(
        RiskScore.risk_level == RiskLevel.HIGH
    ).scalar() or 0

    dept_count = db.query(func.count(func.distinct(Student.department))).scalar() or 0

    accuracy = round(active_model.accuracy * 100, 1) if active_model and active_model.accuracy else 0
    f1 = round(active_model.f1_score * 100, 1) if active_model and active_model.f1_score else 0
    training_samples = active_model.training_samples if active_model else 0

    return {
        "model_accuracy": accuracy,
        "f1_score": f1,
        "training_samples": training_samples,
        "total_students_analyzed": total_students,
        "department_count": dept_count,
        "high_risk_alerts": high_risk_count,
        "model_version": active_model.version if active_model else "N/A",
    }


@router.get("/interventions")
def get_interventions_list(db: Session = Depends(get_db)):
    """
    Returns all interventions grouped by status for the intervention board.
    """
    interventions = db.query(Intervention).order_by(Intervention.created_at.desc()).all()

    pending = []
    in_progress = []
    completed = []

    for iv in interventions:
        student = db.query(Student).filter(Student.id == iv.student_id).first()
        risk = db.query(RiskScore).filter(RiskScore.student_id == iv.student_id).first()
        risk_level_str = risk.risk_level.value if risk else "Unknown"

        card = {
            "id": str(iv.id),
            "studentName": student.name if student else "Unknown",
            "studentInitial": (student.name[:2].upper() if student and student.name else "UK"),
            "studentId": f"#{iv.student_id}",
            "riskLevel": risk_level_str,
            "alertTitle": iv.intervention_type.value.replace("_", " ").title() if iv.intervention_type else "Alert",
            "alertDescription": iv.notes or "",
            "suggestedAction": iv.intervention_type.value.replace("_", " ").title() if iv.intervention_type else "",
            "status": iv.status.value.replace("_", " ").title() if iv.status else "Pending",
            "assignedTo": iv.assigned_to,
            "createdAt": iv.created_at.isoformat() if iv.created_at else None,
            "completedAt": iv.completed_at.isoformat() if iv.completed_at else None,
        }

        if iv.status == InterventionStatus.PENDING:
            pending.append(card)
        elif iv.status == InterventionStatus.IN_PROGRESS:
            in_progress.append(card)
        elif iv.status in (InterventionStatus.COMPLETED, InterventionStatus.CANCELLED):
            completed.append(card)
        else:
            pending.append(card)

    return {"pending": pending, "in_progress": in_progress, "completed": completed}


@router.get("/faculty")
def get_faculty_list(db: Session = Depends(get_db)):
    """
    Returns all users with FACULTY or ADMIN role for advisor/mentor assignment.
    """
    faculty_users = (
        db.query(User)
        .filter(User.role.in_([Role.FACULTY, Role.ADMIN]), User.is_active == True)
        .order_by(User.name)
        .all()
    )

    dept_map = {
        "CSE": "Computer Science",
        "ECE": "Electronics",
        "MECH": "Mechanical",
        "CIVIL": "Civil",
        "AI_DS": "AI & Data Science",
    }

    result = []
    for u in faculty_users:
        dept_label = u.role.value.replace("_", " ").title()
        if u.student_id:
            student = db.query(Student).filter(Student.id == u.student_id).first()
            if student:
                dept_label = dept_map.get(student.department.value, student.department.value)

        result.append({
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "role": u.role.value.replace("_", " ").title(),
            "department": dept_label,
        })

    return {"faculty": result}


@router.get("/at-risk-students")
def get_at_risk_students(db: Session = Depends(get_db)):
    """
    Returns students with risk scores for the intervention Kanban board.
    """
    from datetime import datetime, timedelta

    students_with_risk = (
        db.query(Student, RiskScore)
        .join(RiskScore, RiskScore.student_id == Student.id)
        .order_by(RiskScore.risk_score.desc())
        .limit(20)
        .all()
    )

    result = []
    for student, risk in students_with_risk:
        updated_ago = ""
        if risk.predicted_at:
            delta = datetime.utcnow() - risk.predicted_at
            if delta.days > 0:
                updated_ago = f"{delta.days}d ago"
            elif delta.seconds > 3600:
                updated_ago = f"{delta.seconds // 3600}h ago"
            else:
                updated_ago = f"{max(1, delta.seconds // 60)}m ago"
        else:
            updated_ago = "recently"

        level = risk.risk_level.value if risk.risk_level else "Medium"
        if level == "High Risk":
            level_short = "High"
        elif level == "Low Risk":
            level_short = "Low"
        else:
            level_short = "Medium"

        status = "Needs Review"
        if risk.risk_score < 40:
            status = "Resolved"
        elif risk.risk_score < 60:
            status = "Monitoring"
        elif risk.risk_score < 75:
            status = "Counseling Scheduled"

        result.append({
            "id": student.id,
            "name": student.name,
            "riskScore": round(risk.risk_score, 0),
            "riskLevel": level_short,
            "status": status,
            "lastUpdated": updated_ago,
            "avatar": student.avatar or student.name[:2].upper(),
        })

    return {"students": result}


@router.get("/notifications")
def get_notifications(role: str = "FACULTY", db: Session = Depends(get_db)):
    """
    Return data-driven notifications based on actual system state.
    """
    notifications = []
    now = datetime.utcnow()

    high_risk_count = (
        db.query(func.count(RiskScore.id))
        .filter(RiskScore.risk_level == RiskLevel.HIGH)
        .scalar()
        or 0
    )

    pending_interventions = (
        db.query(func.count(Intervention.id))
        .filter(Intervention.status == InterventionStatus.PENDING)
        .scalar()
        or 0
    )

    if role in ("FACULTY", "ADMIN"):
        if high_risk_count > 0:
            notifications.append({
                "id": "n-highrisk",
                "title": f"{high_risk_count} High-Risk Students",
                "message": f"{high_risk_count} students are currently flagged as High Risk by the ML model.",
                "type": "alert",
                "timestamp": now.isoformat(),
                "read": False,
            })

        if pending_interventions > 0:
            notifications.append({
                "id": "n-pending-iv",
                "title": f"{pending_interventions} Pending Interventions",
                "message": f"You have {pending_interventions} intervention(s) awaiting review.",
                "type": "intervention",
                "timestamp": (now - timedelta(minutes=15)).isoformat(),
                "read": False,
            })

        avg_attendance = db.query(func.avg(StudentMetric.attendance_rate)).scalar() or 0
        if avg_attendance < 75:
            notifications.append({
                "id": "n-attendance",
                "title": "Low Average Attendance",
                "message": f"Average attendance is {avg_attendance:.1f}%, below the 75% threshold.",
                "type": "warning",
                "timestamp": (now - timedelta(hours=2)).isoformat(),
                "read": False,
            })

        recent_completed = (
            db.query(func.count(Intervention.id))
            .filter(
                Intervention.status == InterventionStatus.COMPLETED,
                Intervention.completed_at >= now - timedelta(days=7),
            )
            .scalar()
            or 0
        )
        if recent_completed > 0:
            notifications.append({
                "id": "n-completed",
                "title": f"{recent_completed} Interventions Completed",
                "message": f"{recent_completed} intervention(s) were completed in the last 7 days.",
                "type": "success",
                "timestamp": (now - timedelta(hours=6)).isoformat(),
                "read": True,
            })
    else:
        notifications.append({
            "id": "n-student-info",
            "title": "Dashboard Ready",
            "message": "Your risk dashboard is loaded with the latest data.",
            "type": "info",
            "timestamp": now.isoformat(),
            "read": False,
        })

    return {"notifications": notifications}


class ChatMessage(BaseModel):
    message: str
    student_id: Optional[str] = None


@router.post("/chat")
def advisor_chat(payload: ChatMessage, db: Session = Depends(get_db)):
    """
    Context-aware advisor chat. Inspects the student's actual data
    to provide a meaningful response.
    """
    msg_lower = payload.message.lower()
    student = None
    risk = None
    metrics = None

    if payload.student_id:
        student = db.query(Student).filter(Student.id == payload.student_id).first()
        if student:
            risk = db.query(RiskScore).filter(RiskScore.student_id == student.id).first()
            metrics = db.query(StudentMetric).filter(StudentMetric.student_id == student.id).first()

    if student and risk and metrics:
        if any(w in msg_lower for w in ["risk", "score", "danger", "dropout"]):
            return {
                "reply": (
                    f"{student.name}'s current risk score is {risk.risk_score:.0f}% "
                    f"({risk.risk_level.value}). Their attendance is {metrics.attendance_rate:.0f}% "
                    f"and engagement score is {metrics.engagement_score:.0f}%. "
                    f"{'Immediate intervention is recommended.' if risk.risk_score > 70 else 'Continue monitoring.'}"
                )
            }

        if any(w in msg_lower for w in ["attend", "absent", "class"]):
            return {
                "reply": (
                    f"{student.name}'s attendance rate is {metrics.attendance_rate:.0f}%. "
                    f"{'This is below the warning threshold of 75%.' if metrics.attendance_rate < 75 else 'This is within acceptable range.'} "
                    f"Login gap is currently {metrics.login_gap_days} day(s)."
                )
            }

        if any(w in msg_lower for w in ["perform", "grade", "academic", "marks"]):
            return {
                "reply": (
                    f"{student.name}'s academic performance index is {metrics.academic_performance_index:.1f}/10 "
                    f"with a semester trend of {metrics.semester_performance_trend:+.1f}%. "
                    f"Failure ratio: {metrics.failure_ratio:.0%}."
                )
            }

        if any(w in msg_lower for w in ["intervene", "help", "support", "counsel"]):
            pending = (
                db.query(func.count(Intervention.id))
                .filter(Intervention.student_id == student.id, Intervention.status == InterventionStatus.PENDING)
                .scalar()
                or 0
            )
            return {
                "reply": (
                    f"{student.name} currently has {pending} pending intervention(s). "
                    f"{'Consider scheduling a counseling session.' if pending == 0 else 'An intervention is already in progress.'} "
                    f"Risk level: {risk.risk_level.value}."
                )
            }

        return {
            "reply": (
                f"Here's a quick summary for {student.name}: "
                f"Risk {risk.risk_score:.0f}% ({risk.risk_level.value}), "
                f"Attendance {metrics.attendance_rate:.0f}%, "
                f"Engagement {metrics.engagement_score:.0f}%. "
                f"What specific aspect would you like to discuss?"
            )
        }

    total = db.query(func.count(Student.id)).scalar() or 0
    high = (
        db.query(func.count(RiskScore.id))
        .filter(RiskScore.risk_level == RiskLevel.HIGH)
        .scalar()
        or 0
    )

    return {
        "reply": (
            f"Currently monitoring {total} students, with {high} flagged as high risk. "
            f"Please select a specific student for detailed analysis, or ask about overall trends."
        )
    }
