from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.sql import func
from app.database.session import Base

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    faculty_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    
    type = Column(String(100), nullable=False)  # e.g., Academic Counseling, Mentoring
    priority = Column(String(50), default="Medium") # High, Medium, Low
    status = Column(String(50), default="Assigned") # Assigned, In Progress, Completed, Cancelled
    
    start_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    notes = Column(Text, nullable=True)
    outcome_notes = Column(Text, nullable=True)
    
    pre_intervention_risk = Column(Float, nullable=True)
    post_intervention_risk = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    from sqlalchemy.orm import relationship
    student = relationship("Student", back_populates="interventions")
