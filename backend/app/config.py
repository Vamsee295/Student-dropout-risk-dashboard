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
    database_url: str = "mysql+pymysql://root:Sanjith_2005@localhost:3306/healthcare_db"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # JWT
    secret_key: str = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours (86400000 ms)

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
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
