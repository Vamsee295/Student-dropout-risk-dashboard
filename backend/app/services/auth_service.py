from sqlalchemy.orm import Session
from app.repositories.user_repo import user_repo
from app.auth.security import verify_password, create_access_token, create_refresh_token
from app.core.exceptions import AppException
from jose import jwt, JWTError
from app.core.config import get_settings
from datetime import timedelta

settings = get_settings()

class AuthService:
    def login(self, db: Session, email: str, password: str) -> dict:
        user = user_repo.get_by_email(db, email=email)
        if not user or not verify_password(password, user.password_hash):
            raise AppException("Incorrect email or password", error_code="INVALID_CREDENTIALS", status_code=401)
            
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role.value}
        )
        refresh_token = create_refresh_token(
            data={"sub": user.email, "role": user.role.value}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role.value,
                "student_id": user.student_id,
            }
        }

    def refresh(self, db: Session, refresh_token: str) -> dict:
        try:
            payload = jwt.decode(refresh_token, settings.secret_key, algorithms=[settings.algorithm])
            email: str = payload.get("sub")
            token_type: str = payload.get("type")
            if email is None or token_type != "refresh":
                raise AppException("Invalid refresh token", status_code=401)
        except JWTError:
            raise AppException("Invalid refresh token", status_code=401)
            
        user = user_repo.get_by_email(db, email=email)
        if not user:
            raise AppException("User not found", status_code=401)
            
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role.value}
        )
        new_refresh_token = create_refresh_token(
            data={"sub": user.email, "role": user.role.value}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }

    def request_password_reset(self, db: Session, email: str) -> None:
        user = user_repo.get_by_email(db, email=email)
        if not user:
            # Prevent email enumeration by returning success anyway
            return
            
        # In a real app, send an email with a secure token.
        # Here we simulate by logging it.
        reset_token = create_access_token(data={"sub": user.email, "type": "reset"}, expires_delta=timedelta(hours=1))
        import logging
        logging.info(f"Password reset requested for {email}. Token: {reset_token}")
        
    def confirm_password_reset(self, db: Session, token: str, new_password: str) -> None:
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            email: str = payload.get("sub")
            token_type: str = payload.get("type")
            if email is None or token_type != "reset":
                raise AppException("Invalid reset token", status_code=400)
        except JWTError:
            raise AppException("Invalid reset token", status_code=400)
            
        user = user_repo.get_by_email(db, email=email)
        if not user:
            raise AppException("User not found", status_code=404)
            
        from app.auth.security import get_password_hash
        user.password_hash = get_password_hash(new_password)
        db.commit()

auth_service = AuthService()
