"""Attendance seed runner — fixes data, links demo user, seeds 5 weeks."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
import random
from sqlalchemy import func, text
from app.database.session import SessionLocal, engine, Base
from app.models.records import AttendanceRecord
from app.models.academic import Course, Enrollment
from app.models.student import Student
from app.models.user import User
from app.models.enums import AttendanceStatus, Role

Base.metadata.create_all(bind=engine)
print("Tables synced OK")

db = SessionLocal()

# Link demo student user to a Student record
student_user = db.query(User).filter(User.role == Role.STUDENT).first()
demo_student_id = None
if student_user:
    if not student_user.student_id:
        demo_student = db.query(Student).first()
        if demo_student:
            student_user.student_id = demo_student.id
            db.commit()
            print(f"Linked {student_user.email} to {demo_student.id}")
    demo_student_id = student_user.student_id
    print(f"Demo student id: {demo_student_id}")

# Clean up any bad statuses (from before LATE removal)
sql = text("UPDATE attendance_records SET status = 'Present' WHERE status NOT IN ('Present', 'Absent')")
db.execute(sql)
db.commit()
print("Cleaned invalid statuses")

# Seed 5 weeks Mon-Fri attendance
today = datetime.utcnow().date()
courses = db.query(Course).all()
PATTERNS = {
    "CS101": 0.85, "AI201": 0.70, "DS102": 0.78,
    "DS201": 0.90, "AE301": 0.82, "GEN101": 0.88
}
records_added = 0

for course in courses:
    ratio = PATTERNS.get(course.id, 0.80)
    enrs = db.query(Enrollment).filter(Enrollment.course_id == course.id).all()
    student_ids = [e.student_id for e in enrs[:30]]

    for week_back in range(5, 0, -1):
        monday = today - timedelta(days=today.weekday()) - timedelta(weeks=week_back - 1)
        for day_off in range(5):
            d = monday + timedelta(days=day_off)
            if d > today:
                continue
            dt = datetime.combine(d, datetime.min.time())
            for sid in student_ids:
                existing = db.query(AttendanceRecord).filter(
                    AttendanceRecord.student_id == sid,
                    AttendanceRecord.course_id == course.id,
                    AttendanceRecord.date == dt,
                ).first()
                if existing:
                    continue
                if sid == demo_student_id:
                    seed_val = abs(hash(sid + course.id + str(d))) % 100
                    is_p = seed_val < int(ratio * 100)
                else:
                    is_p = random.random() < ratio
                status = AttendanceStatus.PRESENT if is_p else AttendanceStatus.ABSENT
                db.add(AttendanceRecord(
                    student_id=sid, course_id=course.id, date=dt, status=status
                ))
                records_added += 1

db.commit()
print(f"Added {records_added} records")

# Verify demo student summary
if demo_student_id:
    print("Demo student per-course summary:")
    for c in courses:
        t = db.query(func.count(AttendanceRecord.id)).filter(
            AttendanceRecord.student_id == demo_student_id,
            AttendanceRecord.course_id == c.id
        ).scalar() or 0
        p = db.query(func.count(AttendanceRecord.id)).filter(
            AttendanceRecord.student_id == demo_student_id,
            AttendanceRecord.course_id == c.id,
            AttendanceRecord.status == AttendanceStatus.PRESENT
        ).scalar() or 0
        pct = round(p / t * 100, 1) if t else 0
        flag = "BELOW 75" if pct < 75 else ("BORDERLINE" if pct < 80 else "OK")
        print(f"  {demo_student_id} | {c.id:8s} | {p}/{t} = {pct}% [{flag}]")

db.close()
print("Seed complete")
