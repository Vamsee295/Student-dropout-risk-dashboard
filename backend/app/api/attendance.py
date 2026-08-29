"""
Attendance API Router — Unified attendance endpoints for both Faculty and Student.

Architecture:
    Faculty: marks attendance → persisted to MySQL
    Student: reads attendance ← same MySQL records

LATE status has been completely removed. Only PRESENT and ABSENT are valid.
"""
from datetime import datetime, timedelta, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

from app.database.session import get_db
from app.auth.security import get_current_user
from app.models.user import User
from app.models.enums import Role, AttendanceStatus
from app.models.records import AttendanceRecord
from app.models.student import Student, StudentMetric
from app.schemas.attendance_schema import (
    AttendanceUpdatePayload,
    FacultyAttendanceStats,
    FacultyGridRow,
    FacultyCourseItem,
    StudentAttendanceSummary,
    StudentCalendarResponse,
    AttendanceSessionSummary,
    SessionRosterResponse,
    PostAttendancePayload,
)
from app.services.attendance_service import attendance_service

router = APIRouter()


# ──────────────────────────────────────────────────────────────────────────────
# FACULTY ENDPOINTS
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/faculty/courses", response_model=List[FacultyCourseItem])
def get_faculty_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return all courses available for attendance marking."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")
    return attendance_service.get_faculty_courses(db, current_user)


@router.get("/faculty/sessions", response_model=List[AttendanceSessionSummary])
def get_faculty_sessions(
    course_id: Optional[str] = Query(None, description="Filter by course ID"),
    section: Optional[str] = Query(None, description="Filter by section name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List attendance sessions for faculty, optionally filtered by course/section."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")
    return attendance_service.get_attendance_sessions(db, current_user, course_id, section)


@router.get("/faculty/sessions/{session_id}/roster", response_model=SessionRosterResponse)
def get_session_roster(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get student roster for a session. Students without a record shown as Present (unchecked)."""
    return attendance_service.get_session_roster(db, session_id, current_user)


@router.post("/faculty/sessions/{session_id}/post")
async def post_session_attendance(
    session_id: int,
    payload: PostAttendancePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Post/update attendance for a session.
    All enrolled students receive PRESENT or ABSENT.
    Absent list comes from payload.absent_student_ids.
    Updates session status to COMPLETED.
    """
    result = attendance_service.post_session_attendance(
        db, session_id, payload.absent_student_ids, current_user
    )
    # Broadcast WebSocket update directly on the async event loop
    try:
        from app.websocket.manager import manager
        event = {
            "type": "attendance_posted",
            "session_id": session_id,
            "present_count": result.get("present_count", 0),
            "absent_count": result.get("absent_count", 0),
        }
        await manager.broadcast("dashboard", event)
        await manager.broadcast("notifications", event)
    except Exception as e:
        print(f"WS Broadcast error: {e}")
    return result



@router.get("/faculty/stats", response_model=FacultyAttendanceStats)
def get_faculty_stats(
    course_id: str = Query(..., description="Course ID e.g. CS101"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dynamic stats (present today, absent today, below 75%, overall avg) for a course."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")
    return attendance_service.get_faculty_stats(db, course_id)


@router.get("/faculty/grid", response_model=List[FacultyGridRow])
def get_faculty_grid(
    course_id: str = Query(..., description="Course ID"),
    week_offset: int = Query(0, description="0 = current week, -1 = last week"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mon-Fri attendance grid for all students enrolled in a course."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")
    return attendance_service.get_faculty_grid(db, course_id, week_offset)


@router.put("/record")
def update_attendance(
    payload: AttendanceUpdatePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create or update an attendance record.
    Only PRESENT or ABSENT are accepted — LATE is rejected.
    Faculty identity comes from JWT.
    """
    record = attendance_service.mark_or_update_attendance(db, payload, current_user)
    return {
        "id": record.id,
        "student_id": record.student_id,
        "course_id": record.course_id,
        "date": record.date.date().isoformat(),
        "status": record.status.value[0],  # "P" or "A"
        "status_full": record.status.value,
        "marked_by": record.marked_by,
    }


@router.post("/toggle")
def toggle_attendance(
    student_id: str = Query(...),
    course_id: str = Query(...),
    attendance_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Toggle attendance P ↔ A for a student on a given date.
    Called when faculty clicks a cell in the attendance grid.
    Persists to MySQL and returns the new status.
    """
    return attendance_service.toggle_attendance(db, student_id, course_id, attendance_date, current_user)


# ──────────────────────────────────────────────────────────────────────────────
# STUDENT ENDPOINTS
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/student", response_model=StudentAttendanceSummary)
def get_student_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Return the authenticated student's complete attendance summary.
    Student identity comes ONLY from the JWT — cannot be overridden by the client.
    All values are dynamically calculated from AttendanceRecord in MySQL.
    """
    return attendance_service.get_student_summary(db, current_user)


@router.get("/student/calendar", response_model=StudentCalendarResponse)
def get_student_calendar(
    course_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Return the authenticated student's attendance calendar for a specific course.
    Groups actual attendance records into Mon-Fri weeks.
    Calendar is ALWAYS consistent with the student summary endpoint.
    """
    return attendance_service.get_student_calendar(db, current_user, course_id)


# ──────────────────────────────────────────────────────────────────────────────
# LEGACY ENDPOINTS (used by existing faculty dashboard/hooks)
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/weekly")
def get_weekly_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """7-day attendance trend for the weekly overview chart."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")
    return attendance_service.get_weekly_overview(db)


@router.get("/below-threshold")
def get_below_threshold(
    course_id: Optional[str] = Query(None, description="Course ID to filter by"),
    threshold: float = 75.0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Students with attendance below threshold (dynamically calculated)."""
    return attendance_service.get_below_threshold_students(db, threshold, course_id)

@router.get("/faculty/below-threshold")
def get_faculty_below_threshold(
    course_id: Optional[str] = Query(None, description="Course ID to filter by"),
    threshold: float = 75.0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Students with attendance below threshold for the faculty dashboard."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")
    return attendance_service.get_below_threshold_students(db, threshold, course_id)


@router.get("/grid")
def get_attendance_grid(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Legacy grid endpoint — returns first course's grid for backward compat."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.models.academic import Course
    first_course = db.query(Course).first()
    if not first_course:
        return []
    rows = attendance_service.get_faculty_grid(db, first_course.id)
    # Convert to legacy format for the old hook
    result = []
    for row in rows:
        r = {"id": row.student_id, "name": row.student_name, "roll": row.roll}
        for cell in row.cells:
            r[cell.day_label.lower()] = cell.status
        result.append(r)
    return result
