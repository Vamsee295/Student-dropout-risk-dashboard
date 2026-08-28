import sys
sys.path.append(r"X:\Project-Buildings\Student-dropout-risk-dashboard\backend")
from app.database.session import SessionLocal
from app.models.user import User
from app.auth.security import get_password_hash

db = SessionLocal()

# Set all passwords to "passwords" properly hashed
users = db.query(User).all()
new_hash = get_password_hash("passwords")
for u in users:
    u.password_hash = new_hash

db.commit()
db.close()
print("All passwords reset to 'passwords' with current hash context.")
