"""
Simple script to compute risk scores for all students.
This is a workaround for Windows command line limitations.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal
from app.models import Student, StudentMetric, RiskScore
from app.services.risk_model import RiskModel
from app.services.feature_engineering import FeatureEngineer
import pandas as pd
from datetime import datetime
from loguru import logger

def main():
    db = SessionLocal()
    
    try:
        logger.info("Loading model...")
        risk_model = RiskModel()
        # Load the latest model file
        import glob
        model_files = glob.glob("models/versions/model_*.pkl")
        if not model_files:
            raise FileNotFoundError("No model files found in models/versions/")
        latest_model = sorted(model_files)[-1]
        logger.info(f"Loading model from {latest_model}")
        risk_model.load(latest_model)
        
        logger.info("Initializing feature engineer...")
        fe = FeatureEngineer()
        
        students = db.query(Student).all()
        logger.info(f"Found {len(students)} students total")
        
        count = 0
        for student in students:
            metrics = db.query(StudentMetric).filter(StudentMetric.student_id == student.id).first()
            
            if not metrics:
                logger.warning(f"No metrics found for student {student.id}")
                continue
            
            # Extract features from metrics
            raw_data = {
                'curricular_units_1st_sem_approved': metrics.curricular_units_1st_sem_approved,
                'curricular_units_1st_sem_grade': metrics.curricular_units_1st_sem_grade,
                'curricular_units_2nd_sem_approved': metrics.curricular_units_2nd_sem_approved,
                'curricular_units_2nd_sem_grade': metrics.curricular_units_2nd_sem_grade,
                'curricular_units_1st_sem_enrolled': metrics.curricular_units_1st_sem_enrolled,
                'curricular_units_2nd_sem_enrolled': metrics.curricular_units_2nd_sem_enrolled,
                'curricular_units_1st_sem_evaluations': metrics.curricular_units_1st_sem_evaluations,
                'curricular_units_2nd_sem_evaluations': metrics.curricular_units_2nd_sem_evaluations,
                'curricular_units_1st_sem_without_evaluations': metrics.curricular_units_1st_sem_without_evaluations,
                'curricular_units_2nd_sem_without_evaluations': metrics.curricular_units_2nd_sem_without_evaluations,
                'age_at_enrollment': metrics.age_at_enrollment,
                'tuition_fees_up_to_date': metrics.tuition_fees_up_to_date,
                'debtor': metrics.debtor,
                'scholarship_holder': metrics.scholarship_holder
            }
            
            features = fe.engineer_features(raw_data)
            features_df = pd.DataFrame([features])
            
            risk_prob = risk_model.predict(features_df)
            risk_score = float(risk_prob[0] * 100)
            
            if risk_score > 75:
                risk_level = 'High Risk'
            elif risk_score > 50:
                risk_level = 'Moderate Risk'
            elif risk_score > 25:
                risk_level = 'Stable'
            else:
                risk_level = 'Safe'
            
            existing = db.query(RiskScore).filter(RiskScore.student_id == student.id).first()
            
            if existing:
                existing.risk_score = risk_score
                existing.risk_level = risk_level
                existing.updated_at = datetime.utcnow()
            else:
                risk_score_obj = RiskScore(
                    student_id=student.id,
                    risk_score=risk_score,
                    risk_level=risk_level
                )
                db.add(risk_score_obj)
            
            count += 1
            if count % 10 == 0:
                logger.info(f"Processed {count} students...")
                db.commit()
        
        db.commit()
        logger.info(f"✓ Successfully computed risk scores for {count} students!")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
