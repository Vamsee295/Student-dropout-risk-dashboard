from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
import time

router = APIRouter(tags=["Health"])

startup_time = time.time()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Check DB Connection
    db_status = "connected"
    try:
        db.execute("SELECT 1")
    except Exception:
        db_status = "disconnected"

    # Check ML Model (simplified check based on module presence)
    from app.ml.model_loader import model_loader
    ml_status = "loaded" if model_loader.model else "not_loaded"

    # Calculate Uptime
    uptime_seconds = int(time.time() - startup_time)
    days, remainder = divmod(uptime_seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, _ = divmod(remainder, 60)
    
    if days > 0:
        uptime_str = f"{days} days"
    elif hours > 0:
        uptime_str = f"{hours} hours"
    else:
        uptime_str = f"{minutes} minutes"

    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "mlModel": ml_status,
        "uptime": uptime_str
    }

@router.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    """Used by Kubernetes/Docker to know when the container can accept traffic."""
    try:
        db.execute("SELECT 1")
        return {"status": "ready"}
    except Exception:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Service Unavailable (Database unreachable)")

@router.get("/live")
def liveness_check():
    """Used by Kubernetes/Docker to know if the container is running."""
    return {"status": "alive"}
