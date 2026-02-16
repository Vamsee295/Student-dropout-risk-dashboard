import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.database import SessionLocal
from app.models import Student
from app.routes.student_dashboard import get_suggested_mentors

def test_mentors():
    db = SessionLocal()
    try:
        # Get a student
        student = db.query(Student).first()
        if not student:
            print("No students found.")
            return

        print(f"Finding mentors for {student.name} ({student.department.value})...")
        
        mentors = get_suggested_mentors(student.id, db)
        
        print(f"Found {len(mentors)} mentors:")
        for m in mentors:
            print(f"- {m.name} ({m.department}) - Risk: {m.riskStatus}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_mentors()
