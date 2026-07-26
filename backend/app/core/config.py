from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "mysql+pymysql://root:password@localhost:3306/edurisk"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"]

    # JWT
    secret_key: str = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours (86400000 ms)
    
    # Logging
    log_level: str = "INFO"
    
    # Application
    app_name: str = "EduRisk AI Backend"
    app_version: str = "1.0.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
