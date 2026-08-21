import sys
import os
from datetime import date, time, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.calendar import CalendarEvent
from app.models.user import User
from app.models.academic import Course
from app.models.enums import Role

def seed_calendar_data():
    db: Session = SessionLocal()
    try:
        # Check if there are already calendar events
        if db.query(CalendarEvent).count() > 0:
            print("Calendar events already exist. Skipping seed.")
            return

        # Find Demo Faculty
        faculty = db.query(User).filter(User.role == Role.FACULTY).first()
        if not faculty:
            print("No faculty found. Cannot seed calendar.")
            return

        # Find a course (any course, since Course model doesn't have faculty_id directly)
        course = db.query(Course).first()

        course_id = course.id if course else None

        # Create some events
        today = date.today()
        
        events = [
            CalendarEvent(
                title="Data Structures Lecture",
                description="Chapter 4: Advanced Trees",
                event_type="class",
                date=today,
                start_time=time(10, 0),
                end_time=time(11, 30),
                faculty_id=faculty.id,
                course_id=course_id
            ),
            CalendarEvent(
                title="Office Hours",
                description="Open for student questions",
                event_type="meeting",
                date=today,
                start_time=time(14, 0),
                end_time=time(16, 0),
                faculty_id=faculty.id,
                course_id=None
            ),
            CalendarEvent(
                title="Midterm Exam",
                description="Covers chapters 1-5",
                event_type="exam",
                date=today + timedelta(days=2),
                start_time=time(9, 0),
                end_time=time(12, 0),
                faculty_id=faculty.id,
                course_id=course_id
            ),
            CalendarEvent(
                title="Assignment 3 Due",
                description="Submit via portal",
                event_type="assignment",
                date=today + timedelta(days=5),
                start_time=time(23, 59),
                end_time=time(23, 59),
                faculty_id=faculty.id,
                course_id=course_id
            ),
            CalendarEvent(
                title="University Holiday",
                description="Campus closed",
                event_type="holiday",
                date=today + timedelta(days=10),
                start_time=None,
                end_time=None,
                faculty_id=faculty.id,
                course_id=None
            ),
            CalendarEvent(
                title="Tech Career Fair",
                description="Main Auditorium",
                event_type="career_event",
                date=today + timedelta(days=15),
                start_time=time(10, 0),
                end_time=time(16, 0),
                faculty_id=faculty.id,
                course_id=None
            )
        ]

        db.bulk_save_objects(events)
        db.commit()
        print(f"Seeded {len(events)} calendar events.")

    except Exception as e:
        print(f"Error seeding calendar data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_calendar_data()
