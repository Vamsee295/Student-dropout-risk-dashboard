from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base
from app.models.enums import Role

class User(Base):
    """User account for authentication."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(200), nullable=False)
    role = Column(SQLEnum(Role), nullable=False, default=Role.STUDENT)
    is_active = Column(Boolean, default=True)
    
    student_id = Column(String(50), ForeignKey("students.id"), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationship
    student = relationship("Student", back_populates="user_account")
