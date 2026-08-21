from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date as datetime_date, time as datetime_time, datetime

class CalendarEventBase(BaseModel):
    title: str = Field(..., description="Title of the event")
    description: Optional[str] = Field(None, description="Detailed description of the event")
    event_type: str = Field(..., description="Type of event (class, exam, assignment, meeting, holiday, career_event, other)")
    date: datetime_date = Field(..., description="Date of the event")
    start_time: Optional[datetime_time] = Field(None, description="Start time of the event")
    end_time: Optional[datetime_time] = Field(None, description="End time of the event")
    course_id: Optional[str] = Field(None, description="Optional course this event is tied to")

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    date: Optional[datetime_date] = None
    start_time: Optional[datetime_time] = None
    end_time: Optional[datetime_time] = None
    course_id: Optional[str] = None

class CalendarEventResponse(CalendarEventBase):
    id: int
    faculty_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
