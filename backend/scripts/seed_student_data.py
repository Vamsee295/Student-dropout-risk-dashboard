import sys
import os

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User, Student, Department, Role, Section, StudentMetric
# Need to import models to ensure tables are created if not present
from app.database import init_db
from datetime import datetime

def seed_student_data():
    db = SessionLocal()
    try:
        # Find the student user
        student_user = db.query(User).filter(User.email == "student1@gmail.com").first()
        if not student_user:
            print("Student user 'student1@gmail.com' not found. Please run seed_users.py first.")
            return

        # Check if student profile already exists
        if student_user.student_id:
            print(f"Student user already linked to student_id: {student_user.student_id}")
            # Optional: Check if metrics exist, if not create them
            student = db.query(Student).filter(Student.id == student_user.student_id).first()
            if student and not student.metrics:
                print("Adding missing metrics to existing student...")
                metrics = StudentMetric(
                    student_id=student.id,
                    attendance_rate=85.5,
                    engagement_score=78.2,
                    academic_performance_index=3.8,
                    login_gap_days=2,
                    failure_ratio=0.0,
                    financial_risk_flag=False,
                    commute_risk_score=2,
                    semester_performance_trend=5.0,
                    last_interaction=datetime.utcnow()
                )
                db.add(metrics)
                db.commit()
                print("Metrics added.")
            return

        # Create a sample student
        new_student = Student(
            id="STU001",
            name="Ravi Student",
            course="B.Tech Computer Science",
            department=Department.CSE,
            section=Section.A,
            advisor_id="FAC001"
        )
        db.add(new_student)
        db.commit()
        db.refresh(new_student)
        
        print(f"Created student profile: {new_student.id}")

        # Create Metrics
        metrics = StudentMetric(
            student_id=new_student.id,
            attendance_rate=85.5,
            engagement_score=78.2,
            academic_performance_index=3.8,
            login_gap_days=2,
            failure_ratio=0.0,
            financial_risk_flag=False,
            commute_risk_score=2,
            semester_performance_trend=5.0,
            last_interaction=datetime.utcnow()
        )
        db.add(metrics)
        
        # Link user to student
        student_user.student_id = new_student.id
        db.commit()
        print(f"Linked user {student_user.email} to student {new_student.id} with metrics.")

    except Exception as e:
        print(f"Error seeding student data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_student_data()
