from sqlalchemy.orm import Session
from app.repositories.student_repo import student_repo
from app.schemas.student import StudentCreate
from app.core.exceptions import AppException

class StudentService:
    def get_students(self, db: Session, skip: int = 0, limit: int = 100):
        return student_repo.get_multi(db, skip=skip, limit=limit)
        
    def get_student_by_id(self, db: Session, student_id: str):
        student = student_repo.get_with_relations(db, id=student_id)
        if not student:
            raise AppException("Student not found", error_code="STUDENT_NOT_FOUND", status_code=404)
        return student
        
    def create_student(self, db: Session, student_in: StudentCreate):
        existing = student_repo.get(db, id=student_in.id)
        if existing:
            raise AppException("Student already exists", error_code="STUDENT_EXISTS", status_code=400)
        return student_repo.create(db, obj_in=student_in)

student_service = StudentService()
