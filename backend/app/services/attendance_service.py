"""
Attendance Service — All business logic for the attendance domain.

Architecture:
    Faculty UI → API router → AttendanceService → MySQL
    Student UI ← API router ← AttendanceService ← MySQL

Both portals read from the SAME AttendanceRecord table.
LATE has been completely removed — only PRESENT and ABSENT exist.
"""
from datetime import datetime, timedelta, timezone, date
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.records import AttendanceRecord
from app.models.academic import Course, Enrollment
from app.models.student import Student
from app.models.user import User
from app.models.enums import AttendanceStatus, Role
from app.schemas.attendance_schema import (
    FacultyGridRow, FacultyGridCell, FacultyAttendanceStats, FacultyCourseItem,
    StudentSubjectAttendance, AttendanceWarning, CalendarCell, CalendarWeek,
    StudentAttendanceSummary, StudentCalendarResponse, AttendanceUpdatePayload
)

DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
THRESHOLD = 75.0
BORDERLINE_UPPER = 80.0


def _classes_needed(present: int, total: int, target: float = 0.75) -> int:
    """How many consecutive PRESENT classes needed to reach target %."""
    if total == 0:
        return 0
    if present / total >= target:
        return 0
    n = 0
    while (present + n) / (total + n) < target:
        n += 1
    return n


def _status_char(status: Optional[AttendanceStatus]) -> str:
    if status == AttendanceStatus.PRESENT:
        return "P"
    if status == AttendanceStatus.ABSENT:
        return "A"
    return ""


