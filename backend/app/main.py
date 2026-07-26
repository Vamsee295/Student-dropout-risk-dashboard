from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.core.config import get_settings
from app.core.exceptions import (
    AppException, app_exception_handler,
    validation_exception_handler, sqlalchemy_exception_handler,
    general_exception_handler
)
from app.api import api_router
from app.api.health import router as health_router

from contextlib import asynccontextmanager
from app.database.session import SessionLocal
from app.repositories.mlops_repo import mlops_repo
from app.ml.model_loader import model_loader
from app.core.logger import setup_logging

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.core.rate_limit import limiter

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup structured JSON logging
    setup_logging()
    
    # On startup, load the active ML model
    db = SessionLocal()
    try:
        active_model = mlops_repo.get_active_model(db)
        if active_model:
            model_loader.reload(active_model.version)
            logging.info(f"Loaded active model version: {active_model.version}")
        else:
            model_loader.reload() # fallback to best_model.joblib
            logging.info("No active model found in DB, loaded fallback.")
    except Exception as e:
        logging.error(f"Failed to load ML model on startup: {e}")
    finally:
        db.close()
    yield
    # Cleanup on shutdown can go here

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for Student Dropout Risk Analytics System",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include API Router
app.include_router(health_router)
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to EduRisk AI API", "status": "online"}
