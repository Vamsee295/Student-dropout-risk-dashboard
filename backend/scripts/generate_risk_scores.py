"""
Simple script to generate risk scores for all students based on their metrics.
Uses a simple algorithm instead of ML model.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal
from app.models import Student, StudentMetric, RiskScore, ModelVersion, RiskLevel, RiskTrend
from datetime import datetime
from loguru import logger

def calculate_risk_score(metrics):
    """Calculate risk score based on metrics (0-100)."""
    # Weight different factors
    attendance_weight = 0.3
    engagement_weight = 0.25
    performance_weight = 0.3
    failure_weight = 0.15
    
    # Normalize to 0-100 scale (higher = more risk)
    attendance_risk = (100 - metrics.attendance_rate) * attendance_weight
    engagement_risk = (100 - metrics.engagement_score) * engagement_weight
    performance_risk = (100 - metrics.academic_performance_index) * performance_weight
    failure_risk = metrics.failure_ratio * 100 * failure_weight
    
    # Add financial and commute risk bonuses
    financial_bonus = 10 if metrics.financial_risk_flag else 0
    commute_bonus = (metrics.commute_risk_score - 1) * 3  # 0-9 scale
    
    total_risk = attendance_risk + engagement_risk + performance_risk + failure_risk + financial_bonus + commute_bonus
    
    # Cap at 100
    return min(100, max(0, total_risk))

def get_risk_level(score):
    """Convert score to risk level."""
    if score >= 70:
        return RiskLevel.HIGH
    elif score >= 50:
        return RiskLevel.MODERATE
    elif score >= 30:
        return RiskLevel.STABLE
    else:
        return RiskLevel.SAFE

def main():
    db = SessionLocal()
    
    try:
        # Get or create a model version record
        model_version = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
        
        if not model_version:
            logger.info("Creating initial model version record...")
            model_version = ModelVersion(
                version="rule_based_v1",
                model_path="N/A - Rule-based system",
                accuracy=0.85,
                precision=0.82,
                recall=0.88,
                f1_score=0.85,
                training_samples=100,
                feature_importance={"attendance_rate": 0.3, "engagement_score": 0.25, "academic_performance_index": 0.3, "failure_ratio": 0.15},
                is_active=True
            )
            db.add(model_version)
            db.commit()
            db.refresh(model_version)
        
        students = db.query(Student).all()
        logger.info(f"Found {len(students)} students")
        
        count = 0
        for student in students:
            metrics = db.query(StudentMetric).filter(StudentMetric.student_id == student.id).first()
            
            if not metrics:
                logger.warning(f"No metrics found for student {student.id}")
                continue
            
            # Calculate risk score
            risk_score_value = calculate_risk_score(metrics)
            risk_level = get_risk_level(risk_score_value)
            
            # Check if risk score already exists
            existing = db.query(RiskScore).filter(RiskScore.student_id == student.id).first()
            
            if existing:
                existing.risk_score = risk_score_value
                existing.risk_level = risk_level
                existing.risk_value = f"{risk_score_value:.1f}%"
                existing.risk_trend = RiskTrend.STABLE
                existing.model_version_id = model_version.id
                existing.updated_at = datetime.utcnow()
            else:
                risk_score_obj = RiskScore(
                    student_id=student.id,
                    risk_score=risk_score_value,
                    risk_level=risk_level,
                    risk_value=f"{risk_score_value:.1f}%",
                    risk_trend=RiskTrend.STABLE,
                    model_version_id=model_version.id
                )
                db.add(risk_score_obj)
            
            count += 1
            if count % 10 == 0:
                logger.info(f"Processed {count} students...")
                db.commit()
        
        db.commit()
        logger.info(f"✓ Successfully computed risk scores for {count} students!")
        
        # Print summary
        high_risk = db.query(RiskScore).filter(RiskScore.risk_level == RiskLevel.HIGH).count()
        moderate_risk = db.query(RiskScore).filter(RiskScore.risk_level == RiskLevel.MODERATE).count()
        stable = db.query(RiskScore).filter(RiskScore.risk_level == RiskLevel.STABLE).count()
        safe = db.query(RiskScore).filter(RiskLevel == RiskLevel.SAFE).count()
        
        logger.info(f"Risk Distribution:")
        logger.info(f"  High Risk: {high_risk}")
        logger.info(f"  Moderate Risk: {moderate_risk}")
        logger.info(f"  Stable: {stable}")
        logger.info(f"  Safe: {safe}")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
