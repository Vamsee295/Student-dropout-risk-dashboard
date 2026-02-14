import sys
import os

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db
from app.models import User, Role, Student
from app.security import get_password_hash
from loguru import logger

def seed_users():
    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).first():
            logger.info("Users already exist. Skipping seed.")
            return

        # Create Faculty User
        faculty = User(
            email="faculty1@gmail.com",
            password_hash=get_password_hash("password"),
            name="Dr. Faculty",
            role=Role.FACULTY
        )
        db.add(faculty)
        logger.info(f"Created faculty user: {faculty.email}")

        # Create Student User
        # First ensure a student profile exists to link to
        student_profile = db.query(Student).first()
        student_id = student_profile.id if student_profile else None
        
        if not student_id:
             # Create a dummy student if none exists, just for the user link
             # In a real scenario, we might want to be more careful here
             pass

        student = User(
            email="student1@gmail.com",
            password_hash=get_password_hash("password"),
            name="Ravi Student",
            role=Role.STUDENT,
            student_id=student_id 
        )
        db.add(student)
        logger.info(f"Created student user: {student.email}")

        db.commit()
        logger.success("Database seeded successfully!")
        
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() # Ensure tables exist
    seed_users()
