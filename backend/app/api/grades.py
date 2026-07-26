from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.auth.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/")
def get_grades(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {"message": "Grades API functionality"}
