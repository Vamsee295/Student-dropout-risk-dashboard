"""
ML Model Training and Inference Service for Student Dropout Risk Prediction.

Uses XGBoost with 5-fold cross-validation and calibrated probability outputs.
Implements model versioning and persistence.
"""

import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
from pathlib import Path
from sklearn.model_selection import cross_val_score, train_test_split, StratifiedKFold
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)
from sklearn.calibration import CalibratedClassifierCV
from xgboost import XGBClassifier
from loguru import logger

from app.config import get_settings
from app.models import RiskLevel, RiskTrend

settings = get_settings()


class RiskModel:
    """
    XGBoost-based risk prediction model with calibration.
    
    Features:
    - 5-fold cross-validation
    - Calibrated probability outputs (0-100 scale)
    - Model versioning
    - Feature importance extraction
    """
    
    def __init__(self):
        self.model = None
        self.calibrated_model = None
        self.version = None
        self.feature_names = [
            'attendance_rate',
            'engagement_score',
            'academic_performance_index',
            'login_gap_days',
            'failure_ratio',
            'financial_risk_flag',
            'commute_risk_score',
            'semester_performance_trend'
        ]
        self.feature_means = {}
        
    def train(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        version: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Train XGBoost model with 5-fold cross-validation.
        
        Args:
            X: Feature DataFrame
            y: Target Series (0=no dropout, 1=dropout)
            version: Model version string (auto-generated if None)
            
        Returns:
            Dictionary with training metrics and metadata
        """
        logger.info(f"Starting model training with {len(X)} samples")
        
        # Generate version if not provided
        if version is None:
            self.version = f"model_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        else:
            self.version = version
        
        # Store feature means for drift detection
        self.feature_means = X.mean().to_dict()
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        logger.info(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
        
        # Initialize XGBoost classifier
        self.model = XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric='logloss',
            use_label_encoder=False
        )
        
        # 5-fold cross-validation
        logger.info("Performing 5-fold cross-validation...")
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        
        cv_scores = cross_val_score(
            self.model, X_train, y_train, 
            cv=skf, scoring='f1', n_jobs=-1
        )
        
        logger.info(f"Cross-validation F1 scores: {cv_scores}")
        logger.info(f"Mean CV F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        
        # Train on full training set
        logger.info("Training on full training set...")
        self.model.fit(X_train, y_train)
        
        # Calibrate probabilities
        logger.info("Calibrating model probabilities...")
        self.calibrated_model = CalibratedClassifierCV(
            self.model, method='sigmoid', cv=3
        )
        self.calibrated_model.fit(X_train, y_train)
        
        # Evaluate on test set
        y_pred = self.calibrated_model.predict(X_test)
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1_score': f1_score(y_test, y_pred, zero_division=0),
            'cv_mean_f1': cv_scores.mean(),
            'cv_std_f1': cv_scores.std(),
            'training_samples': len(X_train),
            'test_samples': len(X_test)
        }
        
        logger.info(f"Model Metrics: {metrics}")
        logger.info("\nClassification Report:")
        logger.info(classification_report(y_test, y_pred))
        
        # Extract feature importance
        feature_importance = self.get_feature_importance()
        
        return {
            'version': self.version,
            'metrics': metrics,
            'feature_importance': feature_importance,
            'feature_means': self.feature_means
        }
    
    def predict(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict dropout probability for students.
        
        Args:
            X: Feature DataFrame
            
        Returns:
            Tuple of (predictions, probabilities)
        """
        if self.calibrated_model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        predictions = self.calibrated_model.predict(X)
        probabilities = self.calibrated_model.predict_proba(X)
        
        return predictions, probabilities
    
    def predict_risk_score(self, X: pd.DataFrame) -> Dict[str, Any]:
        """
        Predict risk score (0-100) with risk level and trend.
        
        Args:
            X: Feature DataFrame (single row)
            
        Returns:
            Dictionary with risk_score, risk_level, and risk_value
        """
        _, probabilities = self.predict(X)
        
        # Get dropout probability (class 1)
        dropout_prob = probabilities[0][1]
        
        # Convert to 0-100 scale (calibrated risk score)
        risk_score = float(dropout_prob * 100)
        
        # Determine risk level
        risk_level = self._get_risk_level(risk_score)
        
        # Risk value for display (will be updated with trend later)
        risk_value = self._format_risk_value(risk_score, risk_level)
        
        return {
            'risk_score': round(risk_score, 2),
            'risk_level': risk_level,
            'risk_value': risk_value
        }
    
    @staticmethod
    def _get_risk_level(risk_score: float) -> RiskLevel:
        """
        Determine risk level from risk score.
        
        Risk Levels:
        - 0-40: Safe
        - 41-55: Stable
        - 56-70: Moderate Risk
        - 71-100: High Risk
        """
        if risk_score <= 40:
            return RiskLevel.SAFE
        elif risk_score <= 55:
            return RiskLevel.STABLE
        elif risk_score <= 70:
            return RiskLevel.MODERATE
        else:
            return RiskLevel.HIGH
    
    @staticmethod
    def _format_risk_value(risk_score: float, risk_level: RiskLevel) -> str:
        """Format risk value display string."""
        if risk_level == RiskLevel.SAFE or risk_level == RiskLevel.STABLE:
            return "Stable"
        else:
            return f"{int(risk_score)}% Risk"
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Extract feature importance from trained model.
        
        Returns:
            Dictionary mapping feature names to importance scores
        """
        if self.model is None:
            raise ValueError("Model not trained")
        
        importance_scores = self.model.feature_importances_
        
        return {
            feature: float(score)
            for feature, score in zip(self.feature_names, importance_scores)
        }
    
    def save(self, filepath: Optional[str] = None) -> str:
        """
        Save model to disk.
        
        Args:
            filepath: Optional custom filepath
            
        Returns:
            Path where model was saved
        """
        if self.calibrated_model is None:
            raise ValueError("No trained model to save")
        
        if filepath is None:
            # Create models directory if not exists
            models_dir = Path(settings.models_dir)
            models_dir.mkdir(parents=True, exist_ok=True)
            
            filepath = models_dir / f"{self.version}.pkl"
        
        # Save calibrated model
        joblib.dump(self.calibrated_model, filepath)
        logger.info(f"Model saved to {filepath}")
        
        return str(filepath)
    
    def load(self, filepath: str) -> None:
        """
        Load model from disk.
        
        Args:
            filepath: Path to model file
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")
        
        self.calibrated_model = joblib.load(filepath)
        self.version = Path(filepath).stem
        
        logger.info(f"Model loaded from {filepath}")
    
    @staticmethod
    def calculate_risk_trend(
        current_score: float,
        previous_score: Optional[float]
    ) -> Tuple[RiskTrend, str]:
        """
        Calculate risk trend and updated risk value.
        
        Args:
            current_score: Current risk score
            previous_score: Previous risk score (None if first prediction)
            
        Returns:
            Tuple of (RiskTrend, risk_value_string)
        """
        if previous_score is None:
            return RiskTrend.STABLE, "Stable"
        
        diff = current_score - previous_score
        diff_percent = abs(diff)
        
        # Determine trend
        if diff > 2:  # Increased by more than 2 points
            trend = RiskTrend.UP
            risk_value = f"+{diff_percent:.0f}% Risk"
        elif diff < -2:  # Decreased by more than 2 points
            trend = RiskTrend.DOWN
            risk_value = f"-{diff_percent:.0f}% Risk"
        else:  # Stable
            trend = RiskTrend.STABLE
            risk_value = "Stable"
        
        return trend, risk_value
    
    @staticmethod
    def detect_alert(
        current_score: float,
        previous_score: Optional[float],
        threshold: float = 15.0
    ) -> bool:
        """
        Detect if risk increase exceeds alert threshold.
        
        Args:
            current_score: Current risk score
            previous_score: Previous risk score
            threshold: Alert threshold (default 15%)
            
        Returns:
            True if alert should be triggered
        """
        if previous_score is None:
            return False
        
        increase = current_score - previous_score
        
        return increase > threshold


class ModelVersionManager:
    """Manages model versions and promotion logic."""
    
    @staticmethod
    def should_promote_model(
        new_f1: float,
        current_f1: float
    ) -> bool:
        """
        Determine if new model should replace current active model.
        
        Promotion logic: F1_new > F1_current
        
        Args:
            new_f1: F1 score of new model
            current_f1: F1 score of current active model
            
        Returns:
            True if new model should be promoted
        """
        return new_f1 > current_f1
    
    @staticmethod
    def detect_feature_drift(
        current_means: Dict[str, float],
        historical_means: Dict[str, float],
        threshold: float = 0.20
    ) -> Dict[str, bool]:
        """
        Detect feature drift by comparing current and historical means.
        
        Args:
            current_means: Current feature mean values
            historical_means: Historical feature mean values
            threshold: Drift threshold (default 20%)
            
        Returns:
            Dictionary mapping feature names to drift detected (bool)
        """
        drift_detected = {}
        
        for feature, current_mean in current_means.items():
            if feature not in historical_means:
                drift_detected[feature] = False
                continue
            
            historical_mean = historical_means[feature]
            
            # Avoid division by zero
            if historical_mean == 0:
                drift_detected[feature] = current_mean != 0
                continue
            
            # Calculate percentage change
            pct_change = abs((current_mean - historical_mean) / historical_mean)
            
            drift_detected[feature] = pct_change > threshold
        
        return drift_detected
