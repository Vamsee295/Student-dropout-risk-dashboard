import sys
sys.path.append(r"X:\Project-Buildings\Student-dropout-risk-dashboard\backend")
from app.database.session import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(f"Role: {u.role}, Email: {u.email}, ID: {u.id}, Student ID: {u.student_id}")
db.close()
