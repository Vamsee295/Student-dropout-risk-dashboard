import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.database import SessionLocal
from app.models import Student
from app.routes.student_dashboard import get_student_grade_forecast

def test_forecast():
    db = SessionLocal()
    try:
        # Get a student
        student = db.query(Student).first()
        if not student:
            print("No students found. Run seed_many_students.py first.")
            return

        print(f"Testing forecast for {student.name} ({student.id})...")
        
        forecast = get_student_grade_forecast(student.id, db)
        
        print(f"Current GPA: {forecast.current_gpa}")
        print(f"Projected GPA: {forecast.projected_gpa}")
        print(f"Trend: {forecast.trend}")
        print(f"Factors: {forecast.prediction_factors}")
        print(f"Confidence: {forecast.confidence_interval}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_forecast()
