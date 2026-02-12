"""
Prediction API routes for real-time risk prediction.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from loguru import logger

from app.database import get_db
from app.models import ModelVersion
from app.schemas import PredictionRequest, RiskExplanation
from app.services.risk_model import RiskModel
from app.services.shap_explainer import SHAPExplainer
from app.services.feature_engineering import FeatureEngineer

router = APIRouter()


@router.post("/predict", response_model=RiskExplanation)
def predict_risk(
    request: PredictionRequest,
    db: Session = Depends(get_db)
):
    """
    Real-time risk prediction for new or hypothetical student data.
    
    Returns:
    - risk_score: 0-100 calibrated score
    - risk_level: High/Moderate/Stable/Safe
    - top_factors: SHAP explanation of top contributing features
    """
    logger.info(f"Prediction request for student {request.student_id}")
    
    # Load active model
    active_model = db.query(ModelVersion).filter(
        ModelVersion.is_active == True
    ).first()
    
    if not active_model:
        raise HTTPException(status_code=500, detail="No active model found")
    
    try:
        # Load model
        risk_model = RiskModel()
        risk_model.load(active_model.model_path)
        
        # Prepare features
        feature_engineer = FeatureEngineer()
        features_df = feature_engineer.prepare_ml_features(
            request.metrics.model_dump()
        )
        
        # Get prediction
        risk_prediction = risk_model.predict_risk_score(features_df)
        
        # Get SHAP explanation
        try:
            shap_explainer = SHAPExplainer(risk_model.calibrated_model)
            shap_factors = shap_explainer.explain(features_df, top_n=5)
        except Exception as e:
            logger.warning(f"SHAP explanation failed: {e}")
            shap_factors = []
        
        return RiskExplanation(
            risk_score=risk_prediction['risk_score'],
            risk_level=risk_prediction['risk_level'],
            top_factors=shap_factors
        )
        
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
