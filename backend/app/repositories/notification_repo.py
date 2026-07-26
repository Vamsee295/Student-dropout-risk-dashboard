from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
from app.repositories.base import BaseRepository

class NotificationRepository(BaseRepository[Notification, NotificationCreate, NotificationCreate]):
    def __init__(self):
        super().__init__(Notification)

    def get_by_user(self, db: Session, user_id: str, skip: int = 0, limit: int = 50):
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    def mark_as_read(self, db: Session, notification_id: int, user_id: str):
        notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
        if notif:
            notif.is_read = True
            db.commit()
            db.refresh(notif)
        return notif

notification_repo = NotificationRepository()
