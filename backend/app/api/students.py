from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.student_service import student_service
from app.auth.security import get_current_user
from app.auth.roles import require_faculty, require_dean
from app.core.responses import create_success_response
from app.schemas.student import StudentCreate

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/")
def get_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(require_faculty)):
    students = student_service.get_students(db, skip=skip, limit=limit)
    return create_success_response("Students fetched successfully", students)

@router.get("/{student_id}")
def get_student(student_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    student = student_service.get_student_by_id(db, student_id)
    return create_success_response("Student fetched successfully", student)

@router.post("/")
def create_student(student_in: StudentCreate, db: Session = Depends(get_db), current_user = Depends(require_dean)):
    student = student_service.create_student(db, student_in)
    return create_success_response("Student created successfully", student)

@router.put("/{student_id}")
def update_student(student_id: str, db: Session = Depends(get_db), current_user = Depends(require_dean)):
    return create_success_response("Student updated successfully")

@router.delete("/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db), current_user = Depends(require_dean)):
    return create_success_response("Student deleted successfully")
