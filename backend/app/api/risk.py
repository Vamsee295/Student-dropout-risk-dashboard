from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.rate_limit import limiter
from app.auth.security import get_current_user
from app.auth.roles import require_faculty, require_dean
from app.core.responses import create_success_response
from app.ml.predict import predict_risk, bulk_predict_risk
from app.ml.train import train_models
from app.ml.model_loader import model_loader
from app.schemas.analytics import RiskScoreResponse
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/risk", tags=["Risk Prediction"])

class PredictionRequest(BaseModel):
    student_id: str
    attendance_percentage: float
    cgpa: float
    previous_semester_cgpa: float
    lms_login_frequency: int
    total_assignments: int
    assignments_completed: int
    department: str

class BulkPredictionRequest(BaseModel):
    students: List[PredictionRequest]

@router.post("/predict")
@limiter.limit("100/minute")
def predict_student_risk(request: Request, pred_request: PredictionRequest, current_user = Depends(require_faculty)):
    try:
        prediction = predict_risk(pred_request.model_dump())
        return create_success_response("Prediction generated successfully", prediction)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/bulk-predict")
@limiter.limit("100/minute")
def bulk_predict_students_risk(request: Request, bulk_request: BulkPredictionRequest, current_user = Depends(require_faculty)):
    try:
        predictions = bulk_predict_risk([s.model_dump() for s in bulk_request.students])
        return create_success_response("Bulk predictions generated successfully", predictions)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk prediction failed: {str(e)}")

@router.post("/retrain")
def retrain_model(current_user = Depends(require_dean)):
    try:
        # In a real system, this might be triggered asynchronously using Celery/BackgroundTasks
        # and pull data from the MySQL DB instead of synthetic data.
        train_models()
        model_loader.reload()
        return create_success_response("Model retrained successfully with synthetic data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")

@router.get("/{student_id}")
def get_student_risk(student_id: str, db: Session = Depends(get_db), current_user = Depends(require_faculty)):
    # This would normally pull from the database's cached risk score
    # For now, we return a placeholder or trigger a live prediction if data exists
    # Assuming the dashboard will use POST /predict if it wants a live one
    return create_success_response("Risk score fetched (placeholder)", {"studentId": student_id, "riskLevel": "Unknown"})

@router.get("/model/status")
def get_model_status(current_user = Depends(require_faculty)):
    is_loaded = model_loader.is_loaded
    metadata = model_loader.get_metadata() if is_loaded else None
    return create_success_response("Model status fetched", {
        "is_loaded": is_loaded,
        "metadata": metadata
    })

@router.get("/model/metrics")
def get_model_metrics(current_user = Depends(require_faculty)):
    import os
    import json
    # Read the latest evaluation metrics from saved_models
    metrics_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "saved_models", "RandomForest_evaluation.json")
    if not os.path.exists(metrics_path):
        metrics_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "saved_models", "LogisticRegression_evaluation.json")
        
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            metrics = json.load(f)
        return create_success_response("Model metrics fetched", metrics)
    return create_success_response("No metrics found", {})
