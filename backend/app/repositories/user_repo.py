from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.user import User
from app.schemas.user import UserCreate, UserBase

class UserRepository(BaseRepository[User, UserCreate, UserBase]):
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

user_repo = UserRepository(User)
