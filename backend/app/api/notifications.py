from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.auth.security import get_current_user
from app.services.notification_service import notification_service
from app.schemas.notification import NotificationResponse
from app.core.responses import create_success_response

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=dict)
def get_my_notifications(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    notifs = notification_service.get_user_notifications(db, current_user.id)
    return create_success_response("Notifications retrieved", [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        } for n in notifs
    ])

@router.put("/{notification_id}/read", response_model=dict)
def mark_notification_read(notification_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    notif = notification_service.mark_as_read(db, notification_id, current_user.id)
    return create_success_response("Notification marked as read", {"id": notif.id, "is_read": notif.is_read})
