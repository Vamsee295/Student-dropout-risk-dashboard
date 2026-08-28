"""
Seed attendance sessions for the current and previous week.
Creates realistic sessions across courses and sections.
Run this after the database table is created.
"""
import sys
sys.path.append(r"X:\Project-Buildings\Student-dropout-risk-dashboard\backend")

from datetime import date, timedelta, datetime, timezone
from app.database.session import SessionLocal, Base, engine
from app.models import AttendanceSession, Course
from app.models.user import User
from app.models.enums import Role

# ── Ensure tables exist ──────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)
print("OK: Tables created/verified")

db = SessionLocal()

# Get faculty user
faculty = db.query(User).filter(User.role == Role.FACULTY).first()
faculty_id = faculty.id if faculty else None
print(f"Faculty: {faculty.email if faculty else 'None (no faculty user)'}")

# Get all courses
courses = db.query(Course).all()
print(f"Found {len(courses)} courses: {[c.id for c in courses]}")

# Date helpers - base on today
today = date.today()
monday = today - timedelta(days=today.weekday())  # Monday of this week

def make_session(course_id, section, session_type, session_label, day_offset, status="COMPLETED"):
    """Helper to create one session on a day offset from this Monday."""
    session_date = monday + timedelta(days=day_offset)
    return {
        "course_id": course_id,
        "section": section,
        "faculty_id": faculty_id,
        "session_type": session_type,
        "session_label": session_label,
        "session_date": session_date,
        "status": status,
    }

# Sessions to seed (covers CS101 and AI201 primarily as they have most students)
sessions_to_create = [
    # CS101 - Section 1 (students section A)
    make_session("CS101", "Section 1", "Lecture",   "Lecture 1",  0, "COMPLETED"),   # Monday
    make_session("CS101", "Section 1", "Lecture",   "Lecture 2",  2, "COMPLETED"),   # Wednesday
    make_session("CS101", "Section 1", "Practical", "Practical",  1, "COMPLETED"),   # Tuesday
    make_session("CS101", "Section 1", "Lecture",   "Lecture 3",  4, "PENDING"),     # Friday (today if week started Mon)

    # CS101 - Section 2 (students section B)
    make_session("CS101", "Section 2", "Lecture",   "Lecture 1",  0, "COMPLETED"),   # Monday
    make_session("CS101", "Section 2", "Lecture",   "Lecture 2",  3, "COMPLETED"),   # Thursday
    make_session("CS101", "Section 2", "Practical", "Practical",  2, "PENDING"),     # Wednesday

    # AI201 - Section 1
    make_session("AI201", "Section 1", "Lecture",   "Lecture 1",  1, "COMPLETED"),   # Tuesday
    make_session("AI201", "Section 1", "Lecture",   "Lecture 2",  3, "COMPLETED"),   # Thursday
    make_session("AI201", "Section 1", "Practical", "Practical",  4, "PENDING"),     # Friday

    # AI201 - Section 2
    make_session("AI201", "Section 2", "Lecture",   "Lecture 1",  0, "COMPLETED"),   # Monday
    make_session("AI201", "Section 2", "Practical", "Practical",  2, "PENDING"),     # Wednesday

    # DS102 - Section 1
    make_session("DS102", "Section 1", "Lecture",   "Lecture 1",  1, "COMPLETED"),   # Tuesday
    make_session("DS102", "Section 1", "Lecture",   "Lecture 2",  4, "PENDING"),     # Friday
]

created = 0
skipped = 0
for s in sessions_to_create:
    existing = db.query(AttendanceSession).filter(
        AttendanceSession.course_id == s["course_id"],
        AttendanceSession.section == s["section"],
        AttendanceSession.session_type == s["session_type"],
        AttendanceSession.session_label == s["session_label"],
        AttendanceSession.session_date == s["session_date"],
    ).first()

    if existing:
        skipped += 1
        continue

    session = AttendanceSession(**s)
    db.add(session)
    created += 1

db.commit()
db.close()
print(f"Done! Created {created} sessions, skipped {skipped} existing sessions.")
print(f"   Sessions are for week starting {monday.strftime('%a %b %d, %Y')}")
