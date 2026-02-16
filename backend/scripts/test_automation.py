import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from sqlalchemy.orm import Session
from app.database import SessionLocal, init_db
from app.models import Student, StudentMetric, Intervention, InterventionType, Department, Section
from app.services.realtime_prediction import compute_student_risk
import uuid
from datetime import datetime

def test_automation():
    db = SessionLocal()
    try:
        print("Creating test student...")
        student_id = f"TEST_{uuid.uuid4().hex[:8]}"
        
        # Create student
        student = Student(
            id=student_id,
            name="Test Automation Student",
            course="Computer Science",
            department=Department.CSE,
            section=Section.A,
            advisor_id="Prof. Test"
        )
        db.add(student)
        db.commit()
        
        # Create high-risk metrics
        # Low attendance, low engagement, high failure ratio
        print("Adding high-risk metrics...")
        metrics = StudentMetric(
            student_id=student_id,
            attendance_rate=40.0,
            engagement_score=20.0,
            academic_performance_index=5.0,
            login_gap_days=15,
            failure_ratio=0.5,
            financial_risk_flag=True,
            commute_risk_score=3,
            semester_performance_trend=-10.0,
            last_interaction=datetime.utcnow()
        )
        db.add(metrics)
        db.commit()
        
        # Compute risk
        print(f"Computing risk for {student_id}...")
        try:
            result = compute_student_risk(student_id, db)
            print(f"Risk Score: {result['risk_score']}")
            print(f"Risk Level: {result['risk_level']}")
            
            # Verify Intervention
            print("Checking for automated intervention...")
            intervention = db.query(Intervention).filter(
                Intervention.student_id == student_id
            ).first()
            
            if intervention:
                print(f"SUCCESS: Intervention created!")
                print(f"Type: {intervention.intervention_type}")
                print(f"Status: {intervention.status}")
                print(f"Assigned To: {intervention.assigned_to}")
                print(f"Notes: {intervention.notes}")
            else:
                print("FAILURE: No intervention created.")
                
        except Exception as e:
            print(f"Error during risk computation: {e}")
            # Ensure we clean up even if error
            
    finally:
        # Cleanup
        print("Cleaning up...")
        try:
            db.query(Intervention).filter(Intervention.student_id == student_id).delete()
            db.query(StudentMetric).filter(StudentMetric.student_id == student_id).delete()
            db.query(Student).filter(Student.id == student_id).delete()
            db.commit()
        except:
            pass
        db.close()

if __name__ == "__main__":
    test_automation()
