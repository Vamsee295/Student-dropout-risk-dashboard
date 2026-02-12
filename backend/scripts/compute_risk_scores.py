"""
Compute risk scores for all students in the database.
This script loads all students and their metrics, then computes risk scores using the trained model.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal
from app.services.risk_model import RiskModel
from app.services.shap_explainer import SHAPExplainer
from app.services.feature_engineering import FeatureEngineer
from app.models import Student, StudentMetric, RiskScore
import pandas as pd
from datetime import datetime
from loguru import logger

def compute_all_risk_scores():
    """Compute risk scores for all students."""
    db = SessionLocal()
    
    try:
        logger.info("Loading model...")
        risk_model = RiskModel()
        risk_model.load()
        
        logger.info("Initializing SHAP explainer...")
        shap_explainer = SHAPExplainer(risk_model.model)
        fe = FeatureEngineer()
        
        logger.info("Fetching all students...")
        students = db.query(Student).all()
        logger.info(f"Found {len(students)} students")
        
        count = 0
        for student in students:
            # Get student metrics
            metrics = db.query(StudentMetric).filter(StudentMetric.student_id == student.id).first()
            
            if not metrics:
                logger.warning(f"No metrics found for student {student.id}")
                continue
            
            # Extract raw data from metrics
            raw_data = {}
            for col in metrics.__table__.columns.keys():
                if col not in ['id', 'student_id', 'created_at', 'updated_at']:
                    raw_data[col] = getattr(metrics, col)
            
            # Engineer features
            features = fe.engineer_features(raw_data)
            features_df = pd.DataFrame([features])
            
            # Predict risk
            risk_prob = risk_model.predict(features_df)
            risk_score = float(risk_prob[0] * 100)
            
            # Determine risk level
            if risk_score > 75:
                risk_level = 'High Risk'
            elif risk_score > 50:
                risk_level = 'Moderate Risk'
            elif risk_score > 25:
                risk_level = 'Stable'
            else:
                risk_level = 'Safe'
            
            # Get SHAP explanation
            shap_factors = shap_explainer.explain(features_df, top_n=5)
            
            # Check if risk score already exists
            existing = db.query(RiskScore).filter(RiskScore.student_id == student.id).first()
            
            if existing:
                existing.risk_score = risk_score
                existing.risk_level = risk_level
                existing.top_factors = str(shap_factors)
                existing.updated_at = datetime.utcnow()
            else:
                risk_score_obj = RiskScore(
                    student_id=student.id,
                    risk_score=risk_score,
                    risk_level=risk_level,
                    top_factors=str(shap_factors)
                )
                db.add(risk_score_obj)
            
            count += 1
            if count % 10 == 0:
                logger.info(f"Processed {count}/{len(students)} students...")
                db.commit()
        
        db.commit()
        logger.info(f"✓ Successfully computed risk scores for all {count} students")
        
    except Exception as e:
        logger.error(f"Error computing risk scores: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    compute_all_risk_scores()
