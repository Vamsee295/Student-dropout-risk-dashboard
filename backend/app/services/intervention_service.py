from sqlalchemy.orm import Session
from app.repositories.intervention_repo import intervention_repo
from app.schemas.intervention import InterventionCreate, InterventionUpdateStatus
from app.models.audit import AuditLog
from app.core.exceptions import AppException
from datetime import datetime

class InterventionService:
    def create_intervention(self, db: Session, obj_in: InterventionCreate, faculty_id: str):
        # We might want to fetch current risk score here
        # For now, placeholder for pre_intervention_risk
        db_obj = intervention_repo.create(db, obj_in=obj_in)
        db_obj.faculty_id = faculty_id
        db_obj.pre_intervention_risk = 85.0 # Simulated
        db.commit()
        db.refresh(db_obj)
        
        # Log audit
        audit = AuditLog(
            entity_type="Intervention",
            entity_id=str(db_obj.id),
            action="CREATED",
            user_id=faculty_id,
            details={"type": db_obj.type, "priority": db_obj.priority}
        )
        db.add(audit)
        db.commit()
        return db_obj

    def get_faculty_interventions(self, db: Session, faculty_id: str):
        return intervention_repo.get_by_faculty(db, faculty_id)

    def update_status(self, db: Session, intervention_id: int, faculty_id: str, update_data: InterventionUpdateStatus):
        db_obj = intervention_repo.get(db, intervention_id)
        if not db_obj:
            raise AppException(status_code=404, detail="Intervention not found")
        
        db_obj.status = update_data.status
        if update_data.outcome_notes:
            db_obj.outcome_notes = update_data.outcome_notes
            
        if update_data.status == "Completed":
            db_obj.completed_at = datetime.utcnow()
            # In a real scenario, we recalculate risk here or fetch latest
            db_obj.post_intervention_risk = 45.0 # Simulated improvement
            
        db.commit()
        db.refresh(db_obj)
        
        # Log audit
        audit = AuditLog(
            entity_type="Intervention",
            entity_id=str(db_obj.id),
            action="STATUS_UPDATED",
            user_id=faculty_id,
            details={"new_status": update_data.status, "notes": update_data.outcome_notes}
        )
        db.add(audit)
        db.commit()
        
        return db_obj

intervention_service = InterventionService()
