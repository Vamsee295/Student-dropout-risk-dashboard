from typing import Any, Generic, TypeVar, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    errorCode: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

def create_success_response(message: str, data: Any = None) -> StandardResponse:
    return StandardResponse(success=True, message=message, data=data)

def create_error_response(message: str, error_code: str = "INTERNAL_ERROR", data: Any = None) -> StandardResponse:
    return StandardResponse(success=False, message=message, errorCode=error_code, data=data)
