from pydantic_settings import BaseSettings
from typing import List, Optional, Any, Union
from functools import lru_cache
import json

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "sqlite:///./student_risk.db"
    
    # CORS - supports comma-separated string or list or FRONTEND_URL
    cors_origins: Any = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"]
    frontend_url: Optional[str] = None

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

    def get_allowed_cors_origins(self) -> List[str]:
        origins = []
        if isinstance(self.cors_origins, list):
            origins.extend(self.cors_origins)
        elif isinstance(self.cors_origins, str):
            try:
                parsed = json.loads(self.cors_origins)
                if isinstance(parsed, list):
                    origins.extend(parsed)
                else:
                    origins.append(str(parsed))
            except Exception:
                origins.extend([o.strip() for o in self.cors_origins.split(",") if o.strip()])
        
        if self.frontend_url:
            cleaned = self.frontend_url.strip()
            if cleaned and cleaned not in origins:
                origins.append(cleaned)
        
        # Ensure default dev origins are present
        defaults = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:3000"]
        for d in defaults:
            if d not in origins:
                origins.append(d)
                
        return origins

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
