"""
FastAPI Main Application for Student Dropout Risk Analytics System.

Production-ready backend with:
- PostgreSQL database
- XGBoost ML model
- SHAP explainability
- Real-time risk computation
- Scheduled retraining
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import sys

from app.config import get_settings
from app.database import init_db
from app.database import init_db
from app.routes import students, prediction, analytics, performance, engagement, auth, student_dashboard, faculty_dashboard

# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level=get_settings().log_level
)

logger.add(
    "logs/app.log",
    rotation="500 MB",
    retention="10 days",
    level="INFO"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    logger.info("Starting Student Dropout Risk Analytics System...")
    
    # Initialize database
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    # TODO: Load active ML model
    # This will be done in the scripts/train_model.py
    
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")


# Create FastAPI app
app = FastAPI(
    title=get_settings().app_name,
    version=get_settings().app_version,
    description="""
    Production-ready ML-powered Student Dropout Risk Analytics System.
    
    Features:
    - Real-time risk prediction with XGBoost
    - SHAP explainability for every prediction
    - Automatic risk recalculation on metrics update
    - Department-level analytics
    - Intervention tracking with feedback loop
    - Model versioning and scheduled retraining
    """,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(students.router, prefix="/api", tags=["Students"])
app.include_router(prediction.router, prefix="/api", tags=["Prediction"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
# app.include_router(interventions.router, prefix="/api/interventions", tags=["Interventions"])  # TODO: Create interventions.py route file
app.include_router(performance.router, prefix="/api/performance", tags=["Performance"])
app.include_router(engagement.router, prefix="/api/engagement", tags=["Engagement"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(student_dashboard.router)
app.include_router(faculty_dashboard.router)

# Frontend integration router
from app.routes import frontend
app.include_router(frontend.router, tags=["Frontend"])


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Student Dropout Risk Analytics API",
        "version": get_settings().app_version,
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns system health status including database and model status.
    """
    from app.database import SessionLocal
    from app.models import ModelVersion
    
    # Check database
    db_status = "healthy"
    model_loaded = False
    active_model_version = None
    
    try:
        db = SessionLocal()
        # Try to query database
        active_model = db.query(ModelVersion).filter(
            ModelVersion.is_active == True
        ).first()
        
        if active_model:
            model_loaded = True
            active_model_version = active_model.version
        
        db.close()
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        db_status = "unhealthy"
    
    return {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "database": db_status,
        "model_loaded": model_loaded,
        "active_model_version": active_model_version
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
