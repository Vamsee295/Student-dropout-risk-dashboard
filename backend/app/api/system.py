from fastapi import APIRouter, Depends
import psutil
import time
import os
from app.auth.roles import require_dean
from app.core.responses import create_success_response

router = APIRouter(prefix="/system", tags=["System & Monitoring"])

START_TIME = time.time()

@router.get("/status")
def get_system_status(current_user = Depends(require_dean)):
    uptime = time.time() - START_TIME
    cpu_usage = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return create_success_response("System status fetched", {
        "status": "operational",
        "uptime_seconds": uptime,
        "hardware": {
            "cpu_usage_percent": cpu_usage,
            "memory": {
                "total_mb": memory.total // (1024 * 1024),
                "used_mb": memory.used // (1024 * 1024),
                "percent": memory.percent
            },
            "disk": {
                "total_gb": disk.total // (1024**3),
                "used_gb": disk.used // (1024**3),
                "percent": disk.percent
            }
        },
        "process": {
            "pid": os.getpid(),
            "thread_count": len(psutil.Process().threads())
        }
    })
