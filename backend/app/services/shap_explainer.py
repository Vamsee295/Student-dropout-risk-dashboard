"""
SHAP Explainability Service for Student Dropout Risk Prediction.

Provides per-student feature importance using SHAP TreeExplainer.
"""

import shap
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from loguru import logger

from app.schemas import SHAPFactor


class SHAPExplainer:
    """
    SHAP TreeExplainer for XGBoost model interpretability.
    
    Generates per-prediction feature importance to explain
    WHY a student received their risk score.
    """
    
    def __init__(self, model, background_data: Optional[pd.DataFrame] = None):
        """
        Initialize SHAP explainer.
        
        Args:
            model: Trained XGBoost model (calibrated)
            background_data: Background dataset for SHAP (optional, uses subset if None)
        """
        self.model = model
        self.background_data = background_data
        self.explainer = None
        self._initialize_explainer()
    
    def _initialize_explainer(self):
        """Initialize SHAP TreeExplainer."""
        try:
            # For CalibratedClassifierCV, we need to access the base estimator
            if hasattr(self.model, 'calibrated_classifiers_'):
                # Use first calibrated classifier's base estimator
                base_model = self.model.calibrated_classifiers_[0].estimator
            else:
                base_model = self.model
            
            # Initialize TreeExplainer
            if self.background_data is not None:
                # Use background data for more accurate SHAP values
                self.explainer = shap.TreeExplainer(
                    base_model,
                    data=self.background_data
                )
            else:
                # Use model directly
                self.explainer = shap.TreeExplainer(base_model)
            
            logger.info("SHAP explainer initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize SHAP explainer: {e}")
            self.explainer = None
    
    def explain(
        self,
        X: pd.DataFrame,
        top_n: int = 5
    ) -> List[SHAPFactor]:
        """
        Generate SHAP explanation for a single prediction.
        
        Args:
            X: Feature DataFrame (single row)
            top_n: Number of top features to return
            
        Returns:
            List of SHAPFactor objects with top contributing features
        """
        if self.explainer is None:
            logger.warning("SHAP explainer not initialized")
            return []
        
        try:
            # Calculate SHAP values
            shap_values = self.explainer.shap_values(X)
            
            # Get feature names
            feature_names = X.columns.tolist()
            
            # For binary classification, shap_values may be 2D or 3D
            if isinstance(shap_values, list):
                # Multi-class output (use class 1 for dropout)
                shap_values_dropout = shap_values[1][0]
            else:
                # Single output
                shap_values_dropout = shap_values[0]
            
            # Create feature importance list
            feature_impacts = []
            for feature, impact in zip(feature_names, shap_values_dropout):
                feature_impacts.append({
                    'feature': feature,
                    'impact': abs(float(impact)),
                    'direction': 'positive' if impact > 0 else 'negative'
                })
            
            # Sort by absolute impact (descending)
            feature_impacts.sort(key=lambda x: x['impact'], reverse=True)
            
            # Take top N
            top_factors = feature_impacts[:top_n]
            
            # Convert to SHAPFactor objects
            return [
                SHAPFactor(
                    feature=self._format_feature_name(factor['feature']),
                    impact=round(factor['impact'], 3),
                    direction=factor['direction']
                )
                for factor in top_factors
            ]
            
        except Exception as e:
            logger.error(f"Failed to generate SHAP explanation: {e}")
            return []
    
    @staticmethod
    def _format_feature_name(feature: str) -> str:
        """
        Format feature name for display.
        
        Args:
            feature: Raw feature name
            
        Returns:
            Formatted feature name
        """
        # Convert snake_case to Title Case
        formatted = feature.replace('_', ' ').title()
        
        # Custom formatting for specific features
        replacements = {
            'API': 'API',
            'Gpa': 'GPA',
            'Lms': 'LMS'
        }
        
        for old, new in replacements.items():
            formatted = formatted.replace(old, new)
        
        return formatted
    
    def get_global_feature_importance(self) -> Dict[str, float]:
        """
        Get global feature importance from SHAP explainer.
        
        Returns:
            Dictionary mapping feature names to importance scores
        """
        if self.explainer is None:
            return {}
        
        try:
            # Use expected value as a proxy for global importance
            # Note: For true global importance, need to pass full dataset
            # This is a placeholder - should be updated with actual global calculation
            logger.warning("Global feature importance from SHAP not fully implemented")
            return {}
            
        except Exception as e:
            logger.error(f"Failed to get global feature importance: {e}")
            return {}
    
    def format_explanation_for_storage(
        self,
        factors: List[SHAPFactor]
    ) -> Dict[str, Any]:
        """
        Format SHAP explanation for database storage.
        
        Args:
            factors: List of SHAP factors
            
        Returns:
            Dictionary suitable for JSON storage
        """
        return {
            'top_factors': [
                {
                    'feature': factor.feature,
                    'impact': factor.impact,
                    'direction': factor.direction
                }
                for factor in factors
            ]
        }
    
    @staticmethod
    def parse_explanation_from_storage(
        explanation_json: Dict[str, Any]
    ) -> List[SHAPFactor]:
        """
        Parse SHAP explanation from database JSON.
        
        Args:
            explanation_json: Stored JSON explanation
            
        Returns:
            List of SHAPFactor objects
        """
        if not explanation_json or 'top_factors' not in explanation_json:
            return []
        
        return [
            SHAPFactor(
                feature=factor['feature'],
                impact=factor['impact'],
                direction=factor['direction']
            )
            for factor in explanation_json['top_factors']
        ]


class ExplainabilityService:
    """
    High-level service for model explainability.
    
    Combines SHAP explanations with risk predictions.
    """
    
    def __init__(self, risk_model, background_data: Optional[pd.DataFrame] = None):
        """
        Initialize explainability service.
        
        Args:
            risk_model: Trained RiskModel instance
            background_data: Background dataset for SHAP
        """
        self.risk_model = risk_model
        self.shap_explainer = SHAPExplainer(
            risk_model.calibrated_model,
            background_data
        )
    
    def get_risk_explanation(
        self,
        features: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Get complete risk prediction with SHAP explanation.
        
        Args:
            features: Student feature DataFrame
            
        Returns:
            Dictionary with risk_score, risk_level, and top_factors
        """
        # Get risk prediction
        risk_prediction = self.risk_model.predict_risk_score(features)
        
        # Get SHAP explanation
        shap_factors = self.shap_explainer.explain(features, top_n=5)
        
        return {
            'risk_score': risk_prediction['risk_score'],
            'risk_level': risk_prediction['risk_level'].value,
            'top_factors': [
                {
                    'feature': factor.feature,
                    'impact': factor.impact,
                    'direction': factor.direction
                }
                for factor in shap_factors
            ]
        }
