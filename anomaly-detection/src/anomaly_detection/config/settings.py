from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application
    app_name: str = "Anomaly Detection System"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Redis Configuration
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: Optional[str] = None
    redis_ssl: bool = False
    
    # Azure Configuration
    azure_storage_connection_string: Optional[str] = None
    azure_key_vault_url: Optional[str] = None

    azure_openai_api_key: Optional[str] = None
    azure_openai_endpoint: Optional[str] = None
    azure_openai_api_version: str = "2024-02-01-preview"
    azure_openai_deployment: Optional[str] = None
    azure_openai_model: Optional[str] = None


    # Data paths
    alarm_context_path: str = "data/processed/alarm_context.json"
    excel_questionnaire_path: str = "data/raw/Questionnaire.xlsx"
    ml_model_path: str = "data/processed/ml_models/"
    thresholds_path: str = "data/processed/thresholds.json"
    
    # Anomaly Detection Configuration
    statistical_window_size: int = 100
    statistical_min_data_points: int = 4
    redis_key_prefix: str = "anomaly"
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: list = ["*"]
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = False

# Global settings instance
try:
    settings = Settings()
except Exception as e:
    print(f"❌ Configuration Error: {e}")
    print("Please ensure your .env file your required OPENAI key and model")
    exit(1)