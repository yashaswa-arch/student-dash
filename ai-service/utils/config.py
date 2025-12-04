"""
Configuration management for AI Code Intelligence Service
"""

from pydantic import BaseSettings, Field
from typing import Optional
import os
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Service Configuration
    ai_service_host: str = Field(default="127.0.0.1", env="AI_SERVICE_HOST")
    ai_service_port: int = Field(default=8001, env="AI_SERVICE_PORT")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_file: str = Field(default="ai_service.log", env="LOG_FILE")
    
    # OpenAI Configuration
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-3.5-turbo", env="OPENAI_MODEL")
    openai_max_tokens: int = Field(default=1000, env="OPENAI_MAX_TOKENS")
    openai_temperature: float = Field(default=0.3, env="OPENAI_TEMPERATURE")
    
    # Backend Integration
    backend_url: str = Field(default="http://localhost:5000", env="BACKEND_URL")
    backend_api_key: str = Field(default="your-backend-api-key", env="BACKEND_API_KEY")
    jwt_secret: str = Field(default="your-jwt-secret", env="JWT_SECRET")
    
    # Feature Flags
    enable_openai_analysis: bool = Field(default=True, env="ENABLE_OPENAI_ANALYSIS")
    enable_local_analysis: bool = Field(default=True, env="ENABLE_LOCAL_ANALYSIS")
    enable_learning_recommendations: bool = Field(default=True, env="ENABLE_LEARNING_RECOMMENDATIONS")
    
    # Code Analysis Limits
    max_code_length: int = Field(default=10000, env="MAX_CODE_LENGTH")
    analysis_timeout: int = Field(default=30, env="ANALYSIS_TIMEOUT_SECONDS")
    
    # Database Configuration (if using separate AI database)
    ai_database_url: Optional[str] = Field(default=None, env="AI_DATABASE_URL")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Environment-specific configurations
DEVELOPMENT_SETTINGS = {
    "log_level": "DEBUG",
    "openai_temperature": 0.2,
    "analysis_timeout": 60
}

PRODUCTION_SETTINGS = {
    "log_level": "WARNING",
    "openai_temperature": 0.1,
    "analysis_timeout": 15
}

def get_environment() -> str:
    """Detect current environment"""
    return os.getenv("ENVIRONMENT", "development").lower()

def apply_environment_settings(settings: Settings) -> Settings:
    """Apply environment-specific overrides"""
    env = get_environment()
    
    if env == "production":
        for key, value in PRODUCTION_SETTINGS.items():
            setattr(settings, key, value)
    elif env == "development":
        for key, value in DEVELOPMENT_SETTINGS.items():
            setattr(settings, key, value)
    
    return settings