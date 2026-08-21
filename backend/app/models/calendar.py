from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, date, time
from app.database.session import Base

class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    event_type = Column(String) # class, exam, assignment, meeting, holiday, career_event, other
    
    date = Column(Date, index=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    
    faculty_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    faculty = relationship("User")
    course = relationship("Course")
