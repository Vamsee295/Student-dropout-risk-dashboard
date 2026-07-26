from sqlalchemy.orm import Session
from sqlalchemy import select, desc, update, func
from app.models.analytics import ModelVersion, RiskScore
from typing import List, Optional

class MLOpsRepository:
    def get_active_model(self, db: Session) -> Optional[ModelVersion]:
        return db.execute(
            select(ModelVersion).where(ModelVersion.is_active == True)
        ).scalars().first()
        
    def get_all_versions(self, db: Session) -> List[ModelVersion]:
        return db.execute(
            select(ModelVersion).order_by(desc(ModelVersion.trained_at))
        ).scalars().all()
        
    def get_version_by_name(self, db: Session, version: str) -> Optional[ModelVersion]:
        return db.execute(
            select(ModelVersion).where(ModelVersion.version == version)
        ).scalars().first()
        
    def create_version(self, db: Session, model_data: dict) -> ModelVersion:
        new_version = ModelVersion(**model_data)
        db.add(new_version)
        db.commit()
        db.refresh(new_version)
        return new_version
        
    def set_active_version(self, db: Session, version_id: int):
        # Deactivate all
        db.execute(
            update(ModelVersion).values(is_active=False)
        )
        # Activate specific
        db.execute(
            update(ModelVersion).where(ModelVersion.id == version_id).values(is_active=True)
        )
        db.commit()
        
    def get_prediction_count(self, db: Session, version_id: int) -> int:
        result = db.execute(
            select(func.count(RiskScore.id)).where(RiskScore.model_version_id == version_id)
        ).scalar()
        return result or 0

mlops_repo = MLOpsRepository()
