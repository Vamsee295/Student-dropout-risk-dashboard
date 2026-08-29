from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database.session import get_db
from app.auth.security import get_current_user
from app.models.notification import Notification
from app.models.user import User
from app.models.enums import Role
from app.services.notification_service import notification_service
from app.schemas.notification import NotificationResponse
from app.core.responses import create_success_response
import asyncio

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class SendNotificationBody(BaseModel):
    user_id: str          # target user id (string FK to users.id)
    title: str
    message: str
    type: str = "GENERAL"


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the count of unread notifications for the authenticated user."""
    count = db.query(func.count(Notification.id)).filter(
        Notification.user_id == str(current_user.id),
        Notification.is_read == False,  # noqa: E712
    ).scalar() or 0
    return {"unread_count": count}


@router.get("/", response_model=dict)
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all notifications for the authenticated user."""
    notifs = db.query(Notification).filter(
        Notification.user_id == str(current_user.id)
    ).order_by(Notification.created_at.desc()).limit(50).all()
    return create_success_response(
        "Notifications retrieved",
        [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.type,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
            }
            for n in notifs
        ],
    )


@router.put("/{notification_id}/read", response_model=dict)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == str(current_user.id),
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return create_success_response("Notification marked as read", {"id": notif.id, "is_read": True})


@router.put("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all unread notifications as read."""
    db.query(Notification).filter(
        Notification.user_id == str(current_user.id),
        Notification.is_read == False,  # noqa: E712
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.post("/send")
def send_notification(
    body: SendNotificationBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Faculty/Admin can push a notification to a specific user."""
    if current_user.role not in (Role.FACULTY, Role.DEAN, Role.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized")

    notif = Notification(
        user_id=body.user_id,
        title=body.title,
        message=body.message,
        type=body.type,
        is_read=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    # Async broadcast — fire and forget
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(
                notification_service.create_and_broadcast(
                    db, body.user_id, body.title, body.message, body.type
                )
            )
    except Exception:
        pass  # WS broadcast failure must not break the REST response

    return {"id": notif.id, "message": "Notification sent"}
