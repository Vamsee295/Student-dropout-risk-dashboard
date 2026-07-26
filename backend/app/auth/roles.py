from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.models.enums import Role
from app.auth.security import get_current_user

def require_role(allowed_roles: list[Role]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return current_user
    return role_checker

require_dean = require_role([Role.DEAN, Role.ADMIN])
require_faculty = require_role([Role.FACULTY, Role.DEAN, Role.ADMIN])
