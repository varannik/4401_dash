from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import contextmanager
from contextlib import asynccontextmanager
import time
from datetime import datetime
from typing import List

from ..config.settings import settings
from ..models.schemas import (
    DetectionMethod, MLDetectionResponse, SensorData, DetectionResponse, HealthResponse, ErrorResponse
)
from ..services.anomaly_service import anomaly_service
from ..utils.logging import setup_logging, get_logger

# Setup logging
setup_logging()
logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting anomaly detection API")
    anomaly_service.initialize()  
    logger.info("Anomaly detection API started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down anomaly detection API")

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Production-ready anomaly detection system with multiple detection methods",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.exception_handler(Exception)
def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error("Unhandled exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            detail=str(exc),
            timestamp=datetime.now()
        ).dict()
    )

@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    try:
        system_health = anomaly_service.get_system_health()
        redis_connected = system_health.get("status") == "healthy"
        
        return {
            "status": "healthy" if redis_connected else "degraded",
            "timestamp": datetime.now().isoformat(),
            "version": settings.app_version,
            "redis_connected": redis_connected,
            "system_health": system_health
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.post("/detect/heuristic", response_model=DetectionResponse, tags=["Detection"])
def detect_heuristic_anomalies(sensor_data: SensorData):
    """
    Detect anomalies using heuristic method only.
    """
    try:
        logger.info("Processing heuristic detection request", timestamp=sensor_data.timestamp)
        
        heuristic_result = anomaly_service.detect_heuristic_anomalies(sensor_data)
        
        logger.info("Heuristic detection completed", 
                   processing_time=heuristic_result.processing_time_ms)
        
        return heuristic_result
        
    except Exception as e:
        logger.error("Heuristic detection failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Heuristic detection failed: {str(e)}")

@app.post("/detect/statistical", response_model=DetectionResponse, tags=["Detection"])
def detect_statistical_anomalies(sensor_data: SensorData):
    """
    Detect anomalies using statistical method only.
    """
    try:
        logger.info("Processing statistical detection request", timestamp=sensor_data.timestamp)
        
        statistical_result = anomaly_service.detect_statistical_anomalies(sensor_data)
        
        logger.info("Statistical detection completed", 
                   processing_time=statistical_result.processing_time_ms)
        
        return statistical_result
        
    except Exception as e:
        logger.error("Statistical detection failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Statistical detection failed: {str(e)}")
    
@app.post("/detect/ml", response_model=MLDetectionResponse, tags=["Detection"])
def detect_ml_anomalies(sensor_data: SensorData) -> MLDetectionResponse:

    """Run only ML detection."""
    
    try:
        logger.info("Processing ML detection request", timestamp=sensor_data.timestamp)
        
        result = anomaly_service.detect_ml_anomalies(sensor_data)
        
        logger.info("ML detection completed", 
                   processing_time=result.processing_time_ms)
        
        return MLDetectionResponse.model_validate(result.model_dump())
        
    except Exception as e:
        logger.error("ML detection failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"ML detection failed: {str(e)}")



@app.get("/stats", tags=["Monitoring"])
def get_statistics():
    """Get system statistics and performance metrics."""
    try:
        system_health = anomaly_service.get_system_health()
        return {
            "system_health": system_health,
            "config": {
                "window_size": settings.statistical_window_size,
                "min_data_points": 4,
                "redis_prefix": settings.redis_key_prefix
            }
        }
    except Exception as e:
        logger.error("Failed to get statistics", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get statistics")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.anomaly_detection.api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )