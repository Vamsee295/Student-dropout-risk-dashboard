from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.auth.security import get_current_user
from app.models.user import User
from app.models.enums import Role
from app.schemas.calendar_schema import CalendarEventCreate, CalendarEventUpdate, CalendarEventResponse
from app.services.calendar_service import CalendarService
from app.websocket.manager import manager

router = APIRouter(prefix="/calendar", tags=["Calendar"])

def get_calendar_service(db: Session = Depends(get_db)):
    return CalendarService(db)

@router.get("", response_model=List[CalendarEventResponse])
def get_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: CalendarService = Depends(get_calendar_service)
):
    if current_user.role == Role.FACULTY:
        return service.get_faculty_events(current_user.id)
    elif current_user.role == Role.STUDENT:
        return service.get_student_events(current_user.student_id)
    else:
        # Defaults to empty for now
        return []

@router.post("", response_model=CalendarEventResponse)
async def create_event(
    event_in: CalendarEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: CalendarService = Depends(get_calendar_service)
):
    if current_user.role != Role.FACULTY:
        raise HTTPException(status_code=403, detail="Only faculty can create events")
        
    event = service.create_event(current_user.id, event_in)
    
    # Broadcast update
    await manager.broadcast("calendar", {"type": "calendar_update"})
    
    return event

@router.put("/{event_id}", response_model=CalendarEventResponse)
async def update_event(
    event_id: int,
    event_in: CalendarEventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: CalendarService = Depends(get_calendar_service)
):
    if current_user.role != Role.FACULTY:
        raise HTTPException(status_code=403, detail="Only faculty can update events")
        
    event = service.update_event(event_id, current_user.id, event_in)
    
    # Broadcast update
    await manager.broadcast("calendar", {"type": "calendar_update"})
    
    return event

@router.delete("/{event_id}")
async def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: CalendarService = Depends(get_calendar_service)
):
    if current_user.role != Role.FACULTY:
        raise HTTPException(status_code=403, detail="Only faculty can delete events")
        
    service.delete_event(event_id, current_user.id)
    
    # Broadcast update
    await manager.broadcast("calendar", {"type": "calendar_update"})
    
    return {"message": "Event deleted successfully"}
