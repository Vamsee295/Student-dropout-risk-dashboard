import sys
import os
import random
import uuid
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db
from app.models import Student, StudentMetric, Department, Section

def seed_many_students(count=100):
    db = SessionLocal()
    init_db()
    
    cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]
    departments = [Department.CSE, Department.AI_DS, Department.AEROSPACE, Department.DATA_SCIENCE]
    sections = [Section.A, Section.B, Section.C]
    
    print(f"Seeding {count} students...")
    
    try:
        for i in range(count):
            # Generate random student
            student_id = f"STU{1000+i}"
            name = f"Student {i}"
            dept = random.choice(departments)
            
            # Check if exists
            if db.query(Student).filter(Student.id == student_id).first():
                continue
                
            student = Student(
                id=student_id,
                name=name,
                course="B.Tech",
                department=dept,
                section=random.choice(sections),
                advisor_id="FAC001",
                avatar=name[:2].upper()
            )
            db.add(student)
            
            # Generate metrics
            # Create two clusters: At Risk and Safe
            is_risk = random.random() < 0.3 # 30% at risk
            
            if is_risk:
                attendance = random.uniform(30, 65)
                engagement = random.uniform(10, 50)
                performance = random.uniform(20, 60)
                failure = random.uniform(0.1, 0.6)
                financial = random.random() < 0.5
            else:
                attendance = random.uniform(75, 100)
                engagement = random.uniform(60, 100)
                performance = random.uniform(70, 95)
                failure = 0.0
                financial = random.random() < 0.1
                
            metrics = StudentMetric(
                student_id=student.id,
                attendance_rate=attendance,
                engagement_score=engagement,
                academic_performance_index=performance, # scaled 0-10 or 0-100? Models use what? 
                # realtime_prediction extracts features directly. 
                # Let's assume 0-100 based on validation script logic usually seen
                login_gap_days=random.randint(0, 20) if is_risk else random.randint(0, 3),
                failure_ratio=failure,
                financial_risk_flag=financial,
                commute_risk_score=random.randint(1, 10),
                semester_performance_trend=random.uniform(-10, 10),
                last_interaction=datetime.utcnow()
            )
            db.add(metrics)
            
            if i % 10 == 0:
                db.commit()
                print(f"Seeded {i} students...")
                
        db.commit()
        print("Seeding complete.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_many_students()
