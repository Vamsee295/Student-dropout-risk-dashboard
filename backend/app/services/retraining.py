"""
Model Retraining and Real-Time Risk Computation Service.

Handles:
- Scheduled weekly retraining
- Real-time risk recalculation when metrics update
- Alert detection for risk increases >15%
- Intervention feedback loop
"""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from loguru import logger
import pandas as pd

from app.models import (
    Student, StudentMetric, RiskScore, RiskHistory,
    ModelVersion, Intervention, InterventionStatus
)
from app.services.risk_model import RiskModel, ModelVersionManager
from app.services.feature_engineering import FeatureEngineer
from app.services.shap_explainer import SHAPExplainer
from app.config import get_settings

settings = get_settings()


class RetrainingService:
    """
    Service for model retraining and version management.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def trigger_retraining(self) -> Dict[str, Any]:
        """
        Trigger model retraining with latest data.
        
        Returns:
            Dictionary with retraining results
        """
        logger.info("Starting scheduled model retraining...")
        
        try:
            # Load training data from database
            X, y = self._load_training_data()
            
            if len(X) == 0:
                logger.warning("No training data available")
                return {'success': False, 'error': 'No training data'}
            
            # Train new model
            new_model = RiskModel()
            training_results = new_model.train(X, y)
            
            # Get current active model
            current_model = self.db.query(ModelVersion).filter(
                ModelVersion.is_active == True
            ).first()
            
            # Decide whether to promote new model
            should_promote = False
            if current_model is None:
                # No active model, promote automatically
                should_promote = True
                logger.info("No active model found, promoting new model")
            else:
                # Compare F1 scores
                new_f1 = training_results['metrics']['f1_score']
                current_f1 = current_model.f1_score
                
                should_promote = ModelVersionManager.should_promote_model(
                    new_f1, current_f1
                )
                
                logger.info(
                    f"Model comparison - New F1: {new_f1:.4f}, "
                    f"Current F1: {current_f1:.4f}, "
                    f"Promote: {should_promote}"
                )
            
            # Save new model
            model_path = new_model.save()
            
            # Save model version to database
            model_version = ModelVersion(
                version=training_results['version'],
                model_path=model_path,
                accuracy=training_results['metrics']['accuracy'],
                precision=training_results['metrics']['precision'],
                recall=training_results['metrics']['recall'],
                f1_score=training_results['metrics']['f1_score'],
                training_samples=training_results['metrics']['training_samples'],
                feature_importance=training_results['feature_importance'],
                feature_means=training_results['feature_means'],
                is_active=should_promote,
                trained_at=datetime.utcnow()
            )
            
            # If promoting, deactivate current model
            if should_promote and current_model is not None:
                current_model.is_active = False
            
            self.db.add(model_version)
            self.db.commit()
            
            logger.info(f"Model version {training_results['version']} saved")
            
            return {
                'success': True,
                'version': training_results['version'],
                'metrics': training_results['metrics'],
                'promoted': should_promote
            }
            
        except Exception as e:
            logger.error(f"Retraining failed: {e}")
            self.db.rollback()
            return {'success': False, 'error': str(e)}
    
    def _load_training_data(self) -> tuple:
        """
        Load training data from database including intervention outcomes.
        
        Returns:
            Tuple of (X, y) DataFrames
        """
        # Query all students with metrics
        students = self.db.query(Student).join(StudentMetric).all()
        
        features_list = []
        targets_list = []
        
        for student in students:
            if student.metrics is None:
                continue
            
            # Extract features
            features = {
                'attendance_rate': student.metrics.attendance_rate,
                'engagement_score': student.metrics.engagement_score,
                'academic_performance_index': student.metrics.academic_performance_index,
                'login_gap_days': student.metrics.login_gap_days,
                'failure_ratio': student.metrics.failure_ratio,
                'financial_risk_flag': int(student.metrics.financial_risk_flag),
                'commute_risk_score': student.metrics.commute_risk_score,
                'semester_performance_trend': student.metrics.semester_performance_trend
            }
            
            features_list.append(features)
            
            # For target, use intervention outcome if available
            # Otherwise, use risk score as proxy
            completed_intervention = self.db.query(Intervention).filter(
                Intervention.student_id == student.id,
                Intervention.status == InterventionStatus.COMPLETED,
                Intervention.outcome_label.isnot(None)
            ).first()
            
            if completed_intervention:
                # Use intervention outcome as ground truth
                target = completed_intervention.outcome_label
            else:
                # Use current risk score as proxy (high risk = 1, else = 0)
                if student.risk_score:
                    target = 1 if student.risk_score.risk_score > 70 else 0
                else:
                    target = 0
            
            targets_list.append(target)
        
        X = pd.DataFrame(features_list)
        y = pd.Series(targets_list)
        
        return X, y
    
    def detect_feature_drift(self) -> Dict[str, bool]:
        """
        Detect feature drift compared to active model.
        
        Returns:
            Dictionary mapping features to drift detected (bool)
        """
        # Get active model
        active_model = self.db.query(ModelVersion).filter(
            ModelVersion.is_active == True
        ).first()
        
        if not active_model or not active_model.feature_means:
            logger.warning("No active model with feature means found")
            return {}
        
        # Calculate current feature means
        students = self.db.query(StudentMetric).all()
        
        if not students:
            return {}
        
        features_df = pd.DataFrame([
            {
                'attendance_rate': s.attendance_rate,
                'engagement_score': s.engagement_score,
                'academic_performance_index': s.academic_performance_index,
                'login_gap_days': s.login_gap_days,
                'failure_ratio': s.failure_ratio,
                'financial_risk_flag': int(s.financial_risk_flag),
                'commute_risk_score': s.commute_risk_score,
                'semester_performance_trend': s.semester_performance_trend
            }
            for s in students
        ])
        
        current_means = features_df.mean().to_dict()
        
        # Detect drift
        drift_detected = ModelVersionManager.detect_feature_drift(
            current_means,
            active_model.feature_means,
            threshold=settings.drift_threshold
        )
        
        # Log drift detection
        drifted_features = [f for f, drifted in drift_detected.items() if drifted]
        if drifted_features:
            logger.warning(f"Feature drift detected in: {drifted_features}")
        
        return drift_detected


class RealTimeRiskService:
    """
    Service for real-time risk computation when metrics update.
    
    This is the CRITICAL real-time loop:
    Metrics Update → Feature Engineering → ML Inference → 
    Risk Score Update → History Save → Alert Detection
    """
    
    def __init__(self, db: Session, risk_model: RiskModel, shap_explainer: Optional[SHAPExplainer] = None):
        self.db = db
        self.risk_model = risk_model
        self.shap_explainer = shap_explainer
        self.feature_engineer = FeatureEngineer()
    
    def compute_risk_for_student(self, student_id: str) -> Dict[str, Any]:
        """
        Compute risk score for a student.
        
        This is triggered automatically when metrics are updated.
        
        Args:
            student_id: Student ID
            
        Returns:
            Dictionary with computed risk information
        """
        logger.info(f"Computing risk for student {student_id}")
        
        # Get student with metrics
        student = self.db.query(Student).filter(Student.id == student_id).first()
        
        if not student or not student.metrics:
            raise ValueError(f"Student {student_id} not found or has no metrics")
        
        # Prepare features for ML
        features = self._prepare_features(student.metrics)
        features_df = pd.DataFrame([features])
        
        # Get prediction
        risk_prediction = self.risk_model.predict_risk_score(features_df)
        
        # Get previous risk score for trend calculation
        previous_score = None
        if student.risk_score:
            previous_score = student.risk_score.risk_score
        
        # Calculate trend
        risk_trend, risk_value = RiskModel.calculate_risk_trend(
            risk_prediction['risk_score'],
            previous_score
        )
        
        # Get SHAP explanation
        shap_explanation = None
        if self.shap_explainer:
            try:
                shap_factors = self.shap_explainer.explain(features_df, top_n=5)
                shap_explanation = {
                    'top_factors': [
                        {
                            'feature': factor.feature,
                            'impact': factor.impact,
                            'direction': factor.direction
                        }
                        for factor in shap_factors
                    ]
                }
            except Exception as e:
                logger.error(f"SHAP explanation failed: {e}")
        
        # Get active model version
        active_model = self.db.query(ModelVersion).filter(
            ModelVersion.is_active == True
        ).first()
        
        if not active_model:
            raise ValueError("No active model found")
        
        # Update or create risk score
        if student.risk_score:
            student.risk_score.risk_score = risk_prediction['risk_score']
            student.risk_score.risk_level = risk_prediction['risk_level']
            student.risk_score.risk_trend = risk_trend
            student.risk_score.risk_value = risk_value
            student.risk_score.model_version_id = active_model.id
            student.risk_score.shap_explanation = shap_explanation
            student.risk_score.predicted_at = datetime.utcnow()
            student.risk_score.updated_at = datetime.utcnow()
        else:
            risk_score = RiskScore(
                student_id=student_id,
                risk_score=risk_prediction['risk_score'],
                risk_level=risk_prediction['risk_level'],
                risk_trend=risk_trend,
                risk_value=risk_value,
                model_version_id=active_model.id,
                shap_explanation=shap_explanation,
                predicted_at=datetime.utcnow()
            )
            self.db.add(risk_score)
        
        # Save to risk history
        risk_history = RiskHistory(
            student_id=student_id,
            risk_score=risk_prediction['risk_score'],
            risk_level=risk_prediction['risk_level'],
            model_version_id=active_model.id,
            recorded_at=datetime.utcnow()
        )
        self.db.add(risk_history)
        
        # Detect alert
        alert_triggered = RiskModel.detect_alert(
            risk_prediction['risk_score'],
            previous_score,
            threshold=settings.risk_increase_alert_threshold
        )
        
        # Commit changes
        self.db.commit()
        
        logger.info(
            f"Risk computed for {student_id}: "
            f"Score={risk_prediction['risk_score']:.2f}, "
            f"Level={risk_prediction['risk_level'].value}, "
            f"Trend={risk_trend.value}, "
            f"Alert={alert_triggered}"
        )
        
        return {
            'risk_score': risk_prediction['risk_score'],
            'risk_level': risk_prediction['risk_level'],
            'risk_trend': risk_trend,
            'risk_value': risk_value,
            'alert_triggered': alert_triggered,
            'shap_explanation': shap_explanation
        }
    
    @staticmethod
    def _prepare_features(metrics: StudentMetric) -> Dict[str, Any]:
        """Extract features from StudentMetric for ML."""
        return {
            'attendance_rate': metrics.attendance_rate,
            'engagement_score': metrics.engagement_score,
            'academic_performance_index': metrics.academic_performance_index,
            'login_gap_days': metrics.login_gap_days,
            'failure_ratio': metrics.failure_ratio,
            'financial_risk_flag': int(metrics.financial_risk_flag),
            'commute_risk_score': metrics.commute_risk_score,
            'semester_performance_trend': metrics.semester_performance_trend
        }
