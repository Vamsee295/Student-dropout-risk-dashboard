from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class DriftStatusResponse(BaseModel):
    has_drift: bool
    drifted_features: List[str]
    drift_details: Dict[str, Any]

class RetrainResponse(BaseModel):
    success: bool
    message: str
    new_version: Optional[str] = None
    old_version: Optional[str] = None
    improvement: Optional[Dict[str, float]] = None
    metrics: Optional[Dict[str, float]] = None

class ModelHealthDashboardResponse(BaseModel):
    current_version: str
    training_date: datetime
    training_dataset_size: int
    prediction_count: int
    average_inference_time_ms: float
    current_metrics: Dict[str, float]
    data_drift_status: DriftStatusResponse

class ModelRollbackRequest(BaseModel):
    version: str

class ModelVersionResponse(BaseModel):
    id: int
    version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    training_samples: int
    is_active: bool
    trained_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
