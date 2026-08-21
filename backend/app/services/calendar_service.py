from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import date, datetime
from fastapi import HTTPException

from app.models.calendar import CalendarEvent
from app.models.academic import Enrollment
from app.schemas.calendar_schema import CalendarEventCreate, CalendarEventUpdate

class CalendarService:
    def __init__(self, db: Session):
        self.db = db

    def get_faculty_events(self, faculty_id: int) -> List[CalendarEvent]:
        """Get all events for a specific faculty member, plus global events."""
        return self.db.query(CalendarEvent).filter(
            or_(
                CalendarEvent.faculty_id == faculty_id,
                CalendarEvent.event_type.in_(['holiday', 'career_event'])
            )
        ).all()

    def get_student_events(self, student_id: int) -> List[CalendarEvent]:
        """Get events for courses the student is enrolled in, plus global events."""
        # Get course IDs the student is enrolled in
        enrolled_course_ids = [
            enrollment.course_id 
            for enrollment in self.db.query(Enrollment).filter(Enrollment.student_id == student_id).all()
        ]
        
        return self.db.query(CalendarEvent).filter(
            or_(
                CalendarEvent.course_id.in_(enrolled_course_ids) if enrolled_course_ids else False,
                CalendarEvent.event_type.in_(['holiday', 'career_event'])
            )
        ).all()

    def get_event(self, event_id: int) -> CalendarEvent:
        event = self.db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event

    def create_event(self, faculty_id: int, event_in: CalendarEventCreate) -> CalendarEvent:
        db_event = CalendarEvent(
            **event_in.model_dump(),
            faculty_id=faculty_id
        )
        self.db.add(db_event)
        self.db.commit()
        self.db.refresh(db_event)
        return db_event

    def update_event(self, event_id: int, faculty_id: int, event_in: CalendarEventUpdate) -> CalendarEvent:
        db_event = self.get_event(event_id)
        if db_event.faculty_id != faculty_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this event")
            
        update_data = event_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_event, field, value)
            
        self.db.commit()
        self.db.refresh(db_event)
        return db_event

    def delete_event(self, event_id: int, faculty_id: int):
        db_event = self.get_event(event_id)
        if db_event.faculty_id != faculty_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this event")
            
        self.db.delete(db_event)
        self.db.commit()
