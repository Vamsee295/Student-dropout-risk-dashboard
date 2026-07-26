from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.security import get_current_user
from app.models.user import User
from app.models.enums import Role
from app.services.mlops_service import mlops_service
from app.repositories.mlops_repo import mlops_repo
from app.schemas.mlops import (
    ModelRollbackRequest,
    ModelHealthDashboardResponse,
    RetrainResponse,
    ModelVersionResponse
)
from typing import List

router = APIRouter()

def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != Role.DEAN: 
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

@router.post("/retrain", response_model=RetrainResponse)
def trigger_retraining(
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_admin_user) # Optionally require auth
):
    success, message, new_model, old_model, improvement = mlops_service.trigger_retraining(db)
    
    return RetrainResponse(
        success=success,
        message=message,
        new_version=new_model.version if new_model else None,
        old_version=old_model.version if old_model else None,
        improvement=improvement,
        metrics={
            "accuracy": new_model.accuracy,
            "f1_score": new_model.f1_score
        } if new_model else None
    )

@router.post("/rollback")
def rollback_model(
    request: ModelRollbackRequest,
    db: Session = Depends(get_db)
):
    success, msg = mlops_service.rollback_model(db, request.version)
    if not success:
        raise HTTPException(status_code=404, detail=msg)
    return {"message": msg}

@router.get("/status", response_model=ModelHealthDashboardResponse)
def get_model_status(db: Session = Depends(get_db)):
    metrics = mlops_service.get_dashboard_metrics(db)
    if not metrics:
        raise HTTPException(status_code=404, detail="No active model found")
    return metrics

@router.get("/version", response_model=List[ModelVersionResponse])
def list_versions(db: Session = Depends(get_db)):
    versions = mlops_repo.get_all_versions(db)
    return versions

@router.get("/history", response_model=List[ModelVersionResponse])
def get_history(db: Session = Depends(get_db)):
    versions = mlops_repo.get_all_versions(db)
    return versions

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    metrics = mlops_service.get_dashboard_metrics(db)
    if not metrics:
        raise HTTPException(status_code=404, detail="No active model found")
    return metrics["current_metrics"]
