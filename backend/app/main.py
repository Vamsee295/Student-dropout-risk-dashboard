"""
FastAPI Main Application — Student Dropout Risk Analytics System.

Startup sequence:
  1. init_db()            — create all tables (idempotent)
  2. Load XGBoost model   — from ml_models/ or models/versions/
  3. Bootstrap ModelVersion row if none exists
  4. Init SHAPExplainer
  5. init_prediction_service() — registers module-level singletons
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.config import get_settings
from app.database import SessionLocal, init_db
from app.routes import (
    analytics,
    auth,
    engagement,
    faculty_dashboard,
    frontend,
    performance,
    prediction,
    student_dashboard,
    students,
)
from app.services.realtime_prediction import init_prediction_service
from app.services.risk_model import RiskModel
from app.services.shap_explainer import SHAPExplainer

import sys
settings = get_settings()

# ── Logging ──────────────────────────────────────────────────────────────────
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | "
           "<cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level=settings.log_level,
)
logger.add(
    "logs/app.log",
    rotation="500 MB",
    retention="10 days",
    level="INFO",
)


# ─────────────────────────────────────────────────────────────────────────────
# Model loading helpers
# ─────────────────────────────────────────────────────────────────────────────

_MODEL_SEARCH_PATHS = [
    # Pre-built joblib from ml_models/ directory
    Path(__file__).resolve().parent.parent / "ml_models" / "dropout_risk_model.joblib",
    # Any trained .pkl in models/versions/ (pick newest)
]

def _find_model_path() -> Path:
    # 1. Hard-wired pre-built joblib
    for p in _MODEL_SEARCH_PATHS:
        if p.exists():
            return p

    # 2. Scan models/versions/ for newest .pkl
    versions_dir = Path(settings.models_dir)
    if versions_dir.exists():
        pkls = sorted(versions_dir.glob("*.pkl"), key=lambda f: f.stat().st_mtime, reverse=True)
        if pkls:
            return pkls[0]

    raise FileNotFoundError(
        "No model file found. Expected ml_models/dropout_risk_model.joblib "
        "or a .pkl in models/versions/."
    )


def _ensure_model_version(db, model_path: str, risk_model: RiskModel) -> int:
    """
    Insert a bootstrap ModelVersion row if none is active.
    Returns the active model version id.
    """
    from app.models import ModelVersion

    active = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
    if active:
        return active.id

    # Create bootstrap entry
    logger.info("No active ModelVersion found — inserting bootstrap record")
    mv = ModelVersion(
        version="bootstrap_v1",
        model_path=str(model_path),
        accuracy=0.0,
        precision=0.0,
        recall=0.0,
        f1_score=0.0,
        training_samples=0,
        feature_importance=risk_model.feature_names,
        is_active=True,
    )
    db.add(mv)
    db.commit()
    db.refresh(mv)
    logger.info(f"Bootstrap ModelVersion created with id={mv.id}")
    return mv.id


# ─────────────────────────────────────────────────────────────────────────────
# Lifespan
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and graceful shutdown."""

    logger.info("=" * 60)
    logger.info("Student Dropout Risk Analytics — starting up")
    logger.info("=" * 60)

    # 1. Database
    try:
        init_db()
        logger.info("✓ Database tables created/verified")
    except Exception as exc:
        logger.critical(f"Database init failed: {exc}")
        raise

    # 2. Load ML model
    db = SessionLocal()
    try:
        model_path = _find_model_path()
        logger.info(f"Loading model from {model_path}")

        raw_model = joblib.load(str(model_path))

        # Wrap in RiskModel.  The pre-built joblib is a CalibratedClassifierCV.
        risk_model = RiskModel()
        risk_model.calibrated_model = raw_model

        # If the joblib held the base XGBoost model directly, calibrate wrapper is
        # still fine — predict_proba will be called on whatever was loaded.
        logger.info("✓ ML model loaded")

        # 3. Ensure ModelVersion row exists
        model_version_id = _ensure_model_version(db, str(model_path), risk_model)

        # 4. Init SHAP explainer
        try:
            shap_explainer = SHAPExplainer(raw_model)
            logger.info("✓ SHAP explainer initialized")
        except Exception as exc:
            logger.warning(f"SHAP init failed (explanations will be empty): {exc}")
            shap_explainer = None

        # 5. Register singletons
        init_prediction_service(risk_model, shap_explainer, model_version_id)
        logger.info("✓ Prediction service registered")

        # Store on app state for potential direct access in routes
        app.state.risk_model = risk_model
        app.state.shap_explainer = shap_explainer
        app.state.model_version_id = model_version_id

    except FileNotFoundError as exc:
        logger.error(f"Model file not found: {exc}. Risk prediction will fail.")
    except Exception as exc:
        logger.error(f"Model loading failed: {exc}. Risk prediction will fail.")
    finally:
        db.close()

    logger.info("✓ Application startup complete")
    logger.info("=" * 60)

    yield

    logger.info("Application shutting down...")


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Production ML-powered Student Dropout Risk Analytics System. "
        "Real-time XGBoost + SHAP explainability. "
        "All data sourced from MySQL via SQLAlchemy ORM."
    ),
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api", tags=["Students"])
app.include_router(prediction.router, prefix="/api", tags=["Prediction"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(performance.router, prefix="/api/performance", tags=["Performance"])
app.include_router(engagement.router, prefix="/api/engagement", tags=["Engagement"])
app.include_router(student_dashboard.router)
app.include_router(faculty_dashboard.router)   # /api/faculty/*
app.include_router(frontend.router, tags=["Frontend"])


# ── Root & health ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Student Dropout Risk Analytics API",
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    from app.models import ModelVersion

    db_status = "healthy"
    model_loaded = False
    active_model_version = None

    try:
        db = SessionLocal()
        active = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
        if active:
            model_loaded = True
            active_model_version = active.version
        db.close()
    except Exception as exc:
        logger.error(f"Health check DB error: {exc}")
        db_status = "unhealthy"

    return {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "database": db_status,
        "model_loaded": model_loaded,
        "active_model_version": active_model_version,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
