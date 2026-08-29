import os
import sys
import asyncio
from datetime import datetime, timedelta
from passlib.context import CryptContext

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models.student import Student, StudentMetric
from app.models.analytics import RiskScore
from app.models.records import AttendanceRecord, StudentAssessment
from app.models.user import User
from app.models.academic import Enrollment, Course, Assessment
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def setup_test_student():
    db = SessionLocal()
    try:
        # 1. Create Student record for VAMSEE_05
        student_id = "VAMSEE_05"
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            student = Student(
                id=student_id,
                name="Vamsee",
                department="CSE",
                course="B.Tech",
                section="A"
            )
            db.add(student)
            print(f"Created student {student_id}")
        else:
            print(f"Student {student_id} already exists")

        # Fix broken lower-case roles for existing users
        from sqlalchemy import text
        db.execute(text("UPDATE users SET role='STUDENT' WHERE role='student'"))
        db.execute(text("UPDATE users SET role='FACULTY' WHERE role='faculty'"))
        db.commit()

        # 2. Map user account student@gmail.com to student_id="VAMSEE_05"
        user = db.query(User).filter(User.email == "student@gmail.com").first()
        from app.models.enums import Role
        if not user:
            user = User(
                email="student@gmail.com",
                name="Vamsee",
                password_hash=pwd_context.hash("passwords"),
                role=Role.STUDENT,
                student_id=student_id,
                is_active=True
            )
            db.add(user)
            print("Created user student@gmail.com")
        else:
            user.student_id = student_id
            user.password_hash = pwd_context.hash("passwords")
            user.role = Role.STUDENT
            user.name = "Vamsee"
            print("Updated user student@gmail.com")

        db.commit()

        # 3. Enroll VAMSEE_05 in active faculty courses
        courses = ["CS101", "AI201", "AE301", "DS102", "DS201", "GEN101"]
        # Ensure courses exist
        for c_id in courses:
            course = db.query(Course).filter(Course.id == c_id).first()
            if not course:
                course = Course(id=c_id, name=f"Course {c_id}", department="CSE", credits=3, semester=1)
                db.add(course)
        db.commit()

        for c_id in courses:
            enrollment = db.query(Enrollment).filter(Enrollment.student_id == student_id, Enrollment.course_id == c_id).first()
            if not enrollment:
                db.add(Enrollment(student_id=student_id, course_id=c_id, semester=1))
                print(f"Enrolled in {c_id}")

        db.commit()

        # 4. Seed initial StudentMetric and RiskScore
        metric = db.query(StudentMetric).filter(StudentMetric.student_id == student_id).first()
        if not metric:
            metric = StudentMetric(
                student_id=student_id,
                attendance_rate=75.0,
                engagement_score=80.0,
                academic_performance_index=3.5,
                login_gap_days=1,
                failure_ratio=0.0,
                financial_risk_flag=False,
                commute_risk_score=1,
                semester_performance_trend=0.0,
                last_interaction=datetime.utcnow()
            )
            db.add(metric)
            print("Created StudentMetric")
        else:
            metric.attendance_rate = 75.0
            metric.engagement_score = 80.0
            metric.academic_performance_index = 3.5

        from app.models.enums import RiskLevel, RiskTrend
        from app.models.analytics import ModelVersion
        
        model_ver = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
        if not model_ver:
            model_ver = ModelVersion(version="v1.0", model_path="fake_path", accuracy=0.9, precision=0.9, recall=0.9, f1_score=0.9, training_samples=100, feature_importance={}, is_active=True)
            db.add(model_ver)
            db.commit()

        risk = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
        if not risk:
            risk = RiskScore(
                student_id=student_id,
                risk_level=RiskLevel.SAFE,
                risk_score=15.0,
                risk_trend=RiskTrend.STABLE,
                risk_value="15.0",
                model_version_id=model_ver.id,
                predicted_at=datetime.utcnow()
            )
            db.add(risk)
            print("Created RiskScore")

        db.commit()

        # 5. Seed initial sample attendance records
        # 3 Present, 1 Absent for CS101
        from app.models.enums import AttendanceStatus
        today = datetime.utcnow().date()
        dates_statuses = [
            (today - timedelta(days=4), AttendanceStatus.PRESENT),
            (today - timedelta(days=3), AttendanceStatus.PRESENT),
            (today - timedelta(days=2), AttendanceStatus.ABSENT),
            (today - timedelta(days=1), AttendanceStatus.PRESENT),
        ]
        
        for i, (date, status) in enumerate(dates_statuses):
            att = db.query(AttendanceRecord).filter(
                AttendanceRecord.student_id == student_id,
                AttendanceRecord.course_id == "CS101",
                AttendanceRecord.date == date
            ).first()
            if not att:
                db.add(AttendanceRecord(
                    student_id=student_id,
                    course_id="CS101",
                    date=date,
                    status=status
                ))

        db.commit()

        # 6. Associate existing assessments/assignments with VAMSEE_05
        from app.models.enums import SubmissionStatus
        assessments = db.query(Assessment).all()
        for ass in assessments:
            sa = db.query(StudentAssessment).filter(
                StudentAssessment.student_id == student_id,
                StudentAssessment.assessment_id == ass.id
            ).first()
            if not sa:
                db.add(StudentAssessment(
                    student_id=student_id,
                    assessment_id=ass.id,
                    submission_date=datetime.utcnow(),
                    status=SubmissionStatus.SUBMITTED,
                    obtained_marks=None
                ))
        db.commit()
        print("Setup complete for VAMSEE_05!")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_test_student()
