from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
from enum import Enum

class SensorData(BaseModel):
    timestamp: datetime
    data: Dict[str, float]

class AnomalyResult(BaseModel):
    value: float
    alarm_type: str  
    status: str
    context: Optional[str] = None

class MLAnomalyResult(BaseModel):
    values: Dict[str, float]
    status: str

class DetectionMethod(str, Enum):
    HEURISTIC = "heuristic"
    STATISTICAL = "statistical"
    ML = "ml"

class DetectionResponse(BaseModel):
    timestamp: datetime
    method: DetectionMethod  
    results: Dict[str, AnomalyResult]
    processing_time_ms: float

class MLDetectionResponse(BaseModel):
    timestamp: datetime
    method: DetectionMethod 
    results: MLAnomalyResult
    processing_time_ms: float

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    redis_connected: bool
    system_health: Dict[str, Any]

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime





