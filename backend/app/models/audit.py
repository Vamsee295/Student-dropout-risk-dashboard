from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from app.database.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False) # e.g. "Intervention"
    entity_id = Column(String(50), nullable=False) # e.g. "12"
    action = Column(String(50), nullable=False) # e.g. "CREATED", "UPDATED", "CLOSED"
    
    user_id = Column(String(50), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    details = Column(JSON, nullable=True) # To store before/after states
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
