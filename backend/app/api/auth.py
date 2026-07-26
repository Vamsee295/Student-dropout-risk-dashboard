from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.core.rate_limit import limiter
from app.database.session import get_db
from app.services.auth_service import auth_service
from app.auth.security import get_current_user, revoke_token, oauth2_scheme
from app.models.user import User
from pydantic import BaseModel
from app.schemas.user import PasswordResetRequest, PasswordResetConfirm
from app.core.responses import create_success_response

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    auth_data = auth_service.login(db, email=form_data.username, password=form_data.password)
    return auth_data

@router.post("/logout")
def logout(token: str = Depends(oauth2_scheme)):
    revoke_token(token)
    return create_success_response("Logout successful")

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh")
def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    data = auth_service.refresh(db, request.refresh_token)
    return data

@router.post("/password-reset-request")
def password_reset_request(request: PasswordResetRequest, db: Session = Depends(get_db)):
    auth_service.request_password_reset(db, request.email)
    return create_success_response("Password reset email sent (simulated).")

@router.post("/password-reset-confirm")
def password_reset_confirm(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    auth_service.confirm_password_reset(db, request.token, request.new_password)
    return create_success_response("Password has been reset.")

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role.value,
        "student_id": current_user.student_id
    }
