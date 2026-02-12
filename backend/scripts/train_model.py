"""
Model Training Script for Student Dropout Risk Prediction.

Trains XGBoost model with:
- 5-fold cross-validation
- Calibrated probabilities
- Feature importance extraction
- Model versioning
- SHAP explainability

Run this after loading data with load_dataset.py
"""

import sys
from pathlib import Path
import pandas as pd

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.models import Student, StudentMetric, ModelVersion
from app.services.risk_model import RiskModel
from app.config import get_settings
from loguru import logger

settings = get_settings()


def load_training_data(db: SessionLocal) -> tuple:
    """
    Load training data from database.
    
    Returns:
        Tuple of (X, y) DataFrames
    """
    logger.info("Loading training data from database...")
    
    # Query all students with metrics
    students = db.query(Student).join(StudentMetric).all()
    
    if not students:
        raise ValueError("No students found in database. Run load_dataset.py first.")
    
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
        
        # For target, use heuristic based on risk indicators
        # In production, this would come from actual dropout labels
        # High risk if: low attendance OR low engagement OR high failure ratio
        is_high_risk = (
            student.metrics.attendance_rate < 65 or
            student.metrics.engagement_score < 50 or
            student.metrics.failure_ratio > 0.3
        )
        target = 1 if is_high_risk else 0
        
        targets_list.append(target)
    
    X = pd.DataFrame(features_list)
    y = pd.Series(targets_list)
    
    logger.info(f"Loaded {len(X)} samples for training")
    logger.info(f"Class distribution: {y.value_counts().to_dict()}")
    
    return X, y


def save_model_version(db: SessionLocal, training_results: dict):
    """
    Save model version to database.
    
    Args:
        db: Database session
        training_results: Training results dict from RiskModel.train()
    """
    # Deactivate current active model
    current_active = db.query(ModelVersion).filter(
        ModelVersion.is_active == True
    ).first()
    
    if current_active:
        current_active.is_active = False
        logger.info(f"Deactivated previous model: {current_active.version}")
    
    # Create new model version record
    model_version = ModelVersion(
        version=training_results['version'],
        model_path=training_results['model_path'],
        accuracy=training_results['metrics']['accuracy'],
        precision=training_results['metrics']['precision'],
        recall=training_results['metrics']['recall'],
        f1_score=training_results['metrics']['f1_score'],
        training_samples=training_results['metrics']['training_samples'],
        feature_importance=training_results['feature_importance'],
        feature_means=training_results['feature_means'],
        is_active=True
    )
    
    db.add(model_version)
    db.commit()
    
    logger.info(f"✓ Model version {training_results['version']} saved to database")
    logger.info(f"  Accuracy: {training_results['metrics']['accuracy']:.4f}")
    logger.info(f"  Precision: {training_results['metrics']['precision']:.4f}")
    logger.info(f"  Recall: {training_results['metrics']['recall']:.4f}")
    logger.info(f"  F1 Score: {training_results['metrics']['f1_score']:.4f}")


def main():
    """Main training execution."""
    logger.info("=" * 60)
    logger.info("Student Dropout Risk Model Training")
    logger.info("=" * 60)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Load training data
        X, y = load_training_data(db)
        
        # Initialize and train model
        logger.info("\nInitializing XGBoost model...")
        risk_model = RiskModel()
        
        logger.info("Starting model training with 5-fold cross-validation...")
        training_results = risk_model.train(X, y)
        
        # Save model to disk
        logger.info("\nSaving trained model...")
        model_path = risk_model.save()
        training_results['model_path'] = model_path
        
        # Save model version to database
        save_model_version(db, training_results)
        
        # Display feature importance
        logger.info("\n" + "=" * 60)
        logger.info("Feature Importance:")
        logger.info("=" * 60)
        for feature, importance in sorted(
            training_results['feature_importance'].items(),
            key=lambda x: x[1],
            reverse=True
        ):
            logger.info(f"  {feature:40s} {importance:.4f}")
        
        logger.info("\n" + "=" * 60)
        logger.info("✓ Model training completed successfully!")
        logger.info("=" * 60)
        logger.info(f"Model version: {training_results['version']}")
        logger.info(f"Model path: {model_path}")
        logger.info(f"F1 Score: {training_results['metrics']['f1_score']:.4f}")
        logger.info("\nYou can now start the API server with: uvicorn app.main:app --reload")
        
    except Exception as e:
        logger.error(f"Model training failed: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
