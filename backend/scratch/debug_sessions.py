import sys
sys.path.append(r"X:\Project-Buildings\Student-dropout-risk-dashboard\backend")
from app.database.session import SessionLocal
from app.models.user import User
from app.services.attendance_service import attendance_service
import traceback

db = SessionLocal()
user = db.query(User).filter_by(email="faculty@test.com").first()

try:
    sessions = attendance_service.get_attendance_sessions(db, current_user=user, course_id="CS101")
    print("Success! Found sessions:", len(sessions))
except Exception as e:
    traceback.print_exc()

db.close()
