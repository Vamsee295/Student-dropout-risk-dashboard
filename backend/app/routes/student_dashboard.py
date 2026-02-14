from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models import (
    Student, StudentMetric, RiskScore, AttendanceRecord, 
    Course, Enrollment, Assessment, StudentAssessment,
    AttendanceStatus, SubmissionStatus, RiskLevel, RiskTrend
)
from app.schemas import (
    StudentDashboardOverview, SemesterPerformance, SubjectPerformance,
    AttendanceRecordResponse, AssessmentResponse, AssignmentProgress,
    StudentAssessmentResponse, RiskScoreWithExplanation, RiskExplanation,
    SHAPFactor
)

router = APIRouter(
    prefix="/api/student",
    tags=["Student Dashboard"]
)

# TODO: Add authentication dependency to get current student_id
# For now, we'll accept student_id as a query parameter for testing
# or hardcode a "current user" logic until auth is fully integrated with this module

def get_student_or_404(db: Session, student_id: str):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.get("/{student_id}/overview", response_model=StudentDashboardOverview)
def get_student_overview(student_id: str, db: Session = Depends(get_db)):
    """
    Get high-level overview for student dashboard.
    """
    student = get_student_or_404(db, student_id)
    
    # Get metrics
    metrics = db.query(StudentMetric).filter(StudentMetric.student_id == student_id).first()
    risk = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
    
    # Get recent attendance (last 5 records)
    recent_attendance_records = db.query(AttendanceRecord)\
        .filter(AttendanceRecord.student_id == student_id)\
        .order_by(desc(AttendanceRecord.date))\
        .limit(5)\
        .all()
    
    # Format attendance response
    attendance_response = []
    for record in recent_attendance_records:
        course_name = record.course.name if record.course else "Unknown Course"
        attendance_response.append(AttendanceRecordResponse(
            id=record.id,
            course_id=record.course_id,
            course_name=course_name,
            date=record.date,
            status=record.status
        ))

    # Get upcoming deadlines (next 7 days)
    today = datetime.utcnow()
    next_week = today + timedelta(days=7)
    
    # Find assessments for courses the student is enrolled in
    enrolled_course_ids = [e.course_id for e in student.enrollments]
    
    upcoming_assessments = db.query(Assessment)\
        .filter(
            Assessment.course_id.in_(enrolled_course_ids),
            Assessment.due_date >= today,
            Assessment.due_date <= next_week
        )\
        .order_by(Assessment.due_date)\
        .all()
        
    assessment_response = []
    for assess in upcoming_assessments:
        assessment_response.append(AssessmentResponse(
            id=assess.id,
            course_id=assess.course_id,
            course_name=assess.course.name,
            title=assess.title,
            type=assess.type,
            total_marks=assess.total_marks,
            weightage=assess.weightage,
            due_date=assess.due_date
        ))

    # Defaults if no data
    attendance_rate = metrics.attendance_rate if metrics else 0.0
    avg_marks = metrics.academic_performance_index * 10 if metrics else 0.0 # Scaling GPA to marks rough approx
    engagement_score = metrics.engagement_score if metrics else 0.0
    
    risk_level = risk.risk_level if risk else RiskLevel.SAFE
    risk_trend = risk.risk_trend if risk else RiskTrend.STABLE
    risk_value = risk.risk_value if risk else "0%"
    dropout_prob = risk.risk_score if risk else 0.0

    return StudentDashboardOverview(
        attendance_rate=attendance_rate,
        avg_marks=avg_marks,
        engagement_score=engagement_score,
        risk_level=risk_level,
        risk_trend=risk_trend,
        risk_value=risk_value,
        dropout_probability=dropout_prob,
        upcoming_deadlines=assessment_response,
        recent_attendance=attendance_response
    )

