"""
Anomaly Detection Service
Implements 2-step anomaly detection: Heuristic Rules + Machine Learning
Supports both Azure ML and AWS SageMaker
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import structlog
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from prometheus_client import Counter, Histogram, Gauge

from config import settings
from models.anomaly_models import AnomalyDetectionRequest, AnomalyResult, HeuristicRule
from services.kafka_consumer import KafkaConsumerService
from services.kafka_producer import KafkaProducerService
from services.heuristic_engine import HeuristicEngine
from services.ml_engine import MLEngine
from services.database import DatabaseService
from utils.health_check import HealthChecker

# Setup structured logging
logger = structlog.get_logger()

# Prometheus metrics
ANOMALY_COUNTER = Counter('anomaly_detection_total', 'Total anomaly detection requests', ['detection_type', 'result'])
DETECTION_DURATION = Histogram('anomaly_detection_duration_seconds', 'Anomaly detection duration')
ACTIVE_MODELS = Gauge('active_ml_models', 'Number of active ML models')

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting Anomaly Detection Service")
    
    # Initialize services
    await app.state.kafka_consumer.start()
    await app.state.kafka_producer.start()
    await app.state.database.connect()
    await app.state.heuristic_engine.initialize()
    await app.state.ml_engine.initialize()
    
    # Start background processing
    asyncio.create_task(app.state.process_data_stream())
    
    logger.info("Anomaly Detection Service started successfully")
    yield
    
    # Cleanup
    logger.info("Shutting down Anomaly Detection Service")
    await app.state.kafka_consumer.stop()
    await app.state.kafka_producer.stop()
    await app.state.database.disconnect()

app = FastAPI(
    title="Anomaly Detection Service",
    description="2-step anomaly detection: Heuristic Rules + Machine Learning for multi-cloud monitoring",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
app.state.kafka_consumer = KafkaConsumerService(settings.KAFKA_BOOTSTRAP_SERVERS, "anomaly-detection-group")
app.state.kafka_producer = KafkaProducerService(settings.KAFKA_BOOTSTRAP_SERVERS)
app.state.heuristic_engine = HeuristicEngine(settings)
app.state.ml_engine = MLEngine(settings)
app.state.database = DatabaseService(settings.DATABASE_URL)
app.state.health_checker = HealthChecker()

async def process_data_stream():
    """Background task to process data stream for anomaly detection"""
    logger.info("Starting data stream processing for anomaly detection")
    
    async for message in app.state.kafka_consumer.consume(['data-processing-output']):
        try:
            await process_anomaly_detection(message.value)
        except Exception as e:
            logger.error("Error processing anomaly detection", error=str(e))

async def process_anomaly_detection(data: Dict[str, Any]):
    """
    **Step 5: Anomaly Detection Processing (2-step process)**
    
    Step 5.1: Heuristic Rules Detection
    Step 5.2: Machine Learning Detection
    
    Native Cloud Tools Used:
    - Azure: Azure Machine Learning, Azure Cognitive Services
    - AWS: Amazon SageMaker, Amazon Comprehend
    """
    try:
        with DETECTION_DURATION.time():
            logger.info("Starting anomaly detection", data_id=data.get('id'))
            
            # Step 5.1: Heuristic Rules Detection
            heuristic_result = await app.state.heuristic_engine.detect_anomalies(data)
            
            if heuristic_result.is_anomaly:
                logger.warning("Heuristic anomaly detected", 
                             data_id=data.get('id'), 
                             rules_triggered=heuristic_result.triggered_rules)
                
                # Send to RAG error reporting system
                await send_to_rag_system(data, heuristic_result, "heuristic")
                
                ANOMALY_COUNTER.labels(detection_type="heuristic", result="anomaly").inc()
                return
            
            # Step 5.2: Machine Learning Detection (only if heuristic passed)
            ml_result = await app.state.ml_engine.detect_anomalies(data)
            
            if ml_result.is_anomaly:
                logger.warning("ML anomaly detected", 
                             data_id=data.get('id'), 
                             confidence=ml_result.confidence,
                             model_used=ml_result.model_name)
                
                # Send to RAG error reporting system
                await send_to_rag_system(data, ml_result, "machine_learning")
                
                ANOMALY_COUNTER.labels(detection_type="ml", result="anomaly").inc()
                return
            
            # No anomaly detected - send to final database
            logger.info("No anomaly detected, sending to final database", data_id=data.get('id'))
            
            await app.state.kafka_producer.send_message(
                topic="final-data-storage",
                key=data.get('id'),
                value=data
            )
            
            ANOMALY_COUNTER.labels(detection_type="all", result="clean").inc()
            
    except Exception as e:
        logger.error("Error in anomaly detection process", error=str(e), data_id=data.get('id'))
        
        # Send error to RAG system
        error_data = {
            "error": str(e),
            "data": data,
            "service": "anomaly-detection",
            "timestamp": data.get('timestamp')
        }
        await send_to_rag_system(error_data, None, "system_error")

async def send_to_rag_system(data: Dict[str, Any], anomaly_result: Any, error_type: str):
    """Send anomaly/error data to RAG error reporting system"""
    try:
        error_message = {
            "error_type": error_type,
            "data": data,
            "anomaly_result": anomaly_result.dict() if anomaly_result else None,
            "timestamp": data.get('timestamp'),
            "service": "anomaly-detection"
        }
        
        await app.state.kafka_producer.send_message(
            topic="rag-error-reporting",
            key=data.get('id', 'unknown'),
            value=error_message
        )
        
        logger.info("Sent error to RAG system", error_type=error_type, data_id=data.get('id'))
        
    except Exception as e:
        logger.error("Failed to send error to RAG system", error=str(e))

app.state.process_data_stream = process_data_stream

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Anomaly Detection Service",
        "version": "1.0.0",
        "status": "running",
        "description": "2-step anomaly detection: Heuristic Rules + Machine Learning"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)