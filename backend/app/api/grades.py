"""
Grades / Assessments API — /api/v1/grades/...

Faculty:
  GET  /faculty/exams             → All assessments (non-assignment) for faculty
  GET  /faculty/exams/{id}/stats  → Distribution stats for a single assessment
  POST /faculty/exams             → Create an exam record
  GET  /faculty/exams/{id}/submissions → All submissions for an assessment
  POST /faculty/exams/{id}/grade-student → Grade a specific student using rubric

Student:
  GET  /student/performance       → Semester performance: all assessed items
  GET  /student/gpa               → GPA overview, topper comparison
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
from app.websocket.manager import manager

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class CreateExamBody(BaseModel):
    course_id: str
    title: str
    type: str = "INTERNAL"        # INTERNAL, EXTERNAL, LAB, PRACTICAL
    total_marks: float = 50.0
    weightage: float = 20.0
    exam_date: Optional[str] = None


class GradeStudentRubricBody(BaseModel):
    student_id: str
    writing_marks: float
    understanding_marks: float
    learning_marks: float
    application_marks: float
    knowledge_marks: float



# ── Helpers ───────────────────────────────────────────────────────────────────

def _type_to_enum(t: str) -> AssessmentType:
    mapping = {
        "INTERNAL": AssessmentType.INTERNAL,
        "EXTERNAL": AssessmentType.EXTERNAL,
        "LAB": AssessmentType.LAB,
        "PRACTICAL": AssessmentType.PRACTICAL,
        "ASSIGNMENT": AssessmentType.ASSIGNMENT,
    }
    return mapping.get(t.upper(), AssessmentType.INTERNAL)


# ── Faculty Endpoints ─────────────────────────────────────────────────────────

@router.get("/faculty/exams")
def get_faculty_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """All assessments (exams, internals, practicals — not assignments)."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    rows = (
        db.query(Assessment, Course)
        .join(Course, Assessment.course_id == Course.id)
        .filter(Assessment.type != AssessmentType.ASSIGNMENT)
        .all()
    )

    result = []
    for assess, course in rows:
        total_students = db.query(func.count(Enrollment.id)).filter(
            Enrollment.course_id == course.id
        ).scalar() or 0

        graded = db.query(func.count(StudentAssessment.id)).filter(
            StudentAssessment.assessment_id == assess.id,
            StudentAssessment.obtained_marks.isnot(None),
        ).scalar() or 0

        avg_row = db.query(func.avg(StudentAssessment.obtained_marks)).filter(
            StudentAssessment.assessment_id == assess.id,
            StudentAssessment.obtained_marks.isnot(None),
        ).scalar()
        max_row = db.query(func.max(StudentAssessment.obtained_marks)).filter(
            StudentAssessment.assessment_id == assess.id,
        ).scalar()
        min_row = db.query(func.min(StudentAssessment.obtained_marks)).filter(
            StudentAssessment.assessment_id == assess.id,
            StudentAssessment.obtained_marks.isnot(None),
        ).scalar()

        pass_rate = 0
        if avg_row and assess.total_marks:
            passing_marks = assess.total_marks * 0.4  # 40% pass mark
            pass_count = db.query(func.count(StudentAssessment.id)).filter(
                StudentAssessment.assessment_id == assess.id,
                StudentAssessment.obtained_marks >= passing_marks,
            ).scalar() or 0
            pass_rate = round(pass_count / total_students * 100) if total_students else 0

        status = "Pending Evaluation" if graded == 0 else "Published"

        result.append({
            "id": assess.id,
            "title": assess.title,
            "course": course.id,
            "type": assess.type.value,
            "date": assess.due_date.strftime("%Y-%m-%d") if assess.due_date else "TBD",
            "totalMarks": assess.total_marks,
            "avgMarks": round(avg_row, 1) if avg_row else 0,
            "highestMarks": round(max_row, 1) if max_row else 0,
            "lowestMarks": round(min_row, 1) if min_row else 0,
            "passRate": pass_rate,
            "status": status,
            "totalStudents": total_students,
            "graded": graded,
        })

    return result


