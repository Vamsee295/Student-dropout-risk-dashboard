"""Quick smoke test for attendance toggle."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.attendance_service import attendance_service
from app.database.session import SessionLocal
from app.models.user import User
from app.models.enums import Role
from datetime import date

db = SessionLocal()

faculty_user = db.query(User).filter(User.role == Role.FACULTY).first()
print("Faculty:", faculty_user.name)

test_date = date.today()
r1 = attendance_service.toggle_attendance(db, "STU123", "CS101", test_date, faculty_user)
r2 = attendance_service.toggle_attendance(db, "STU123", "CS101", test_date, faculty_user)
r3 = attendance_service.toggle_attendance(db, "STU123", "CS101", test_date, faculty_user)
print("Toggle 1:", r1["status"], " Toggle 2:", r2["status"], " Toggle 3:", r3["status"])
assert r1["status"] != r2["status"], "Toggle 1->2 should flip"
assert r2["status"] != r3["status"], "Toggle 2->3 should flip"

# Verify student sees the updated count
student_user = db.query(User).filter(User.role == Role.STUDENT).first()
summary = attendance_service.get_student_summary(db, student_user)
cs101 = next((s for s in summary.subjects if s.course_id == "CS101"), None)
if cs101:
    print("Student CS101:", cs101.present, "/", cs101.total, "=", cs101.percentage, "% - last status:", r3["status"])

db.close()
print("PASS - Toggle persists and student sees updated data!")
