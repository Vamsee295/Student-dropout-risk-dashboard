from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str

class NotificationCreate(NotificationBase):
    user_id: str

class NotificationResponse(NotificationBase):
    id: int
    user_id: str
    is_read: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