@router.get("/{student_id}/performance", response_model=List[SemesterPerformance])
def get_student_performance(student_id: str, db: Session = Depends(get_db)):
    """
    Get detailed subject-wise performance grouped by semester.
    """
    student = get_student_or_404(db, student_id)
    
    # Group enrollments by semester
    enrollments_by_sem = {}
    for enrollment in student.enrollments:
        sem = enrollment.semester
        if sem not in enrollments_by_sem:
            enrollments_by_sem[sem] = []
        enrollments_by_sem[sem].append(enrollment)
        
    response = []
    
    for sem, enrollments in enrollments_by_sem.items():
        subjects = []
        total_credits = 0
        weighted_grade_points = 0
        
        for enroll in enrollments:
            course = enroll.course
            
            # Calculate marks from assessments
            # This is a simplification. Real logic would sum weighted assessments.
            # For now, we'll try to fetch a "Final Generic" assessment or sum up what exists
            
            student_assessments = db.query(StudentAssessment)\
                .join(Assessment)\
                .filter(
                    StudentAssessment.student_id == student_id,
                    Assessment.course_id == course.id
                ).all()
            
            internal = 0.0
            external = 0.0
            total_obtained = 0.0
            max_total = 0.0
            
            for sa in student_assessments:
                if sa.obtained_marks is not None:
                    if sa.assessment.type == "Internal":
                        internal += sa.obtained_marks
                    elif sa.assessment.type == "External":
                        external += sa.obtained_marks
                    total_obtained += sa.obtained_marks
                    max_total += sa.assessment.total_marks

            # If no assessments, use placeholder or 0
            if max_total == 0:
                grade_percentage = 0.0
            else:
                grade_percentage = (total_obtained / max_total) * 100
                
            # Grade Letter (Simple logic)
            if grade_percentage >= 90: grade = "A+"
            elif grade_percentage >= 80: grade = "A"
            elif grade_percentage >= 70: grade = "B"
            elif grade_percentage >= 60: grade = "C"
            elif grade_percentage >= 50: grade = "D"
            else: grade = "F"
            
            # Attendance for this course
            total_classes = db.query(AttendanceRecord)\
                .filter(AttendanceRecord.student_id == student_id, AttendanceRecord.course_id == course.id)\
                .count()
            attended_classes = db.query(AttendanceRecord)\
                .filter(
                    AttendanceRecord.student_id == student_id, 
                    AttendanceRecord.course_id == course.id,
                    AttendanceRecord.status == AttendanceStatus.PRESENT
                ).count()
                
            att_pct = (attended_classes / total_classes * 100) if total_classes > 0 else 0.0

            subjects.append(SubjectPerformance(
                course_id=course.id,
                course_name=course.name,
                credits=course.credits,
                internal_marks=internal,
                external_marks=external,
                total_marks=total_obtained,
                grade=grade,
                attendance_percentage=att_pct
            ))
            
            # GPA Calc helper (simplified)
            points = 0
            if grade == "A+": points = 10
            elif grade == "A": points = 9
            elif grade == "B": points = 8
            elif grade == "C": points = 7
            elif grade == "D": points = 6
            else: points = 0
            
            weighted_grade_points += (points * course.credits)
            total_credits += course.credits

        gpa = (weighted_grade_points / total_credits) if total_credits > 0 else 0.0
        
        response.append(SemesterPerformance(
            semester=sem,
            gpa=round(gpa, 2),
            subjects=subjects
        ))
        
    return response

