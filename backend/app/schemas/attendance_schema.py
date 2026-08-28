"""
Attendance Schemas — Pydantic models for attendance API.
Supports ONLY PRESENT / ABSENT — LATE has been completely removed.
"""
from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import List, Optional, Literal


AttendanceStatusLiteral = Literal["PRESENT", "ABSENT"]


class AttendanceUpdatePayload(BaseModel):
    student_id: str
    course_id: str
    date: date
    status: AttendanceStatusLiteral

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ("PRESENT", "ABSENT"):
            raise ValueError("Status must be PRESENT or ABSENT")
        return v


class AttendanceRecordResponse(BaseModel):
    id: int
    student_id: str
    course_id: str
    date: str
    status: str
    marked_by: Optional[int]
    updated_at: str

    model_config = {"from_attributes": True}


# ── Faculty ───────────────────────────────────────────────────────────────────

class FacultyGridCell(BaseModel):
    date: str          # ISO date string
    day_label: str     # "Mon", "Tue", etc.
    status: str        # "P", "A", or "" (no record)


class FacultyGridRow(BaseModel):
    student_id: str
    student_name: str
    roll: str
    cells: List[FacultyGridCell]


class FacultyAttendanceStats(BaseModel):
    present_today: int
    absent_today: int
    total_today: int
    below_75_count: int
    overall_avg: float


class FacultyCourseItem(BaseModel):
    id: str
    name: str
    display: str       # "CS301 – DBMS"


# ── Student ───────────────────────────────────────────────────────────────────

class StudentSubjectAttendance(BaseModel):
    course_id: str
    course_name: str
    faculty_name: str
    present: int
    total: int
    percentage: float
    is_below_75: bool
    is_borderline: bool    # 75% <= pct < 80%


class AttendanceWarning(BaseModel):
    course_id: str
    course_name: str
    present: int
    total: int
    percentage: float
    consecutive_needed: int


class CalendarCell(BaseModel):
    date: str        # ISO date
    day_label: str   # Mon/Tue/Wed...
    status: str      # "P" or "A"


class CalendarWeek(BaseModel):
    week_label: str  # "W1", "W2"...
    cells: List[CalendarCell]


class StudentAttendanceSummary(BaseModel):
    overall_percentage: float
    total_present: int
    total_classes: int
    below_75_count: int
    borderline_count: int
    subjects: List[StudentSubjectAttendance]
    warnings: List[AttendanceWarning]
    monthly_trend: List[dict]


class StudentCalendarResponse(BaseModel):
    course_id: str
    course_name: str
    weeks: List[CalendarWeek]


# ── Attendance Session (new session-based workflow) ───────────────────────────

class AttendanceSessionSummary(BaseModel):
    """Compact session info for the session list/cards view."""
    id: int
    course_id: str
    course_name: str
    section: str
    session_type: str              # "Lecture", "Practical", "Tutorial"
    session_label: str             # "Lecture 1", "Practical", etc.
    session_date: str              # ISO date "2026-08-21"
    start_time: Optional[str]      # "09:00" or None
    end_time: Optional[str]        # "10:00" or None
    status: str                    # "PENDING" or "COMPLETED"
    faculty_name: Optional[str]

    # Completion stats (only meaningful when status == "COMPLETED")
    total_students: int
    present_count: int
    absent_count: int

    model_config = {"from_attributes": True}


class SessionRosterStudent(BaseModel):
    """A student's row in the attendance roster for a session."""
    student_id: str
    name: str
    roll: str
    section: str
    is_absent: bool  # True = marked Absent in this session, False = Present


class SessionRosterResponse(BaseModel):
    """Full roster for a session: session header + student rows."""
    session_id: int
    course_id: str
    course_name: str
    section: str
    session_type: str
    session_label: str
    session_date: str
    status: str
    students: List[SessionRosterStudent]
    total_students: int
    present_count: int
    absent_count: int


class PostAttendancePayload(BaseModel):
    """Payload to post/update attendance for a session.
    
    absent_student_ids: list of student IDs who are ABSENT.
    All other enrolled students in this session are saved as PRESENT.
    """
    absent_student_ids: List[str]

