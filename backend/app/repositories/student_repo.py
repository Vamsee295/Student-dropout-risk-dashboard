from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate

class StudentRepository(BaseRepository[Student, StudentCreate, StudentUpdate]):
    def get_with_relations(self, db: Session, id: str) -> Optional[Student]:
        return db.query(Student).filter(Student.id == id).first()

    def get_by_department(self, db: Session, department: str) -> List[Student]:
        return db.query(Student).filter(Student.department == department).all()

student_repo = StudentRepository(Student)