@router.get("/faculty/exams/{exam_id}/stats")
def get_exam_stats(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Grade distribution stats for a single assessment (for bar chart)."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    assess = db.query(Assessment).filter(Assessment.id == exam_id).first()
    if not assess:
        raise HTTPException(status_code=404, detail="Assessment not found")

    total = assess.total_marks
    buckets = 5
    step = total / buckets

    distribution = []
    for i in range(buckets):
        low = i * step
        high = (i + 1) * step
        count = db.query(func.count(StudentAssessment.id)).filter(
            StudentAssessment.assessment_id == exam_id,
            StudentAssessment.obtained_marks >= low,
            StudentAssessment.obtained_marks < high,
        ).scalar() or 0
        distribution.append({
            "range": f"{int(low)}-{int(high)}",
            "count": count,
        })

    return distribution


@router.post("/faculty/exams")
def create_exam(
    body: CreateExamBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new exam/assessment for a course."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    course = db.query(Course).filter(Course.id == body.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    due_dt = None
    if body.exam_date:
        try:
            due_dt = datetime.fromisoformat(body.exam_date.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid exam_date format")

    assessment = Assessment(
        course_id=body.course_id,
        title=body.title,
        type=_type_to_enum(body.type),
        total_marks=body.total_marks,
        weightage=body.weightage,
        due_date=due_dt,
    )
    db.add(assessment)
    db.flush()

    # Create pending StudentAssessment records
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
    return {"id": assessment.id, "message": "Exam created", "enrolled_count": len(enrollments)}



@router.get("/faculty/exams/{exam_id}/submissions")
def get_exam_submissions(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all student submissions/grades for a specific exam/assessment."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    rows = (
        db.query(StudentAssessment, Student)
        .join(Student, StudentAssessment.student_id == Student.id)
        .filter(StudentAssessment.assessment_id == exam_id)
        .all()
    )

    return [
        {
            "student_id": student.id,
            "student_name": student.name,
            "status": sa.status.value if sa.status else "Pending",
            "obtained_marks": sa.obtained_marks,
            "writing_marks": sa.writing_marks,
            "understanding_marks": sa.understanding_marks,
            "learning_marks": sa.learning_marks,
            "application_marks": sa.application_marks,
            "knowledge_marks": sa.knowledge_marks,
            "submission_date": sa.submission_date.isoformat() if sa.submission_date else None,
            "graded_at": sa.graded_at.isoformat() if sa.graded_at else None,
        }
        for sa, student in rows
    ]


@router.post("/faculty/exams/{exam_id}/grade-student")
async def grade_student_rubric(
    exam_id: int,
    body: GradeStudentRubricBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Grade a student using the 5x10 rubric and broadcast notification."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Validate marks (0-10)
    for m in [body.writing_marks, body.understanding_marks, body.learning_marks, body.application_marks, body.knowledge_marks]:
        if not (0 <= m <= 10):
            raise HTTPException(status_code=400, detail="Rubric marks must be between 0 and 10")

    total_obtained = sum([
        body.writing_marks, body.understanding_marks, body.learning_marks, 
        body.application_marks, body.knowledge_marks
    ])

    sa = db.query(StudentAssessment).filter(
        StudentAssessment.assessment_id == exam_id,
        StudentAssessment.student_id == body.student_id,
    ).first()

    if sa:
        sa.writing_marks = body.writing_marks
        sa.understanding_marks = body.understanding_marks
        sa.learning_marks = body.learning_marks
        sa.application_marks = body.application_marks
        sa.knowledge_marks = body.knowledge_marks
        sa.obtained_marks = total_obtained
        sa.status = SubmissionStatus.GRADED
        sa.graded_by = current_user.id
        sa.graded_at = datetime.now(timezone.utc)
    else:
        sa = StudentAssessment(
            student_id=body.student_id,
            assessment_id=exam_id,
            writing_marks=body.writing_marks,
            understanding_marks=body.understanding_marks,
            learning_marks=body.learning_marks,
            application_marks=body.application_marks,
            knowledge_marks=body.knowledge_marks,
            obtained_marks=total_obtained,
            status=SubmissionStatus.GRADED,
            graded_by=current_user.id,
            graded_at=datetime.now(timezone.utc)
        )
        db.add(sa)

    db.commit()

    # Broadcast notification to Student
    await manager.broadcast(f"student_{body.student_id}", {
        "type": "assessment_graded",
        "assessment_id": exam_id,
        "obtained_marks": total_obtained,
        "message": f"Your assessment has been graded."
    })
    
    # Broadcast to dashboard
    await manager.broadcast("dashboard", {
        "type": "assessment_graded_event",
        "assessment_id": exam_id,
        "student_id": body.student_id
    })

    return {"message": "Student graded successfully", "total_marks": total_obtained}



# ── Student Endpoints ─────────────────────────────────────────────────────────

@router.get("/student/performance")
def get_student_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Semester performance for the authenticated student."""
    if current_user.role != Role.STUDENT:
        raise HTTPException(status_code=403, detail="Not authorized")

    student = db.query(Student).filter(Student.id == current_user.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    rows = (
        db.query(StudentAssessment, Assessment, Course)
        .join(Assessment, StudentAssessment.assessment_id == Assessment.id)
        .join(Course, Assessment.course_id == Course.id)
        .filter(StudentAssessment.student_id == student.id)
        .filter(StudentAssessment.obtained_marks.isnot(None))
        .all()
    )

    items = []
    for sa, assess, course in rows:
        pct = round(sa.obtained_marks / assess.total_marks * 100, 1) if assess.total_marks else 0
        items.append({
            "id": sa.id,
            "course_id": course.id,
            "course_name": course.name,
            "assessment_title": assess.title,
            "assessment_type": assess.type.value,
            "obtained_marks": sa.obtained_marks,
            "total_marks": assess.total_marks,
            "percentage": pct,
            "rubric": {
                "writing": sa.writing_marks,
                "understanding": sa.understanding_marks,
                "learning": sa.learning_marks,
                "application": sa.application_marks,
                "knowledge": sa.knowledge_marks,
            } if sa.writing_marks is not None else None,
            "graded_at": sa.graded_at.isoformat() if sa.graded_at else None,
        })


    total_obtained = sum(i["obtained_marks"] for i in items)
    total_possible = sum(i["total_marks"] for i in items)
    overall_pct = round(total_obtained / total_possible * 100, 1) if total_possible else 0

    # Group by course
    by_course: dict = {}
    for item in items:
        cid = item["course_id"]
        if cid not in by_course:
            by_course[cid] = {"course_id": cid, "course_name": item["course_name"], "assessments": [], "avg_percentage": 0}
        by_course[cid]["assessments"].append(item)

    for cid in by_course:
        percs = [a["percentage"] for a in by_course[cid]["assessments"]]
        by_course[cid]["avg_percentage"] = round(sum(percs) / len(percs), 1) if percs else 0

    return {
        "overall_percentage": overall_pct,
        "total_assessments": len(items),
        "courses": list(by_course.values()),
        "items": items,
    }
