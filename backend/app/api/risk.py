from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database.session import get_db
from app.core.rate_limit import limiter
from app.auth.security import get_current_user
from app.auth.roles import require_faculty, require_dean
from app.core.responses import create_success_response
from app.ml.predict import predict_risk, bulk_predict_risk
from app.ml.train import train_models
from app.ml.model_loader import model_loader
from app.schemas.analytics import RiskScoreResponse
from app.models.analytics import RiskScore, RiskHistory
from app.models.student import Student
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

@router.get("/faculty/summary")
def get_faculty_risk_summary(db: Session = Depends(get_db), current_user = Depends(require_faculty)):
    distribution = db.query(RiskScore.risk_level, func.count(RiskScore.id)).group_by(RiskScore.risk_level).all()
    dist_dict = {
        "High Risk": 0,
        "Moderate Risk": 0,
        "Stable": 0,
        "Safe": 0
    }
    for k, v in distribution:
        dist_dict[k.value] = v
    
    top_risk = db.query(RiskScore, Student).join(Student, RiskScore.student_id == Student.id).order_by(desc(RiskScore.risk_score)).limit(10).all()
    
    predicted_dropouts = []
    for rs, st in top_risk:
        if rs.risk_level.value in ["High Risk", "Moderate Risk"]:
            reasons = []
            if rs.shap_explanation and isinstance(rs.shap_explanation, dict):
                reasons = [f.get("feature", "").replace("_", " ").title() for f in rs.shap_explanation.get("top_factors", [])[:3]]
                
            predicted_dropouts.append({
                "student_id": st.id,
                "name": st.name,
                "roll": st.id,
                "probability": float(rs.risk_score),
                "expectedDate": "End of Semester",
                "confidence": "High" if rs.risk_score > 70 else "Medium",
                "reasons": reasons
            })
            
    return create_success_response("Faculty summary fetched", {
        "distribution": dist_dict,
        "predictedDropouts": predicted_dropouts,
        "total_analyzed": sum(dist_dict.values())
    })

@router.get("/{student_id}")
def get_student_risk(student_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Fetch from database
    risk_score = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
    if not risk_score:
        # Fallback to safe
        return create_success_response("Risk score fetched (placeholder)", {
            "student_id": student_id,
            "risk_score": 14,
            "risk_level": "Safe",
            "risk_trend": "Stable",
            "shap_explanation": {"top_factors": []},
            "history": []
        })

    # Fetch history
    history = db.query(RiskHistory).filter(RiskHistory.student_id == student_id).order_by(desc(RiskHistory.assessed_at)).limit(6).all()
    history_data = [{"month": h.assessed_at.strftime("%b"), "risk": h.risk_score} for h in reversed(history)]

    return create_success_response("Risk score fetched", {
        "student_id": risk_score.student_id,
        "risk_score": float(risk_score.risk_score),
        "risk_level": risk_score.risk_level.value,
        "risk_trend": risk_score.risk_trend.value,
        "shap_explanation": risk_score.shap_explanation,
        "history": history_data
    })

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