@router.get("/{student_id}/assignments", response_model=AssignmentProgress)
def get_student_assignments(student_id: str, db: Session = Depends(get_db)):
    """
    Get assignment statistics and list.
    """
    student = get_student_or_404(db, student_id)
    
    # Get all assessments of type Assignment or Project
    # We look for 'StudentAssessment' records to track status
    
    # First find all relevant assessments for enrolled courses
    enrolled_course_ids = [e.course_id for e in student.enrollments]
    
    assessments = db.query(Assessment)\
        .filter(
            Assessment.course_id.in_(enrolled_course_ids),
            Assessment.type.in_(["Assignment", "Project"])
        ).all()
        
    total_assignments = len(assessments)
    completed = 0
    pending = 0
    overdue = 0
    
    assignment_list = []
    
    # Check status for each
    for assess in assessments:
        sa = db.query(StudentAssessment)\
            .filter(StudentAssessment.student_id == student_id, StudentAssessment.assessment_id == assess.id)\
            .first()
            
        is_overdue = assess.due_date and assess.due_date < datetime.utcnow()
        
        # Determine status
        if sa:
            status = sa.status
            submission_date = sa.submission_date
            obtained = sa.obtained_marks
            sa_id = sa.id
        else:
            status = SubmissionStatus.OVERDUE if is_overdue else SubmissionStatus.PENDING
            submission_date = None
            obtained = None
            sa_id = 0 # Placeholder for non-existent record
            
        # Update counts
        if status in [SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED]:
            completed += 1
        elif status == SubmissionStatus.OVERDUE:
            overdue += 1
            pending += 1
        else:
            pending += 1
            
        # Create response object
        # We need to manually construct AssessmentResponse because from_orm might need an object with all fields
        assess_resp = AssessmentResponse(
            id=assess.id,
            course_id=assess.course_id,
            course_name=assess.course.name if assess.course else "Unknown",
            title=assess.title,
            type=assess.type,
            total_marks=assess.total_marks,
            weightage=assess.weightage,
            due_date=assess.due_date
        )
        
        assignment_list.append(StudentAssessmentResponse(
            id=sa_id,
            assessment_id=assess.id,
            assessment=assess_resp,
            obtained_marks=obtained,
            status=status,
            submission_date=submission_date
        ))
            
    completion_pct = (completed / total_assignments * 100) if total_assignments > 0 else 0.0
    
    return AssignmentProgress(
        total=total_assignments,
        completed=completed,
        pending=pending,
        completion_percentage=round(completion_pct, 1),
        overdue_count=overdue,
        assignments=assignment_list
    )


@router.get("/{student_id}/attendance", response_model=List[AttendanceRecordResponse])
def get_student_attendance(student_id: str, db: Session = Depends(get_db)):
    """
    Get all attendance records for the student.
    """
    student = get_student_or_404(db, student_id)
    
    records = db.query(AttendanceRecord)\
        .filter(AttendanceRecord.student_id == student_id)\
        .order_by(desc(AttendanceRecord.date))\
        .all()
        
    response = []
    for record in records:
        course_name = record.course.name if record.course else "Unknown Course"
        response.append(AttendanceRecordResponse(
            id=record.id,
            course_id=record.course_id,
            course_name=course_name,
            date=record.date,
            status=record.status
        ))
        
    return response


@router.get("/{student_id}/risk", response_model=Optional[RiskScoreWithExplanation])
def get_student_risk(student_id: str, db: Session = Depends(get_db)):
    """
    Get detailed risk analysis for the student.
    """
    student = get_student_or_404(db, student_id)
    
    risk = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
    
    if not risk:
        return None
        
    # Parse SHAP explanation if stored as JSON
    explanation = None
    if risk.shap_explanation:
        shaps = risk.shap_explanation.get('top_factors', [])
        # Ensure correct structure of SHAP factors
        try:
             factors = [
                SHAPFactor(feature=f['feature'], impact=f['impact'], direction=f['direction']) 
                for f in shaps
            ]
             explanation = RiskExplanation(
                risk_score=risk.risk_score,
                risk_level=risk.risk_level,
                top_factors=factors
            )
        except Exception as e:
            # Fallback if structure doesn't match
            pass
    
    return RiskScoreWithExplanation(
        id=risk.id,
        student_id=risk.student_id,
        model_version_id=risk.model_version_id,
        risk_score=risk.risk_score,
        risk_level=risk.risk_level,
        risk_trend=risk.risk_trend,
        risk_value=risk.risk_value,
        shap_explanation=risk.shap_explanation,
        predicted_at=risk.predicted_at,
        updated_at=risk.updated_at,
        explanation=explanation
    )
