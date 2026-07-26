from pydantic import BaseModel, Field, ConfigDict, field_validator
import re
from typing import Optional
from datetime import datetime
from app.models.enums import Role

class UserBase(BaseModel):
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    name: str = Field(..., min_length=1, max_length=200)
    role: Role = Role.STUDENT
    student_id: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(
        ..., 
        min_length=8, 
        description="Password must be at least 8 characters long and contain at least one letter and one number."
    )

    @field_validator('password')
    def validate_password(cls, v):
        if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$', v):
            raise ValueError('Password must contain at least one letter and one number.')
        return v

class PasswordResetRequest(BaseModel):
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(
        ..., 
        min_length=8
    )

    @field_validator('new_password')
    def validate_password(cls, v):
        if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$', v):
            raise ValueError('Password must contain at least one letter and one number.')
        return v

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    student_id: Optional[str] = None
    name: Optional[str] = None
