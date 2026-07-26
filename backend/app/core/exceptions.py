from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.core.responses import create_error_response

class AppException(Exception):
    def __init__(self, message: str, error_code: str = "BAD_REQUEST", status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code

async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content=create_error_response(exc.message, exc.error_code).model_dump()
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=create_error_response(
            message="Validation error",
            error_code="VALIDATION_ERROR",
            data=exc.errors()
        ).model_dump()
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=create_error_response(
            message="Database error occurred",
            error_code="DATABASE_ERROR"
        ).model_dump()
    )

async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=create_error_response(
            message="An unexpected error occurred",
            error_code="INTERNAL_SERVER_ERROR"
        ).model_dump()
    )
