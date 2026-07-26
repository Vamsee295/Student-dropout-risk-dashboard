import os
import json
from datetime import datetime, timezone
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.repositories.mlops_repo import mlops_repo
from app.ml.train import train_models
from app.ml.model_loader import model_loader
from app.models.student import Student
from app.models.analytics import ModelVersion
from app.schemas.mlops import DriftStatusResponse

class MLOpsService:
    def trigger_retraining(self, db: Session):
        # 1. Fetch current data
        # For simplicity in this project phase, we fetch all students to a DataFrame
        # In enterprise, this would be a specialized data extraction pipeline
        students = db.execute(select(Student)).scalars().all()
        data = []
        for s in students:
            # We would normally aggregate attendance, assessments, etc.
            # We can use the logic similar to what powers the dashboard overview
            # But for this demo, we can just use the synthetic generator or a simplified DB extract
            data.append({
                "attendance_percentage": 85.0, # Placeholder for demo
                "cgpa": 7.5,
                "previous_semester_cgpa": 7.4,
                "lms_login_frequency": 15,
                "total_assignments": 10,
                "assignments_completed": 8,
                "department": s.department.value if s.department else "CSE",
                "dropout_risk": 0 # This would be historical truth label
            })
            
        df = pd.DataFrame(data)
        if len(df) < 50:
            # Fallback to synthetic if not enough data
            df = None
            
        # 2. Train new model
        import time
        version_tag = f"v{int(time.time() * 1000)}"
        train_result = train_models(df, version_tag)
        
        # 3. Create model version in DB
        model_data = {
            "version": train_result["version"],
            "model_path": train_result["model_path"],
            "accuracy": train_result["metrics"]["accuracy"],
            "precision": train_result["metrics"]["precision"],
            "recall": train_result["metrics"]["recall"],
            "f1_score": train_result["metrics"]["f1_score"],
            "training_samples": train_result["training_samples"],
            "feature_importance": train_result["feature_importance"],
            "feature_means": train_result["feature_means"],
            "is_active": False # Don't activate immediately
        }
        
        new_version = mlops_repo.create_version(db, model_data)
        
        # 4. Evaluate against current
        active_model = mlops_repo.get_active_model(db)
        improvement = {}
        if active_model:
            # Compare F1 score
            f1_diff = new_version.f1_score - active_model.f1_score
            improvement["f1_score"] = f1_diff
            if f1_diff > 0:
                mlops_repo.set_active_version(db, new_version.id)
                model_loader.reload(new_version.version)
                return True, "Model improved and activated.", new_version, active_model, improvement
            else:
                return True, "Model trained but did not improve over active model.", new_version, active_model, improvement
        else:
            mlops_repo.set_active_version(db, new_version.id)
            model_loader.reload(new_version.version)
            return True, "First model trained and activated.", new_version, None, None

    def rollback_model(self, db: Session, version: str):
        target_version = mlops_repo.get_version_by_name(db, version)
        if not target_version:
            return False, "Version not found."
            
        mlops_repo.set_active_version(db, target_version.id)
        model_loader.reload(target_version.version)
        return True, f"Rolled back to {version}"

    def get_dashboard_metrics(self, db: Session):
        active_model = mlops_repo.get_active_model(db)
        if not active_model:
            return None
            
        prediction_count = mlops_repo.get_prediction_count(db, active_model.id)
        
        # Drift Detection (Simplified)
        drift_status = DriftStatusResponse(
            has_drift=False,
            drifted_features=[],
            drift_details={}
        )
        
        return {
            "current_version": active_model.version,
            "training_date": active_model.trained_at,
            "training_dataset_size": active_model.training_samples,
            "prediction_count": prediction_count,
            "average_inference_time_ms": 12.5, # Simulated metric
            "current_metrics": {
                "accuracy": active_model.accuracy,
                "precision": active_model.precision,
                "recall": active_model.recall,
                "f1_score": active_model.f1_score
            },
            "data_drift_status": drift_status
        }

mlops_service = MLOpsService()