class AttendanceService:

    # ── Faculty helpers ────────────────────────────────────────────────────────

    def get_faculty_courses(self, db: Session, current_user: User) -> List[FacultyCourseItem]:
        """Return all courses (faculty can mark any course in MVP)."""
        courses = db.query(Course).all()
        return [
            FacultyCourseItem(
                id=c.id,
                name=c.name,
                display=f"{c.id} – {c.name}"
            )
            for c in courses
        ]

    def get_faculty_grid(
        self, db: Session, course_id: str, week_offset: int = 0
    ) -> List[FacultyGridRow]:
        """
        Return a Mon-Fri grid of attendance for all students enrolled in course_id.
        week_offset=0 = current week, week_offset=-1 = last week, etc.
        """
        today = datetime.utcnow().date()
        # Find Monday of the requested week
        monday = today - timedelta(days=today.weekday()) + timedelta(weeks=week_offset)
        week_dates = [monday + timedelta(days=i) for i in range(5)]  # Mon-Fri

        enrollments = (
            db.query(Enrollment)
            .filter(Enrollment.course_id == course_id)
            .all()
        )

        rows: List[FacultyGridRow] = []
        for enr in enrollments:
            student = db.query(Student).filter(Student.id == enr.student_id).first()
            if not student:
                continue

            cells: List[FacultyGridCell] = []
            for day_date in week_dates:
                record = (
                    db.query(AttendanceRecord)
                    .filter(
                        AttendanceRecord.student_id == enr.student_id,
                        AttendanceRecord.course_id == course_id,
                        func.date(AttendanceRecord.date) == day_date,
                    )
                    .first()
                )
                cells.append(FacultyGridCell(
                    date=day_date.isoformat(),
                    day_label=DAY_LABELS[day_date.weekday()],
                    status=_status_char(record.status if record else None),
                ))

            rows.append(FacultyGridRow(
                student_id=student.id,
                student_name=student.name,
                roll=student.id,
                cells=cells,
            ))

        return rows

    def get_faculty_stats(self, db: Session, course_id: str) -> FacultyAttendanceStats:
        """Dynamic stats for a given course: present/absent today, below 75%, overall avg."""
        today = datetime.utcnow().date()

        # Today's counts
        present_today = (
            db.query(func.count(AttendanceRecord.id))
            .filter(
                AttendanceRecord.course_id == course_id,
                func.date(AttendanceRecord.date) == today,
                AttendanceRecord.status == AttendanceStatus.PRESENT,
            )
            .scalar() or 0
        )
        total_today = (
            db.query(func.count(AttendanceRecord.id))
            .filter(
                AttendanceRecord.course_id == course_id,
                func.date(AttendanceRecord.date) == today,
            )
            .scalar() or 0
        )
        absent_today = total_today - present_today

        # Per-student overall attendance for this course
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
        pcts = []
        below_75_count = 0
        for enr in enrollments:
            total = db.query(func.count(AttendanceRecord.id)).filter(
                AttendanceRecord.student_id == enr.student_id,
                AttendanceRecord.course_id == course_id,
            ).scalar() or 0
            present = db.query(func.count(AttendanceRecord.id)).filter(
                AttendanceRecord.student_id == enr.student_id,
                AttendanceRecord.course_id == course_id,
                AttendanceRecord.status == AttendanceStatus.PRESENT,
            ).scalar() or 0
            if total > 0:
                pct = present / total * 100
                pcts.append(pct)
                if pct < THRESHOLD:
                    below_75_count += 1

        overall_avg = round(sum(pcts) / len(pcts), 1) if pcts else 0.0

        return FacultyAttendanceStats(
            present_today=present_today,
            absent_today=absent_today,
            total_today=total_today,
            below_75_count=below_75_count,
            overall_avg=overall_avg,
        )

    def mark_or_update_attendance(
        self,
        db: Session,
        payload: AttendanceUpdatePayload,
        current_user: User,
    ) -> AttendanceRecord:
        """
        Create or update a single attendance record.
        Faculty identity comes from JWT — not from the request body.
        """
        if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
            raise HTTPException(status_code=403, detail="Only faculty can mark attendance")

        # Ensure course exists
        course = db.query(Course).filter(Course.id == payload.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail=f"Course {payload.course_id} not found")

        # Ensure student exists
        student = db.query(Student).filter(Student.id == payload.student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail=f"Student {payload.student_id} not found")

        # Normalize date to midnight
        record_date = datetime.combine(payload.date, datetime.min.time())

        # Map string to enum
        status_enum = AttendanceStatus.PRESENT if payload.status == "PRESENT" else AttendanceStatus.ABSENT

        # Upsert
        record = (
            db.query(AttendanceRecord)
            .filter(
                AttendanceRecord.student_id == payload.student_id,
                AttendanceRecord.course_id == payload.course_id,
                func.date(AttendanceRecord.date) == payload.date,
            )
            .first()
        )

        if record:
            record.status = status_enum
            record.marked_by = current_user.id
            record.updated_at = datetime.now(timezone.utc)
        else:
            record = AttendanceRecord(
                student_id=payload.student_id,
                course_id=payload.course_id,
                date=record_date,
                status=status_enum,
                marked_by=current_user.id,
            )
            db.add(record)

        db.commit()

        # Update student metric
        from app.models.student import StudentMetric
        tot = db.query(func.count(AttendanceRecord.id)).filter(AttendanceRecord.student_id == payload.student_id).scalar() or 0
        prs = db.query(func.count(AttendanceRecord.id)).filter(
            AttendanceRecord.student_id == payload.student_id,
            AttendanceRecord.status == AttendanceStatus.PRESENT
        ).scalar() or 0
        rate = round(prs / tot * 100, 1) if tot > 0 else 0.0
        
        metric = db.query(StudentMetric).filter(StudentMetric.student_id == payload.student_id).first()
        if metric:
            metric.attendance_rate = rate
            metric.updated_at = datetime.now(timezone.utc)
        else:
            db.add(StudentMetric(
                student_id=payload.student_id,
                attendance_rate=rate,
                engagement_score=80.0,
                academic_performance_index=0.0,
                login_gap_days=0,
                failure_ratio=0.0,
                financial_risk_flag=False,
                commute_risk_score=1,
                semester_performance_trend=0.0,
                last_interaction=datetime.now(timezone.utc)
            ))
        db.commit()

        db.refresh(record)
        return record

    def toggle_attendance(
        self,
        db: Session,
        student_id: str,
        course_id: str,
        attendance_date: date,
        current_user: User,
    ) -> dict:
        """Toggle P ↔ A for a given student/course/date. Returns new status char."""
        if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
            raise HTTPException(status_code=403, detail="Only faculty can mark attendance")

        record = (
            db.query(AttendanceRecord)
            .filter(
                AttendanceRecord.student_id == student_id,
                AttendanceRecord.course_id == course_id,
                func.date(AttendanceRecord.date) == attendance_date,
            )
            .first()
        )

        if record is None:
            # Default to PRESENT on first click
            new_status = AttendanceStatus.PRESENT
        elif record.status == AttendanceStatus.PRESENT:
            new_status = AttendanceStatus.ABSENT
        else:
            new_status = AttendanceStatus.PRESENT

        payload = AttendanceUpdatePayload(
            student_id=student_id,
            course_id=course_id,
            date=attendance_date,
            status=new_status.name,  # "PRESENT" or "ABSENT"
        )
        record = self.mark_or_update_attendance(db, payload, current_user)
        return {
            "student_id": student_id,
            "course_id": course_id,
            "date": attendance_date.isoformat(),
            "status": _status_char(record.status),
            "status_full": record.status.value,
        }

    # ── Student helpers ────────────────────────────────────────────────────────

    def _resolve_student(self, db: Session, current_user: User) -> Student:
        """Get Student record from the authenticated user."""
        if current_user.role != Role.STUDENT:
            raise HTTPException(status_code=403, detail="Only students can access this endpoint")
        if not current_user.student_id:
            raise HTTPException(status_code=400, detail="No student profile linked to this account")
        student = db.query(Student).filter(Student.id == current_user.student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        return student

    def get_student_summary(
        self, db: Session, current_user: User
    ) -> StudentAttendanceSummary:
        """
        Dynamically calculate entire attendance summary for the authenticated student.
        All values come from AttendanceRecord — zero hardcoding.
        """
        student = self._resolve_student(db, current_user)
        student_id = student.id

        enrollments = db.query(Enrollment).filter(Enrollment.student_id == student_id).all()

        all_present = 0
        all_total = 0
        below_75_count = 0
        borderline_count = 0
        subjects: List[StudentSubjectAttendance] = []
        warnings: List[AttendanceWarning] = []

        for enr in enrollments:
            course = db.query(Course).filter(Course.id == enr.course_id).first()
            if not course:
                continue

            total = (
                db.query(func.count(AttendanceRecord.id))
                .filter(
                    AttendanceRecord.student_id == student_id,
                    AttendanceRecord.course_id == enr.course_id,
                )
                .scalar() or 0
            )
            present = (
                db.query(func.count(AttendanceRecord.id))
                .filter(
                    AttendanceRecord.student_id == student_id,
                    AttendanceRecord.course_id == enr.course_id,
                    AttendanceRecord.status == AttendanceStatus.PRESENT,
                )
                .scalar() or 0
            )

            if total == 0:
                continue  # Skip courses with no records yet

            pct = round(present / total * 100, 2)
            all_present += present
            all_total += total

            is_below_75 = pct < THRESHOLD
            is_borderline = THRESHOLD <= pct < BORDERLINE_UPPER

            if is_below_75:
                below_75_count += 1
            if is_borderline:
                borderline_count += 1

            # Faculty name (try to get from user linked to a faculty)
            faculty_name = "Faculty"
            # Look up if there's a faculty user with course context (best-effort)

            subjects.append(StudentSubjectAttendance(
                course_id=course.id,
                course_name=course.name,
                faculty_name=faculty_name,
                present=present,
                total=total,
                percentage=pct,
                is_below_75=is_below_75,
                is_borderline=is_borderline,
            ))

            if is_below_75:
                needed = _classes_needed(present, total)
                warnings.append(AttendanceWarning(
                    course_id=course.id,
                    course_name=course.name,
                    present=present,
                    total=total,
                    percentage=pct,
                    consecutive_needed=needed,
                ))

        # Sort subjects: below 75 first, then borderline, then rest
        subjects.sort(key=lambda s: (not s.is_below_75, not s.is_borderline, -s.percentage))

        overall_pct = round(all_present / all_total * 100, 2) if all_total > 0 else 0.0

        # Monthly trend (last 6 months) from all courses
        monthly_trend = self._monthly_trend(db, student_id)

        return StudentAttendanceSummary(
            overall_percentage=overall_pct,
            total_present=all_present,
            total_classes=all_total,
            below_75_count=below_75_count,
            borderline_count=borderline_count,
            subjects=subjects,
            warnings=warnings,
            monthly_trend=monthly_trend,
        )

    def _monthly_trend(self, db: Session, student_id: str) -> List[dict]:
        """Return monthly attendance % for the last 6 months."""
        today = datetime.utcnow()
        result = []
        for i in range(5, -1, -1):
            if today.month - i <= 0:
                month_num = today.month - i + 12
                year = today.year - 1
            else:
                month_num = today.month - i
                year = today.year

            month_start = datetime(year, month_num, 1)
            if month_num == 12:
                month_end = datetime(year + 1, 1, 1)
            else:
                month_end = datetime(year, month_num + 1, 1)

            total = db.query(func.count(AttendanceRecord.id)).filter(
                AttendanceRecord.student_id == student_id,
                AttendanceRecord.date >= month_start,
                AttendanceRecord.date < month_end,
            ).scalar() or 0

            present = db.query(func.count(AttendanceRecord.id)).filter(
                AttendanceRecord.student_id == student_id,
                AttendanceRecord.date >= month_start,
                AttendanceRecord.date < month_end,
                AttendanceRecord.status == AttendanceStatus.PRESENT,
            ).scalar() or 0

            pct = round(present / total * 100, 1) if total > 0 else 0
            result.append({
                "month": month_start.strftime("%b"),
                "pct": pct,
            })
        return result

    def get_student_calendar(
        self, db: Session, current_user: User, course_id: str
    ) -> StudentCalendarResponse:
        """
        Build a Mon-Fri calendar for a student's attendance in a specific course.
        Groups actual attendance records by week.
        """
        student = self._resolve_student(db, current_user)
        student_id = student.id

        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail=f"Course {course_id} not found")

        records = (
            db.query(AttendanceRecord)
            .filter(
                AttendanceRecord.student_id == student_id,
                AttendanceRecord.course_id == course_id,
            )
            .order_by(AttendanceRecord.date.asc())
            .all()
        )

        if not records:
            return StudentCalendarResponse(course_id=course_id, course_name=course.name, weeks=[])

        # Group records into Mon-Fri weeks
        record_map: Dict[date, str] = {
            r.date.date(): _status_char(r.status) for r in records
        }

        all_dates = sorted(record_map.keys())
        first_date = all_dates[0]
        last_date = all_dates[-1]

        # Start from Monday of first week
        current_monday = first_date - timedelta(days=first_date.weekday())
        weeks: List[CalendarWeek] = []
        week_num = 1

        while current_monday <= last_date:
            cells: List[CalendarCell] = []
            for day_offset in range(5):  # Mon-Fri
                day_date = current_monday + timedelta(days=day_offset)
                status = record_map.get(day_date, "")
                if status:  # Only include days that actually had class
                    cells.append(CalendarCell(
                        date=day_date.isoformat(),
                        day_label=DAY_LABELS[day_date.weekday()],
                        status=status,
                    ))

            if cells:
                weeks.append(CalendarWeek(
                    week_label=f"W{week_num}",
                    cells=cells,
                ))
                week_num += 1

            current_monday += timedelta(weeks=1)

        return StudentCalendarResponse(
            course_id=course_id,
            course_name=course.name,
            weeks=weeks,
        )

    # ── Legacy helpers (for existing /grid and /weekly routes) ─────────────────

    def get_weekly_overview(self, db: Session) -> List[dict]:
        """7-day attendance overview across all courses."""
        today = datetime.utcnow().date()
        result = []
        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            total = db.query(func.count(AttendanceRecord.id)).filter(
                func.date(AttendanceRecord.date) == target_date
            ).scalar() or 0
            present = db.query(func.count(AttendanceRecord.id)).filter(
                func.date(AttendanceRecord.date) == target_date,
                AttendanceRecord.status == AttendanceStatus.PRESENT
            ).scalar() or 0
            absent = total - present
            pct = round(present / total * 100, 1) if total > 0 else 0
            result.append({
                "day": DAY_LABELS[target_date.weekday()],
                "date": target_date.isoformat(),
                "attendance": pct,
                "present": present,
                "absent": absent,
                "total": total,
            })
        return result

    def get_below_threshold_students(self, db: Session, threshold: float = 75.0, course_id: str = None) -> dict:
        """Students with attendance below threshold, calculated dynamically from records."""
        from sqlalchemy import case
        from app.models.student import Student
        from app.models.academic import Course
        
        query = db.query(
            AttendanceRecord.student_id,
            AttendanceRecord.course_id,
            func.count(AttendanceRecord.id).label('total'),
            func.sum(
                case(
                    (AttendanceRecord.status == AttendanceStatus.PRESENT, 1),
                    else_=0
                )
            ).label('present')
        )
        
        if course_id:
            query = query.filter(AttendanceRecord.course_id == course_id)
            
        grouped = query.group_by(AttendanceRecord.student_id, AttendanceRecord.course_id).all()
        
        students_below = []
        for s_id, c_id, total, present_count in grouped:
            if total == 0:
                continue
            
            present_count = present_count or 0
            pct = (present_count / total) * 100
            
            if pct < threshold:
                student = db.query(Student).filter(Student.id == s_id).first()
                course = db.query(Course).filter(Course.id == c_id).first()
                
                if student and course:
                    severity = "Critical" if pct < 50 else "High Risk" if pct < 60 else "At Risk"
                    students_below.append({
                        "student_id": student.id,
                        "name": student.name,
                        "roll_number": student.id,
                        "course": course.name,
                        "course_id": course.id,
                        "attendance_percentage": round(pct, 1),
                        "severity": severity,
                    })
                    
        # Sort by lowest attendance first
        students_below.sort(key=lambda x: x["attendance_percentage"])
        
        return {
            "threshold": threshold,
            "count": len(students_below),
            "students": students_below
        }


    # ── Session-based workflow ─────────────────────────────────────────────────

    def get_attendance_sessions(
        self, db: Session, current_user: User,
        course_id: Optional[str] = None,
        section: Optional[str] = None,
    ) -> List:
        """
        Return attendance sessions for faculty. Optionally filter by course/section.
        Enriches each session with live student counts from the same AttendanceRecord table.
        """
        from app.models.attendance_session import AttendanceSession

        query = db.query(AttendanceSession)
        if course_id:
            query = query.filter(AttendanceSession.course_id == course_id)
        if section:
            query = query.filter(AttendanceSession.section == section)

        sessions = query.order_by(AttendanceSession.session_date.asc(), AttendanceSession.id.asc()).all()

        result = []
        for sess in sessions:
            course = db.query(Course).filter(Course.id == sess.course_id).first()
            if not course:
                continue

            # Count enrolled students for this course (all sections — we'll use all for now)
            enrollment_count = db.query(func.count(Enrollment.id)).filter(
                Enrollment.course_id == sess.course_id
            ).scalar() or 0

            # Count present/absent for THIS session (records linked by session_id)
            present_count = db.query(func.count(AttendanceRecord.id)).filter(
                AttendanceRecord.session_id == sess.id,
                AttendanceRecord.status == AttendanceStatus.PRESENT,
            ).scalar() or 0
            absent_count = db.query(func.count(AttendanceRecord.id)).filter(
                AttendanceRecord.session_id == sess.id,
                AttendanceRecord.status == AttendanceStatus.ABSENT,
            ).scalar() or 0
            total_posted = present_count + absent_count

            # Faculty name
            faculty_name = None
            if sess.faculty_id:
                fac_user = db.query(User).filter(User.id == sess.faculty_id).first()
                if fac_user:
                    faculty_name = fac_user.name

            result.append({
                "id": sess.id,
                "course_id": sess.course_id,
                "course_name": course.name,
                "section": sess.section,
                "session_type": sess.session_type,
                "session_label": sess.session_label,
                "session_date": sess.session_date.isoformat() if sess.session_date else None,
                "start_time": sess.start_time.strftime("%H:%M") if sess.start_time else None,
                "end_time": sess.end_time.strftime("%H:%M") if sess.end_time else None,
                "status": sess.status,
                "faculty_name": faculty_name,
                "total_students": enrollment_count,
                "present_count": present_count,
                "absent_count": absent_count,
            })

        return result

    def get_session_roster(
        self, db: Session, session_id: int, current_user: User
    ) -> dict:
        """
        Return student roster for a specific session with their current attendance state.
        Students without a record for this session are shown as Present (unchecked).
        """
        from app.models.attendance_session import AttendanceSession

        if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
            raise HTTPException(status_code=403, detail="Not authorized")

        sess = db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first()
        if not sess:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

        course = db.query(Course).filter(Course.id == sess.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail=f"Course {sess.course_id} not found")

        # Get ALL enrolled students for the course
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == sess.course_id).all()

        # Build a lookup of existing session attendance records
        existing_records: Dict[str, AttendanceRecord] = {}
        records = db.query(AttendanceRecord).filter(AttendanceRecord.session_id == session_id).all()
        for rec in records:
            existing_records[rec.student_id] = rec

        students = []
        present_count = 0
        absent_count = 0
        for enr in enrollments:
            student = db.query(Student).filter(Student.id == enr.student_id).first()
            if not student:
                continue

            rec = existing_records.get(student.id)
            is_absent = (rec is not None and rec.status == AttendanceStatus.ABSENT)
            if is_absent:
                absent_count += 1
            else:
                present_count += 1

            students.append({
                "student_id": student.id,
                "name": student.name,
                "roll": student.id,
                "section": student.section.value if hasattr(student.section, 'value') else str(student.section),
                "is_absent": is_absent,
            })

        # Sort by name
        students.sort(key=lambda s: s["name"])

        return {
            "session_id": sess.id,
            "course_id": sess.course_id,
            "course_name": course.name,
            "section": sess.section,
            "session_type": sess.session_type,
            "session_label": sess.session_label,
            "session_date": sess.session_date.isoformat() if sess.session_date else None,
            "status": sess.status,
            "students": students,
            "total_students": len(students),
            "present_count": present_count,
            "absent_count": absent_count,
        }

    def post_session_attendance(
        self,
        db: Session,
        session_id: int,
        absent_student_ids: List[str],
        current_user: User,
    ) -> dict:
        """
        Post attendance for a session:
        - ALL enrolled students get a record: ABSENT if in absent_student_ids, PRESENT otherwise.
        - Upserts (no duplicates). Updates session status to COMPLETED.
        - Triggers WebSocket broadcast to refresh student dashboards.
        """
        from app.models.attendance_session import AttendanceSession

        if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
            raise HTTPException(status_code=403, detail="Only faculty can post attendance")

        sess = db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first()
        if not sess:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

        absent_set = set(absent_student_ids)

        # Get all enrolled students
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == sess.course_id).all()

        present_count = 0
        absent_count = 0

        # Normalize date to midnight datetime for the record
        record_date = datetime.combine(sess.session_date, datetime.min.time())

        for enr in enrollments:
            status_enum = (
                AttendanceStatus.ABSENT if enr.student_id in absent_set
                else AttendanceStatus.PRESENT
            )

            # Try to find existing record for this session
            record = db.query(AttendanceRecord).filter(
                AttendanceRecord.session_id == session_id,
                AttendanceRecord.student_id == enr.student_id,
            ).first()

            if record:
                record.status = status_enum
                record.marked_by = current_user.id
                record.updated_at = datetime.now(timezone.utc)
            else:
                # Also check by student+course+date for backward compatibility (no duplicates on same date)
                existing_date_record = db.query(AttendanceRecord).filter(
                    AttendanceRecord.student_id == enr.student_id,
                    AttendanceRecord.course_id == sess.course_id,
                    func.date(AttendanceRecord.date) == sess.session_date,
                    AttendanceRecord.session_id == None,
                ).first()

                if existing_date_record:
                    # Link existing record to this session
                    existing_date_record.status = status_enum
                    existing_date_record.session_id = session_id
                    existing_date_record.marked_by = current_user.id
                    existing_date_record.updated_at = datetime.now(timezone.utc)
                else:
                    record = AttendanceRecord(
                        student_id=enr.student_id,
                        course_id=sess.course_id,
                        date=record_date,
                        status=status_enum,
                        marked_by=current_user.id,
                        session_id=session_id,
                    )
                    db.add(record)

            if status_enum == AttendanceStatus.ABSENT:
                absent_count += 1
            else:
                present_count += 1

        # Mark session as COMPLETED
        sess.status = "COMPLETED"
        sess.updated_at = datetime.now(timezone.utc)

        # Update student metrics
        from app.models.student import StudentMetric
        for enr in enrollments:
            st_id = enr.student_id
            tot = db.query(func.count(AttendanceRecord.id)).filter(AttendanceRecord.student_id == st_id).scalar() or 0
            prs = db.query(func.count(AttendanceRecord.id)).filter(
                AttendanceRecord.student_id == st_id,
                AttendanceRecord.status == AttendanceStatus.PRESENT
            ).scalar() or 0
            rate = round(prs / tot * 100, 1) if tot > 0 else 0.0
            
            metric = db.query(StudentMetric).filter(StudentMetric.student_id == st_id).first()
            if metric:
                metric.attendance_rate = rate
                metric.updated_at = datetime.now(timezone.utc)
            else:
                db.add(StudentMetric(
                    student_id=st_id,
                    attendance_rate=rate,
                    engagement_score=80.0,
                    academic_performance_index=0.0,
                    login_gap_days=0,
                    failure_ratio=0.0,
                    financial_risk_flag=False,
                    commute_risk_score=1,
                    semester_performance_trend=0.0,
                    last_interaction=datetime.now(timezone.utc)
                ))

        db.commit()

        # Broadcast WebSocket event so student dashboards refresh
        import asyncio
        try:
            from app.websocket.manager import manager
            event = {
                "type": "attendance_posted",
                "session_id": session_id,
                "course_id": sess.course_id,
                "session_date": sess.session_date.isoformat(),
                "present_count": present_count,
                "absent_count": absent_count,
            }
            loop = asyncio.get_event_loop()
            if not loop.is_closed():
                loop.create_task(manager.broadcast("dashboard", event))
                loop.create_task(manager.broadcast("notifications", event))
        except Exception:
            pass  # WebSocket broadcast is best-effort

        return {
            "session_id": session_id,
            "status": "COMPLETED",
            "total": present_count + absent_count,
            "present_count": present_count,
            "absent_count": absent_count,
        }


attendance_service = AttendanceService()
