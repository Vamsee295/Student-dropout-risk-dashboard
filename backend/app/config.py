"""
Configuration module for Student Dropout Risk Analytics System.
Loads and validates environment variables.
"""

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/student_dropout_db"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000"]
    
    # Model
    model_version: str = "auto"
    shap_cache_size: int = 100
    
    # Logging
    log_level: str = "INFO"
    
    # Retraining
    retraining_schedule: str = "0 2 * * 0"  # Weekly Sunday 2am
    
    # Drift Detection
    drift_threshold: float = 0.20
    
    # Alerts
    risk_increase_alert_threshold: float = 15.0
    
    # Application
    app_name: str = "Student Dropout Risk Analytics"
    app_version: str = "1.0.0"
    
    # Paths
    models_dir: str = "models/versions"
    data_dir: str = "data"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
