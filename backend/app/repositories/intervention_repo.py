from sqlalchemy.orm import Session
from app.models.intervention import Intervention
from app.schemas.intervention import InterventionCreate
from app.repositories.base import BaseRepository

class InterventionRepository(BaseRepository[Intervention, InterventionCreate, dict]):
    def __init__(self):
        super().__init__(Intervention)

    def get_by_faculty(self, db: Session, faculty_id: str, skip: int = 0, limit: int = 50):
        return db.query(Intervention).filter(Intervention.faculty_id == faculty_id).offset(skip).limit(limit).all()

    def get_by_student(self, db: Session, student_id: str):
        return db.query(Intervention).filter(Intervention.student_id == student_id).all()

intervention_repo = InterventionRepository()
