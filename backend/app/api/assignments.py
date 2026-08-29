"""
Assignments API — /api/v1/assignments/...

Faculty:
  GET  /faculty        → List all assignments for faculty's courses with submission stats
  POST /               → Create a new assignment for a course
  GET  /{id}/submissions → All student submissions for an assignment
  POST /{id}/grade     → Grade a submission (set marks + feedback)

Student:
  GET  /student        → List all assignments for enrolled courses + student's submission status
  POST /{id}/submit    → Mark assignment as submitted

Auth: JWT required for all endpoints.
"""
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.auth.security import get_current_user
from app.models.user import User
from app.models.enums import Role, AssessmentType, SubmissionStatus
from app.models.academic import Course, Enrollment, Assessment
from app.models.records import StudentAssessment
from app.models.student import Student

router = APIRouter(prefix="/assignments", tags=["Assignments"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CreateAssignmentBody(BaseModel):
    course_id: str
    title: str
    total_marks: float
    weightage: float = 10.0
    due_date: Optional[str] = None  # ISO date string


class GradeSubmissionBody(BaseModel):
    student_id: str
    obtained_marks: float
    feedback: Optional[str] = None


class SubmitAssignmentBody(BaseModel):
    notes: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_or_404(db: Session, model, pk, label="Record"):
    obj = db.query(model).filter(model.id == pk).first()
    if not obj:
        raise HTTPException(status_code=404, detail=f"{label} not found")
    return obj


def _serialize_assessment(assess: Assessment, course: Course) -> dict:
    return {
        "id": assess.id,
        "course_id": course.id,
        "course_name": course.name,
        "title": assess.title,
        "total_marks": assess.total_marks,
        "due_date": assess.due_date.isoformat() if assess.due_date else None,
        "type": assess.type.value,
    }


# ── Faculty Endpoints ─────────────────────────────────────────────────────────

@router.get("/faculty")
def get_faculty_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all assignments across faculty's courses with submission statistics."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get all courses (for now all courses — in production scope to faculty's courses)
    assessments = (
        db.query(Assessment, Course)
        .join(Course, Assessment.course_id == Course.id)
        .filter(Assessment.type == AssessmentType.ASSIGNMENT)
        .all()
    )

    results = []
    for assess, course in assessments:
        # Count enrolled students in this course
        total_students = db.query(func.count(Enrollment.id)).filter(
            Enrollment.course_id == course.id
        ).scalar() or 0

        # Count submissions
        submitted = db.query(func.count(StudentAssessment.id)).filter(
            StudentAssessment.assessment_id == assess.id,
            StudentAssessment.status.in_([SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED]),
        ).scalar() or 0

        graded = db.query(func.count(StudentAssessment.id)).filter(
            StudentAssessment.assessment_id == assess.id,
            StudentAssessment.status == SubmissionStatus.GRADED,
        ).scalar() or 0

        avg_row = db.query(func.avg(StudentAssessment.obtained_marks)).filter(
            StudentAssessment.assessment_id == assess.id,
            StudentAssessment.obtained_marks.isnot(None),
        ).scalar()

        now = datetime.now(timezone.utc)
        if assess.due_date:
            due_date = assess.due_date.replace(tzinfo=timezone.utc) if assess.due_date.tzinfo is None else assess.due_date
            is_closed = due_date < now
        else:
            is_closed = False
        status = "Closed" if is_closed else "Active"

        results.append({
            "id": assess.id,
            "title": assess.title,
            "course": course.id,
            "course_name": course.name,
            "dueDate": assess.due_date.strftime("%Y-%m-%d") if assess.due_date else "No deadline",
            "totalStudents": total_students,
            "submitted": submitted,
            "late": 0,  # TODO: late tracking
            "missing": max(0, total_students - submitted),
            "status": status,
            "maxMarks": assess.total_marks,
            "avgMarks": round(avg_row, 1) if avg_row else None,
            "completion": round(submitted / total_students * 100) if total_students > 0 else 0,
        })

    return results


@router.post("")
def create_assignment(
    body: CreateAssignmentBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new assignment for a course."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Verify course exists
    course = db.query(Course).filter(Course.id == body.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    due_dt = None
    if body.due_date:
        try:
            due_dt = datetime.fromisoformat(body.due_date.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid due_date format")

    assessment = Assessment(
        course_id=body.course_id,
        title=body.title,
        type=AssessmentType.ASSIGNMENT,
        total_marks=body.total_marks,
        weightage=body.weightage,
        due_date=due_dt,
    )
    db.add(assessment)
    db.flush()

    # Create pending StudentAssessment records for all enrolled students
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == body.course_id).all()
    for enr in enrollments:
        sa = StudentAssessment(
            student_id=enr.student_id,
            assessment_id=assessment.id,
            status=SubmissionStatus.PENDING,
        )
        db.add(sa)

    db.commit()
    db.refresh(assessment)
    return {"id": assessment.id, "message": "Assignment created", "enrolled_count": len(enrollments)}


@router.get("/{assignment_id}/submissions")
def get_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all student submissions for an assignment."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    assess = _get_or_404(db, Assessment, assignment_id, "Assignment")
    rows = (
        db.query(StudentAssessment, Student)
        .join(Student, StudentAssessment.student_id == Student.id)
        .filter(StudentAssessment.assessment_id == assignment_id)
        .all()
    )
    return [
        {
            "student_id": student.id,
            "student_name": student.name,
            "status": sa.status.value if sa.status else "Pending",
            "obtained_marks": sa.obtained_marks,
            "submission_date": sa.submission_date.isoformat() if sa.submission_date else None,
        }
        for sa, student in rows
    ]


@router.post("/{assignment_id}/grade")
def grade_submission(
    assignment_id: int,
    body: GradeSubmissionBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Grade a student's submission for an assignment."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    assess = _get_or_404(db, Assessment, assignment_id, "Assignment")

    sa = db.query(StudentAssessment).filter(
        StudentAssessment.assessment_id == assignment_id,
        StudentAssessment.student_id == body.student_id,
    ).first()

    if not sa:
        sa = StudentAssessment(
            student_id=body.student_id,
            assessment_id=assignment_id,
        )
        db.add(sa)

    sa.obtained_marks = body.obtained_marks
    sa.status = SubmissionStatus.GRADED
    db.commit()

    return {"message": "Graded successfully", "student_id": body.student_id, "marks": body.obtained_marks}


# ── Student Endpoints ─────────────────────────────────────────────────────────

@router.get("/student")
def get_student_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all assignments for the authenticated student from their enrolled courses."""
    if current_user.role != Role.STUDENT:
        raise HTTPException(status_code=403, detail="Not authorized")

    student = db.query(Student).filter(Student.id == current_user.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    # Get all student assessments joined with assessment and course
    rows = (
        db.query(StudentAssessment, Assessment, Course)
        .join(Assessment, StudentAssessment.assessment_id == Assessment.id)
        .join(Course, Assessment.course_id == Course.id)
        .filter(StudentAssessment.student_id == student.id)
        .all()
    )

    assignments = []
    for sa, assess, course in rows:
        assignments.append({
            "id": sa.id,
            "assessment_id": assess.id,
            "assessment": _serialize_assessment(assess, course),
            "obtained_marks": sa.obtained_marks,
            "status": sa.status.value if sa.status else "Pending",
            "submission_date": sa.submission_date.isoformat() if sa.submission_date else None,
            "rubric": {
                "writing": sa.writing_marks,
                "understanding": sa.understanding_marks,
                "learning": sa.learning_marks,
                "application": sa.application_marks,
                "knowledge": sa.knowledge_marks,
            } if sa.writing_marks is not None else None,
            "graded_at": sa.graded_at.isoformat() if sa.graded_at else None,
        })

    total = len(assignments)
    completed = sum(1 for a in assignments if a["status"] in ("Submitted", "Graded"))
    overdue = sum(1 for a in assignments if a["status"] == "Overdue")
    pending = total - completed - overdue

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "overdue": overdue,
        "completion_percentage": round(completed / total * 100, 1) if total else 0,
        "overdue_count": overdue,
        "assignments": assignments,
    }


from app.websocket.manager import manager

@router.post("/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    body: SubmitAssignmentBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Student submits an assignment."""
    if current_user.role != Role.STUDENT:
        raise HTTPException(status_code=403, detail="Not authorized")

    student = db.query(Student).filter(Student.id == current_user.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    sa = db.query(StudentAssessment).filter(
        StudentAssessment.assessment_id == assignment_id,
        StudentAssessment.student_id == student.id,
    ).first()

    if not sa:
        raise HTTPException(status_code=404, detail="Assignment not found for this student")

    if sa.status == SubmissionStatus.GRADED:
        raise HTTPException(status_code=400, detail="Assignment already graded")

    sa.status = SubmissionStatus.SUBMITTED
    sa.submission_date = datetime.now(timezone.utc)
    db.commit()

    # Broadcast notification to Faculty/Dashboard channels
    await manager.broadcast_multiple(["notifications", "dashboard"], {
        "type": "assessment_submitted",
        "assignment_id": assignment_id,
        "student_id": student.id,
        "student_name": student.name,
        "message": f"{student.name} submitted an assignment."
    })

    return {"message": "Submitted successfully", "assignment_id": assignment_id}

