"""
Script to compute risk scores for all students in the database.
Run this after training the model with train_model.py.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
from app.database import SessionLocal
from app.models import Student, StudentMetric, RiskScore, RiskLevel, RiskTrend, ModelVersion
from app.services.risk_model import RiskModel
from loguru import logger


def compute_risk_scores():
    """Compute risk scores for all students."""
    logger.info("=" * 60)
    logger.info("Computing Risk Scores for All Students")
    logger.info("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Find the latest trained model
        logger.info("Finding latest trained model...")
        models_dir = Path(__file__).parent.parent / "models" / "versions"
        model_files = list(models_dir.glob("model_*.pkl"))
        
        if not model_files:
            logger.error("No trained models found. Please run train_model.py first")
            return
        
        latest_model = max(model_files, key=lambda p: p.stat().st_mtime)
        logger.info(f"Found model: {latest_model.name}")
        
        # Load the trained model
        logger.info("Loading model...")
        risk_model = RiskModel()
        risk_model.load(str(latest_model))
        logger.info(f"✓ Model loaded: {risk_model.version}")
        
        # Get model version ID from database
        model_version_record = db.query(ModelVersion).filter(
            ModelVersion.version == risk_model.version
        ).first()
        
        if not model_version_record:
            logger.error(f"Model version {risk_model.version} not found in database")
            logger.error("Please run train_model.py to register the model first")
            return
        
        model_version_id = model_version_record.id
        logger.info(f"Model version ID: {model_version_id}")
        
        # Get all students with metrics
        students = db.query(Student).join(StudentMetric).all()
        logger.info(f"Found {len(students)} students to process")
        
        if not students:
            logger.error("No students found in database")
            return
        
        # Clear existing risk scores
        logger.info("Clearing existing risk scores...")
        db.query(RiskScore).delete()
        db.commit()
        
        # Compute risk scores for each student
        logger.info("Computing risk scores...")
        computed_count = 0
        
        for student in students:
            if not student.metrics:
                logger.warning(f"No metrics for student {student.id}, skipping")
                continue
            
            # Build features dict from metrics
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
            
            # Convert to DataFrame for model prediction
            features_df = pd.DataFrame([features])
            
            # Predict risk
            prediction = risk_model.predict_risk_score(features_df)
            
            # Determine risk level from prediction
            risk_percentage = prediction['risk_score']
            risk_level_str = prediction['risk_level']
            
            # Convert string to RiskLevel enum
            if risk_level_str == 'High Risk':
                risk_level = RiskLevel.HIGH
            elif risk_level_str == 'Moderate Risk':
                risk_level = RiskLevel.MODERATE  
            elif risk_level_str == 'Stable':
                risk_level = RiskLevel.STABLE
            else:
                risk_level = RiskLevel.SAFE
            
            # Create risk score record
            risk_score = RiskScore(
                student_id=student.id,
                risk_score=risk_percentage,
                risk_level=risk_level,
                risk_trend=RiskTrend.STABLE,  # First prediction, so stable
                risk_value=prediction.get('risk_value', 'Stable'),
                model_version_id=model_version_id
            )
            
            db.add(risk_score)
            computed_count += 1
            
            if computed_count % 10 == 0:
                logger.info(f"Processed {computed_count}/{len(students)} students...")
        
        # Commit all risk scores
        db.commit()
        
        # Print summary
        logger.info("=" * 60)
        logger.info("✓ Risk Score Computation Complete!")
        logger.info("=" * 60)
        logger.info(f"Total students processed: {computed_count}")
        
        # Get distribution
        high_risk = db.query(RiskScore).filter(RiskScore.risk_level == RiskLevel.HIGH).count()
        moderate = db.query(RiskScore).filter(RiskScore.risk_level == RiskLevel.MODERATE).count()
        stable = db.query(RiskScore).filter(RiskScore.risk_level == RiskLevel.STABLE).count()
        safe = db.query(RiskScore).filter(RiskScore.risk_level == RiskLevel.SAFE).count()
        
        logger.info(f"\nRisk Distribution:")
        logger.info(f"  High Risk:     {high_risk:3d} ({high_risk/computed_count*100:5.1f}%)")
        logger.info(f"  Moderate Risk: {moderate:3d} ({moderate/computed_count*100:5.1f}%)")
        logger.info(f"  Stable:        {stable:3d} ({stable/computed_count*100:5.1f}%)")
        logger.info(f"  Safe:          {safe:3d} ({safe/computed_count*100:5.1f}%)")
        
        logger.info("\n✓ Dashboard is now ready with real ML predictions!")
        logger.info("  Visit: http://localhost:3000")
        
    except Exception as e:
        logger.error(f"Failed to compute risk scores: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    compute_risk_scores()
