"""
Real-Time Risk Prediction Service.

Provides functions to compute risk scores for students in real-time,
integrating ML model predictions with SHAP explanations.
"""

from typing import Dict, Any, Optional
import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime
from loguru import logger

from app.models import (
    Student, StudentMetric, RiskScore, RiskHistory, 
    ModelVersion, RiskLevel, RiskTrend
)
from app.services.risk_model import RiskModel
from app.services.shap_explainer import SHAPExplainer


class RealtimePredictionService:
    """Service for real-time risk predictions."""
    
    def __init__(self, db: Session):
        self.db = db
        self.risk_model = None
        self.shap_explainer = None
        self._load_active_model()
    
    def _load_active_model(self):
        """Load the active ML model from database."""
        active_model = self.db.query(ModelVersion).filter(
            ModelVersion.is_active == True
        ).first()
        
        if not active_model:
            raise ValueError("No active model found. Run train_model.py first.")
        
        logger.info(f"Loading active model: {active_model.version}")
        
        # Load the model
        self.risk_model = RiskModel()
        self.risk_model.load(active_model.model_path)
        
        # Initialize SHAP explainer
        self.shap_explainer = SHAPExplainer(self.risk_model.calibrated_model)
        
        self.active_model_version = active_model
        logger.info(f"✓ Model {active_model.version} loaded successfully")
    
    def _extract_features(self, student_metric: StudentMetric) -> pd.DataFrame:
        """
        Extract features for ML prediction.
        
        Args:
            student_metric: StudentMetric instance
            
        Returns:
            DataFrame with single row of features
        """
        features = {
            'attendance_rate': student_metric.attendance_rate,
            'engagement_score': student_metric.engagement_score,
            'academic_performance_index': student_metric.academic_performance_index,
            'login_gap_days': student_metric.login_gap_days,
            'failure_ratio': student_metric.failure_ratio,
            'financial_risk_flag': int(student_metric.financial_risk_flag),
            'commute_risk_score': student_metric.commute_risk_score,
            'semester_performance_trend': student_metric.semester_performance_trend
        }
        
        return pd.DataFrame([features])
    
    def compute_student_risk(
        self, 
        student_id: str,
        save_to_db: bool = True
    ) -> Dict[str, Any]:
        """
        Compute risk score for a single student.
        
        Args:
            student_id: Student ID
            save_to_db: Whether to save results to database
            
        Returns:
            Dictionary with risk prediction and SHAP explanation
        """
        logger.info(f"Computing risk for student {student_id}")
        
        # Get student and metrics
        student = self.db.query(Student).filter(Student.id == student_id).first()
        if not student or not student.metrics:
            raise ValueError(f"Student {student_id} not found or has no metrics")
        
        # Extract features
        X = self._extract_features(student.metrics)
        
        # Get risk prediction
        prediction = self.risk_model.predict_risk_score(X)
        risk_score = prediction['risk_score']
        risk_level = prediction['risk_level']
        
        # Get previous risk score for trend calculation
        previous_risk_score = None
        if student.risk_score:
            previous_risk_score = student.risk_score.risk_score
        
        # Calculate trend
        risk_trend, risk_value = RiskModel.calculate_risk_trend(
            risk_score, previous_risk_score
        )
        
        # Generate SHAP explanation
        shap_values = self.shap_explainer.explain_prediction(X)
        top_factors = self.shap_explainer.get_top_factors(shap_values, top_n=5)
        
        # Prepare SHAP explanation for storage
        shap_explanation = {
            'top_factors': [
                {
                    'feature': factor['feature'],
                    'impact': factor['impact'],
                    'direction': factor['direction']
                }
                for factor in top_factors
            ]
        }
        
        result = {
            'student_id': student_id,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'risk_trend': risk_trend,
            'risk_value': risk_value,
            'shap_explanation': shap_explanation,
            'model_version_id': self.active_model_version.id
        }
        
        if save_to_db:
            self._save_risk_score(result)
        
        logger.info(f"✓ Risk computed for {student_id}: {risk_score:.2f} ({risk_level.value})")
        
        return result
    
    def _save_risk_score(self, result: Dict[str, Any]):
        """Save risk score to database."""
        student_id = result['student_id']
        
        # Check if risk score already exists
        existing_risk = self.db.query(RiskScore).filter(
            RiskScore.student_id == student_id
        ).first()
        
        if existing_risk:
            # Update existing risk score
            existing_risk.risk_score = result['risk_score']
            existing_risk.risk_level = result['risk_level']
            existing_risk.risk_trend = result['risk_trend']
            existing_risk.risk_value = result['risk_value']
            existing_risk.shap_explanation = result['shap_explanation']
            existing_risk.model_version_id = result['model_version_id']
            existing_risk.predicted_at = datetime.utcnow()
            existing_risk.updated_at = datetime.utcnow()
        else:
            # Create new risk score
            new_risk = RiskScore(
                student_id=student_id,
                risk_score=result['risk_score'],
                risk_level=result['risk_level'],
                risk_trend=result['risk_trend'],
                risk_value=result['risk_value'],
                shap_explanation=result['shap_explanation'],
                model_version_id=result['model_version_id']
            )
            self.db.add(new_risk)
        
        # Add to risk history
        risk_history = RiskHistory(
            student_id=student_id,
            risk_score=result['risk_score'],
            risk_level=result['risk_level'],
            model_version_id=result['model_version_id']
        )
        self.db.add(risk_history)
        
        self.db.commit()
    
    def compute_all_risk_scores(self) -> Dict[str, Any]:
        """
        Compute risk scores for all students in database.
        
        Returns:
            Summary statistics
        """
        logger.info("Computing risk scores for all students...")
        
        students = self.db.query(Student).join(StudentMetric).all()
        total = len(students)
        
        if total == 0:
            logger.warning("No students found in database")
            return {'total': 0, 'processed': 0}
        
        processed = 0
        risk_distribution = {
            RiskLevel.HIGH: 0,
            RiskLevel.MODERATE: 0,
            RiskLevel.STABLE: 0,
            RiskLevel.SAFE: 0
        }
        
        for student in students:
            try:
                result = self.compute_student_risk(student.id, save_to_db=True)
                risk_distribution[result['risk_level']] += 1
                processed += 1
                
                if processed % 50 == 0:
                    logger.info(f"Processed {processed}/{total} students...")
                    
            except Exception as e:
                logger.error(f"Failed to compute risk for student {student.id}: {e}")
                continue
        
        logger.info(f"✓ Computed risk scores for {processed}/{total} students")
        logger.info(f"Risk Distribution: {dict(risk_distribution)}")
        
        return {
            'total': total,
            'processed': processed,
            'risk_distribution': {k.value: v for k, v in risk_distribution.items()}
        }


def compute_all_risk_scores(db: Session) -> Dict[str, Any]:
    """
    Convenience function to compute all risk scores.
    
    Args:
        db: Database session
        
    Returns:
        Summary statistics
    """
    service = RealtimePredictionService(db)
    return service.compute_all_risk_scores()


def compute_student_risk(student_id: str, db: Session) -> Dict[str, Any]:
    """
    Convenience function to compute single student risk.
    
    Args:
        student_id: Student ID
        db: Database session
        
    Returns:
        Risk prediction result
    """
    service = RealtimePredictionService(db)
    return service.compute_student_risk(student_id)
