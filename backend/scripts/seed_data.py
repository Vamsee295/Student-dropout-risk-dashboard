from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    User, Role, Student, Department, Section, Course, Enrollment, 
    AttendanceRecord, AttendanceStatus, Assessment, AssessmentType, 
    StudentAssessment, SubmissionStatus, RiskScore, RiskLevel, RiskTrend,
    StudentMetric, StudentCodingProfile
)
from app.security import get_password_hash
from datetime import datetime, timedelta
import random

def reset_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset complete.")

def seed_data():
    db = SessionLocal()
    try:
        print("Seeding data...")
        
        # 1. Create Users
        student_user = User(
            email="student1@gmail.com",
            password_hash=get_password_hash("password"),
            name="John Student",
            role=Role.STUDENT,
            student_id="ST001"
        )
        
        faculty_user = User(
            email="faculty1@gmail.com",
            password_hash=get_password_hash("password"),
            name="Dr. Smith",
            role=Role.FACULTY
        )
        
        db.add(student_user)
        db.add(faculty_user)
        
        # 2. Create Student Profile
        student = Student(
            id="ST001",
            name="John Student",
            avatar="JS",
            course="B.Tech Data Science",
            department=Department.CSE,
            section=Section.A,
            advisor_id="FAC001"
        )
        db.add(student)
        
        # 3. Create Courses
        courses = [
            Course(id="CS101", name="Intro to Programming", department=Department.CSE, credits=4, semester=1),
            Course(id="MA101", name="Calculus I", department=Department.CSE, credits=3, semester=1),
            Course(id="CS102", name="Data Structures", department=Department.CSE, credits=4, semester=2),
        ]
        db.add_all(courses)
        
        # 4. Enrol Student
        enrollments = [
            Enrollment(student_id="ST001", course_id="CS101", semester=1),
            Enrollment(student_id="ST001", course_id="MA101", semester=1),
            Enrollment(student_id="ST001", course_id="CS102", semester=2),
        ]
        db.add_all(enrollments)
        
        db.commit() # Commit to get IDs if needed
        
        # 5. Add Assessments & Student Assessments
        assessments = [
            Assessment(course_id="CS101", title="Midterm", type=AssessmentType.INTERNAL, total_marks=50, weightage=30, due_date=datetime.utcnow() - timedelta(days=60)),
            Assessment(course_id="CS101", title="Final Exam", type=AssessmentType.EXTERNAL, total_marks=100, weightage=50, due_date=datetime.utcnow() - timedelta(days=10)),
            Assessment(course_id="CS101", title="Assignment 1", type=AssessmentType.ASSIGNMENT, total_marks=10, weightage=10, due_date=datetime.utcnow() - timedelta(days=80)),
        ]
        db.add_all(assessments)
        db.commit()
        
        student_assessments = [
            StudentAssessment(student_id="ST001", assessment_id=assessments[0].id, obtained_marks=40, status=SubmissionStatus.GRADED),
            StudentAssessment(student_id="ST001", assessment_id=assessments[1].id, obtained_marks=85, status=SubmissionStatus.GRADED),
            StudentAssessment(student_id="ST001", assessment_id=assessments[2].id, obtained_marks=9, status=SubmissionStatus.SUBMITTED),
        ]
        db.add_all(student_assessments)
        
        # 6. Add Attendance
        # Add 20 records
        att_records = []
        base_date = datetime.utcnow() - timedelta(days=30)
        for i in range(20):
            date = base_date + timedelta(days=i)
            status = AttendanceStatus.PRESENT if i % 5 != 0 else AttendanceStatus.ABSENT
            att_records.append(AttendanceRecord(student_id="ST001", course_id="CS101", date=date, status=status))
            
        db.add_all(att_records)
        
        # 7. Add Metrics & Risk
        metrics = StudentMetric(
            student_id="ST001",
            attendance_rate=85.0,
            engagement_score=78.0,
            academic_performance_index=8.5,
            login_gap_days=2,
            failure_ratio=0.0,
            financial_risk_flag=False,
            commute_risk_score=1,
            semester_performance_trend=5.0
        )
        db.add(metrics)
        
        risk = RiskScore(
            student_id="ST001",
            risk_score=22.0,
            risk_level=RiskLevel.SAFE,
            risk_trend=RiskTrend.STABLE,
            risk_value="22% (Low)",
            model_version_id=1, # Mock
            shap_explanation={"top_factors": [{"feature": "attendance", "impact": -5, "direction": "positive"}]}
        )
         
        # Need model version first? 
        # Actually RiskScore has FK to ModelVersion. Let's create dummy model version.
        from app.models import ModelVersion
        model_v = ModelVersion(
            version="v1.0", 
            model_path="models/seed-generated", 
            accuracy=0.9, precision=0.9, recall=0.9, f1_score=0.9, 
            training_samples=1000, feature_importance={}, is_active=True
        )
        db.add(model_v)
        db.commit()
        
        risk.model_version_id = model_v.id
        db.add(risk)
        
        # 8. Add Coding Profile
        coding_profile = StudentCodingProfile(
            student_id="ST001",
            hackerrank_score=1500.0,
            hackerrank_solved=45,
            leetcode_rating=1450.0,
            leetcode_solved=120,
            codechef_rating=1300.0,
            codeforces_rating=900.0,
            interviewbit_score=350.0,
            spoj_score=100.0,
            overall_score=75.5
        )
        db.add(coding_profile)
        
        db.commit()
        print("Seeding complete.")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_db()
    seed_data()
