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
