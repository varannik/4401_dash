"""
Configuration settings for Data Ingestion Service
Supports both Azure and AWS cloud environments
"""

import os
from typing import List, Optional
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    """Application settings with cloud provider configurations"""
    
    # General Configuration
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # Database Configuration
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    REDIS_URL: str = Field(..., env="REDIS_URL")
    
    # Kafka Configuration
    KAFKA_BOOTSTRAP_SERVERS: str = Field(..., env="KAFKA_BOOTSTRAP_SERVERS")
    KAFKA_GROUP_ID: str = Field(default="data-ingestion-group", env="KAFKA_GROUP_ID")
    
    # Data Processing Settings
    BATCH_SIZE: int = Field(default=1000, env="BATCH_SIZE")
    PROCESSING_INTERVAL: int = Field(default=60, env="PROCESSING_INTERVAL")
    
    # Feature Flags
    ENABLE_AZURE: bool = Field(default=True, env="ENABLE_AZURE")
    ENABLE_AWS: bool = Field(default=True, env="ENABLE_AWS")
    
    # Azure Configuration
    AZURE_TENANT_ID: Optional[str] = Field(default=None, env="AZURE_TENANT_ID")
    AZURE_CLIENT_ID: Optional[str] = Field(default=None, env="AZURE_CLIENT_ID")
    AZURE_CLIENT_SECRET: Optional[str] = Field(default=None, env="AZURE_CLIENT_SECRET")
    AZURE_SUBSCRIPTION_ID: Optional[str] = Field(default=None, env="AZURE_SUBSCRIPTION_ID")
    
    # Azure IoT Hub (Real-time data ingestion)
    AZURE_IOT_HUB_CONNECTION_STRING: Optional[str] = Field(default=None, env="AZURE_IOT_HUB_CONNECTION_STRING")
    AZURE_EVENT_HUB_CONNECTION_STRING: Optional[str] = Field(default=None, env="AZURE_EVENT_HUB_CONNECTION_STRING")
    
    # Azure Storage (Batch data processing)
    AZURE_STORAGE_CONNECTION_STRING: Optional[str] = Field(default=None, env="AZURE_STORAGE_CONNECTION_STRING")
    AZURE_STORAGE_CONTAINER: str = Field(default="data-ingestion", env="AZURE_STORAGE_CONTAINER")
    
    # AWS Configuration
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    AWS_DEFAULT_REGION: str = Field(default="us-east-1", env="AWS_DEFAULT_REGION")
    
    # AWS IoT Core (Real-time data ingestion)
    AWS_IOT_ENDPOINT: Optional[str] = Field(default=None, env="AWS_IOT_ENDPOINT")
    AWS_IOT_TOPIC: str = Field(default="iot/data", env="AWS_IOT_TOPIC")
    
    # AWS MSK (Managed Kafka)
    AWS_MSK_BOOTSTRAP_SERVERS: Optional[str] = Field(default=None, env="AWS_MSK_BOOTSTRAP_SERVERS")
    
    # AWS S3 (Batch data processing)
    AWS_S3_BUCKET: str = Field(default="monitoring-data-ingestion", env="AWS_S3_BUCKET")
    
    # Data Validation Settings
    ENABLE_DATA_VALIDATION: bool = Field(default=True, env="ENABLE_DATA_VALIDATION")
    MAX_FILE_SIZE_MB: int = Field(default=100, env="MAX_FILE_SIZE_MB")
    ALLOWED_FILE_TYPES: List[str] = Field(default=["csv", "json", "xlsx"], env="ALLOWED_FILE_TYPES")
    
    # Monitoring Settings
    ENABLE_METRICS: bool = Field(default=True, env="ENABLE_METRICS")
    METRICS_PORT: int = Field(default=9090, env="METRICS_PORT")
    
    # Health Check Settings
    HEALTH_CHECK_INTERVAL: int = Field(default=30, env="HEALTH_CHECK_INTERVAL")
    
    # Retry Settings
    MAX_RETRIES: int = Field(default=3, env="MAX_RETRIES")
    RETRY_DELAY: int = Field(default=5, env="RETRY_DELAY")
    
    # Security Settings
    JWT_SECRET: Optional[str] = Field(default=None, env="JWT_SECRET")
    ENCRYPTION_KEY: Optional[str] = Field(default=None, env="ENCRYPTION_KEY")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def get_kafka_config(self) -> dict:
        """Get Kafka configuration based on cloud provider"""
        config = {
            'bootstrap_servers': self.KAFKA_BOOTSTRAP_SERVERS,
            'group_id': self.KAFKA_GROUP_ID,
            'auto_offset_reset': 'latest',
            'enable_auto_commit': True,
            'value_serializer': lambda x: json.dumps(x).encode('utf-8')
        }
        
        # Use AWS MSK if available
        if self.ENABLE_AWS and self.AWS_MSK_BOOTSTRAP_SERVERS:
            config['bootstrap_servers'] = self.AWS_MSK_BOOTSTRAP_SERVERS
            # Add MSK IAM authentication if needed
            if self.AWS_ACCESS_KEY_ID:
                config.update({
                    'security_protocol': 'SASL_SSL',
                    'sasl_mechanism': 'AWS_MSK_IAM',
                    'sasl_oauth_token_provider': 'aws'
                })
        
        return config
    
    def get_azure_iot_config(self) -> dict:
        """Get Azure IoT Hub configuration"""
        if not self.ENABLE_AZURE or not self.AZURE_IOT_HUB_CONNECTION_STRING:
            return {}
            
        return {
            'connection_string': self.AZURE_IOT_HUB_CONNECTION_STRING,
            'event_hub_connection_string': self.AZURE_EVENT_HUB_CONNECTION_STRING,
            'storage_connection_string': self.AZURE_STORAGE_CONNECTION_STRING,
            'container_name': self.AZURE_STORAGE_CONTAINER
        }
    
    def get_aws_iot_config(self) -> dict:
        """Get AWS IoT Core configuration"""
        if not self.ENABLE_AWS or not self.AWS_IOT_ENDPOINT:
            return {}
            
        return {
            'endpoint': self.AWS_IOT_ENDPOINT,
            'topic': self.AWS_IOT_TOPIC,
            'region': self.AWS_DEFAULT_REGION,
            'access_key_id': self.AWS_ACCESS_KEY_ID,
            'secret_access_key': self.AWS_SECRET_ACCESS_KEY,
            's3_bucket': self.AWS_S3_BUCKET
        }

# Create global settings instance
settings = Settings() 