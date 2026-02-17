import sys
import os
import random
import uuid
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db
from app.models import Student, StudentMetric, Department, Section, Course, Enrollment, Assessment, StudentAssessment, AttendanceRecord, AttendanceStatus, SubmissionStatus, AssessmentType

def seed_many_students(count=100):
    db = SessionLocal()
    init_db()
    
    names = [
        "Aarav Sharma", "Aditi Rao", "Ananya Singh", "Arjun Patel", "Bhavya Gupta", 
        "Chetan Kumar", "Deepika Padukone", "Divya Reddy", "Ganesh Hegde", "Ishani Joshi",
        "Kabir Khan", "Kavya Iyer", "Mohan Das", "Neha Verma", "Pranav Nair", 
        "Priya Desai", "Rahul Bose", "Riya Sen", "Sanjay Dutt", "Sneha Kapoor",
        "Tanvi Shah", "Utkarsh Singh", "Varun Dhawan", "Vidya Balan", "Yash Chopra",
        "Zara Khan", "Amitabh Bachchan", "Shah Rukh", "Salman Khan", "Aamir Khan"
    ]
    
    cities = ["Bangalore", "Hyderabad", "Chennai", "Mumbai", "Delhi"]
    departments = [Department.CSE, Department.AI_DS, Department.AEROSPACE, Department.DATA_SCIENCE]
    sections = [Section.A, Section.B, Section.C]
    
    # Create Courses if none exist
    course_list = [
        ("CS101", "Introduction to Programming", Department.CSE, 4),
        ("AI201", "Machine Learning Fundamentals", Department.AI_DS, 4),
        ("AE301", "Aerodynamics I", Department.AEROSPACE, 4),
        ("DS102", "Statistical Inference", Department.DATA_SCIENCE, 4),
        ("DS201", "Big Data Architecture", Department.DATA_SCIENCE, 4),
        ("GEN101", "Soft Skills & Ethics", Department.CSE, 4)
    ]
    
    db_courses = []
    for code, title, dept, sem in course_list:
        course = db.query(Course).filter(Course.id == code).first()
        if not course:
            course = Course(id=code, name=title, department=dept, credits=random.randint(2, 4), semester=sem)
            db.add(course)
            db.flush()
        db_courses.append(course)
    
    # Create some Assessments for these courses
    for course in db_courses:
        if not db.query(Assessment).filter(Assessment.course_id == course.id).first():
            # Mid-term
            db.add(Assessment(course_id=course.id, title="Mid-Term Exam", type=AssessmentType.INTERNAL, total_marks=50, weightage=30, due_date=datetime.utcnow() - timedelta(days=30)))
            # Assignment
            db.add(Assessment(course_id=course.id, title="Assignment 1", type=AssessmentType.ASSIGNMENT, total_marks=20, weightage=10, due_date=datetime.utcnow() - timedelta(days=15)))
            # Upcoming Project
            db.add(Assessment(course_id=course.id, title="Semester Project", type=AssessmentType.PROJECT, total_marks=100, weightage=40, due_date=datetime.utcnow() + timedelta(days=10)))
    
    db.commit()
    print(f"Seeding {count} students...")
    
    try:
        for i in range(count):
            student_id = f"STU{1000+i}"
            name = f"{random.choice(names)} {i}" if i >= len(names) else names[i]
            dept = random.choice(departments)
            
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
            db.flush()
            
            # Enroll student in 4 random courses
            my_courses = random.sample(db_courses, 4)
            for course in my_courses:
                enroll = Enrollment(student_id=student_id, course_id=course.id, semester=4, enrolled_at=datetime.utcnow() - timedelta(days=90))
                db.add(enroll)
                
                # Add some attendance records for each course
                for day in range(1, 15):
                    status = AttendanceStatus.PRESENT if random.random() > 0.15 else AttendanceStatus.ABSENT
                    db.add(AttendanceRecord(student_id=student_id, course_id=course.id, date=datetime.utcnow() - timedelta(days=day), status=status))

            # Add StudentAssessments (Marks)
            my_assessments = db.query(Assessment).filter(Assessment.course_id.in_([c.id for c in my_courses])).all()
            for assess in my_assessments:
                is_done = assess.due_date < datetime.utcnow()
                status = SubmissionStatus.GRADED if is_done else SubmissionStatus.PENDING
                obtained = random.uniform(assess.total_marks * 0.4, assess.total_marks) if is_done else None
                
                db.add(StudentAssessment(
                    student_id=student_id,
                    assessment_id=assess.id,
                    obtained_marks=obtained,
                    status=status,
                    submission_date=datetime.utcnow() - timedelta(days=5) if is_done else None
                ))
            
            is_risk = random.random() < 0.3
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
                academic_performance_index=performance,
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
