import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from app.database.session import SessionLocal
from app.services.mlops_service import mlops_service
from app.repositories.mlops_repo import mlops_repo
from app.models.analytics import ModelVersion
import os

async def test_mlops_flow():
    db = SessionLocal()
    
    # 1. Check current versions
    versions = mlops_repo.get_all_versions(db)
    print(f"Current versions: {len(versions)}")
    
    # 2. Trigger retraining
    print("Triggering retraining...")
    success, msg, new_model, old_model, improvement = mlops_service.trigger_retraining(db)
    print(f"Retrain success: {success}, msg: {msg}")
    
    if new_model:
        print(f"New model version: {new_model.version}, Active: {new_model.is_active}")
        
    # 3. Check status
    metrics = mlops_service.get_dashboard_metrics(db)
    if metrics:
        print(f"Dashboard metrics: {metrics['current_version']}")
    
    # 4. Trigger a second retraining to test comparison
    print("Triggering second retraining...")
    success, msg, new_model2, old_model2, improvement2 = mlops_service.trigger_retraining(db)
    print(f"Retrain 2 success: {success}, msg: {msg}")
    if new_model2:
        print(f"New model 2 version: {new_model2.version}, Active: {new_model2.is_active}")
    
    # 5. Rollback
    if new_model and new_model.is_active:
        print("Rolling back to first model...")
        success, msg = mlops_service.rollback_model(db, new_model.version)
        print(f"Rollback result: {success}, {msg}")
        
    db.close()

if __name__ == "__main__":
    asyncio.run(test_mlops_flow())
