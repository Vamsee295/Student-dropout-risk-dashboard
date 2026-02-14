import sys
import os
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import User

db = SessionLocal()
users = db.query(User).all()
print(f"Total users: {len(users)}")
for user in users:
    print(f"User: {user.email}, Role: {user.role}")
db.close()
