from sqlalchemy.orm import Session
from app.repositories.notification_repo import notification_repo
from app.schemas.notification import NotificationCreate
from app.websocket.manager import manager
from app.core.exceptions import AppException
import asyncio

class NotificationService:
    async def create_and_broadcast(self, db: Session, user_id: str, title: str, message: str, type: str):
        # 1. Save to database
        notif_in = NotificationCreate(user_id=user_id, title=title, message=message, type=type)
        notif = notification_repo.create(db, obj_in=notif_in)
        
        # 2. Broadcast over WebSockets
        channel = f"student_{user_id}" # Assuming student for now, could be faculty
        # We also might broadcast to a general 'notifications' channel
        payload = {
            "id": notif.id,
            "title": notif.title,
            "message": notif.message,
            "type": notif.type,
            "is_read": notif.is_read,
            "created_at": notif.created_at.isoformat()
        }
        await manager.broadcast_multiple([channel, "notifications"], payload)
        return notif

    def get_user_notifications(self, db: Session, user_id: str):
        return notification_repo.get_by_user(db, user_id)

    def mark_as_read(self, db: Session, notification_id: int, user_id: str):
        notif = notification_repo.mark_as_read(db, notification_id, user_id)
        if not notif:
            raise AppException(status_code=404, detail="Notification not found")
        return notif

notification_service = NotificationService()
