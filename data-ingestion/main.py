"""
Data Ingestion Service
Handles real-time IoT data and batch data from APIs/CSV files
Implements best practices for Azure and AWS integration
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import structlog
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from prometheus_client import Counter, Histogram, Gauge

from config import settings
from models.data_models import IncomingData, BatchDataRequest, IngestionStatus
from services.kafka_producer import KafkaProducerService
from services.iot_handler import IoTHandler
from services.batch_processor import BatchProcessor
from services.database import DatabaseService
from utils.health_check import HealthChecker

# Setup structured logging
logger = structlog.get_logger()

# Prometheus metrics
INGESTION_COUNTER = Counter('data_ingestion_total', 'Total data ingestion requests', ['source_type', 'status'])
INGESTION_DURATION = Histogram('data_ingestion_duration_seconds', 'Data ingestion duration')
ACTIVE_CONNECTIONS = Gauge('active_iot_connections', 'Number of active IoT connections')

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting Data Ingestion Service")
    
    # Initialize services
    await app.state.kafka_producer.start()
    await app.state.iot_handler.start()
    await app.state.database.connect()
    
    # Start background tasks
    asyncio.create_task(app.state.iot_handler.listen_for_iot_data())
    
    logger.info("Data Ingestion Service started successfully")
    yield
    
    # Cleanup
    logger.info("Shutting down Data Ingestion Service")
    await app.state.kafka_producer.stop()
    await app.state.iot_handler.stop()
    await app.state.database.disconnect()

app = FastAPI(
    title="Real-Time Data Ingestion Service",
    description="Handles IoT real-time data and batch data processing for multi-cloud monitoring",
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
app.state.kafka_producer = KafkaProducerService(settings.KAFKA_BOOTSTRAP_SERVERS)
app.state.iot_handler = IoTHandler(settings)
app.state.batch_processor = BatchProcessor(settings)
app.state.database = DatabaseService(settings.DATABASE_URL)
app.state.health_checker = HealthChecker()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Data Ingestion Service",
        "version": "1.0.0",
        "status": "running",
        "description": "Real-time IoT and batch data ingestion for multi-cloud monitoring"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health_status = await app.state.health_checker.check_all_services([
        app.state.kafka_producer,
        app.state.iot_handler,
        app.state.database
    ])
    
    if health_status["status"] == "healthy":
        return health_status
    else:
        raise HTTPException(status_code=503, detail=health_status)

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/ingest/realtime")
async def ingest_realtime_data(
    data: IncomingData,
    background_tasks: BackgroundTasks
):
    """
    **Step 1.1: Real-time data ingestion from IoT Hub**
    
    Native Cloud Tools Used:
    - Azure: Azure IoT Hub, Azure Event Hubs
    - AWS: AWS IoT Core, Amazon MSK
    """
    try:
        with INGESTION_DURATION.time():
            logger.info("Processing real-time data", device_id=data.device_id, timestamp=data.timestamp)
            
            # Validate data quality
            validated_data = await app.state.iot_handler.validate_iot_data(data)
            
            # Add timestamp if not present
            enriched_data = await app.state.iot_handler.enrich_data(validated_data)
            
            # Send to Kafka for stream processing
            await app.state.kafka_producer.send_message(
                topic="iot-data-ingestion",
                key=data.device_id,
                value=enriched_data.dict()
            )
            
            # Store in staging database
            background_tasks.add_task(
                app.state.database.insert_staging_data,
                enriched_data,
                "realtime"
            )
            
            INGESTION_COUNTER.labels(source_type="realtime", status="success").inc()
            ACTIVE_CONNECTIONS.inc()
            
            logger.info("Real-time data processed successfully", device_id=data.device_id)
            
            return {
                "status": "success",
                "message": "Real-time data ingested successfully",
                "data_id": enriched_data.id,
                "timestamp": enriched_data.timestamp
            }
            
    except Exception as e:
        INGESTION_COUNTER.labels(source_type="realtime", status="error").inc()
        logger.error("Failed to process real-time data", error=str(e), device_id=data.device_id)
        raise HTTPException(status_code=500, detail=f"Failed to ingest real-time data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)