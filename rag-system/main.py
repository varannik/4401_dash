"""
RAG Error Reporting System
Receives errors, searches knowledge base, and generates meaningful logs using LLM
Supports both Azure OpenAI and AWS Bedrock
"""

import asyncio
import json
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
from models.rag_models import ErrorReport, KnowledgeQuery, ErrorResponse
from services.kafka_consumer import KafkaConsumerService
from services.kafka_producer import KafkaProducerService
from services.knowledge_base import KnowledgeBaseService
from services.llm_service import LLMService
from services.database import DatabaseService
from utils.health_check import HealthChecker

# Setup structured logging
logger = structlog.get_logger()

# Prometheus metrics
ERROR_PROCESSING_COUNTER = Counter('error_processing_total', 'Total error processing requests', ['error_type', 'status'])
LLM_REQUESTS = Counter('llm_requests_total', 'Total LLM requests', ['provider', 'status'])
KNOWLEDGE_SEARCHES = Counter('knowledge_searches_total', 'Total knowledge base searches')
PROCESSING_DURATION = Histogram('error_processing_duration_seconds', 'Error processing duration')

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting RAG Error Reporting Service")
    
    # Initialize services
    await app.state.kafka_consumer.start()
    await app.state.kafka_producer.start()
    await app.state.database.connect()
    await app.state.knowledge_base.initialize()
    await app.state.llm_service.initialize()
    
    # Start background processing
    asyncio.create_task(app.state.process_error_stream())
    
    logger.info("RAG Error Reporting Service started successfully")
    yield
    
    # Cleanup
    logger.info("Shutting down RAG Error Reporting Service")
    await app.state.kafka_consumer.stop()
    await app.state.kafka_producer.stop()
    await app.state.database.disconnect()

app = FastAPI(
    title="RAG Error Reporting Service",
    description="Knowledge-based error reporting with LLM-powered analysis for multi-cloud monitoring",
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
app.state.kafka_consumer = KafkaConsumerService(settings.KAFKA_BOOTSTRAP_SERVERS, "rag-system-group")
app.state.kafka_producer = KafkaProducerService(settings.KAFKA_BOOTSTRAP_SERVERS)
app.state.knowledge_base = KnowledgeBaseService(settings)
app.state.llm_service = LLMService(settings)
app.state.database = DatabaseService(settings.DATABASE_URL)
app.state.health_checker = HealthChecker()

async def process_error_stream():
    """
    **Step 6: RAG Error Reporting System**
    
    Background task to process error stream from anomaly detection
    
    Native Cloud Tools Used:
    - Azure: Azure Cognitive Search, Azure OpenAI
    - AWS: Amazon Kendra, Amazon Bedrock
    """
    logger.info("Starting error stream processing for RAG system")
    
    async for message in app.state.kafka_consumer.consume(['rag-error-reporting']):
        try:
            await process_error_report(message.value)
        except Exception as e:
            logger.error("Error processing error report", error=str(e))

async def process_error_report(error_data: Dict[str, Any]):
    """
    Process error report through RAG system:
    1. Search knowledge database for related content
    2. Send context to LLM for meaningful log generation
    3. Store formatted error in anomaly database
    4. Display in monitoring dashboard
    """
    try:
        with PROCESSING_DURATION.time():
            logger.info("Processing error report", error_type=error_data.get('error_type'))
            
            # Step 6.1: Search knowledge database for related content
            search_query = create_search_query(error_data)
            knowledge_results = await app.state.knowledge_base.search(search_query)
            
            KNOWLEDGE_SEARCHES.inc()
            
            logger.info("Knowledge base search completed", 
                       query=search_query, 
                       results_count=len(knowledge_results))
            
            # Step 6.2: Generate meaningful log using LLM
            llm_response = await app.state.llm_service.generate_error_analysis(
                error_data=error_data,
                knowledge_context=knowledge_results
            )
            
            LLM_REQUESTS.labels(provider=app.state.llm_service.provider, status="success").inc()
            
            # Step 6.3: Create formatted error report
            formatted_error = ErrorResponse(
                error_id=error_data.get('data', {}).get('id', 'unknown'),
                error_type=error_data.get('error_type'),
                original_error=error_data,
                knowledge_context=knowledge_results,
                llm_analysis=llm_response,
                severity=determine_severity(error_data, llm_response),
                recommendations=extract_recommendations(llm_response),
                timestamp=error_data.get('timestamp')
            )
            
            # Step 6.4: Store in anomaly database
            await app.state.database.store_error_report(formatted_error)
            
            # Step 6.5: Send to monitoring dashboard
            await app.state.kafka_producer.send_message(
                topic="dashboard-alerts",
                key=formatted_error.error_id,
                value=formatted_error.dict()
            )
            
            ERROR_PROCESSING_COUNTER.labels(
                error_type=error_data.get('error_type'), 
                status="success"
            ).inc()
            
            logger.info("Error report processed successfully", 
                       error_id=formatted_error.error_id,
                       severity=formatted_error.severity)
            
    except Exception as e:
        ERROR_PROCESSING_COUNTER.labels(
            error_type=error_data.get('error_type', 'unknown'), 
            status="error"
        ).inc()
        
        logger.error("Failed to process error report", error=str(e), error_data=error_data)

def create_search_query(error_data: Dict[str, Any]) -> str:
    """Create search query for knowledge base from error data"""
    error_type = error_data.get('error_type', '')
    service = error_data.get('service', '')
    
    # Extract key terms from error data
    key_terms = []
    
    if 'anomaly_result' in error_data and error_data['anomaly_result']:
        anomaly_result = error_data['anomaly_result']
        if 'triggered_rules' in anomaly_result:
            key_terms.extend(anomaly_result['triggered_rules'])
        if 'model_name' in anomaly_result:
            key_terms.append(anomaly_result['model_name'])
    
    if 'error' in error_data:
        # Extract error keywords
        error_msg = str(error_data['error']).lower()
        error_keywords = ['timeout', 'connection', 'database', 'kafka', 'anomaly', 'validation']
        key_terms.extend([kw for kw in error_keywords if kw in error_msg])
    
    # Construct search query
    query_parts = [error_type, service] + key_terms
    return ' '.join(filter(None, query_parts))

def determine_severity(error_data: Dict[str, Any], llm_response: str) -> str:
    """Determine error severity based on error data and LLM analysis"""
    # Check for high severity keywords in LLM response
    high_severity_keywords = ['critical', 'severe', 'urgent', 'immediate', 'failure']
    medium_severity_keywords = ['warning', 'attention', 'monitor', 'investigate']
    
    llm_lower = llm_response.lower()
    
    if any(keyword in llm_lower for keyword in high_severity_keywords):
        return "high"
    elif any(keyword in llm_lower for keyword in medium_severity_keywords):
        return "medium"
    else:
        return "low"

def extract_recommendations(llm_response: str) -> List[str]:
    """Extract actionable recommendations from LLM response"""
    recommendations = []
    
    # Simple extraction - in production, use more sophisticated NLP
    lines = llm_response.split('\n')
    for line in lines:
        line = line.strip()
        if any(line.startswith(prefix) for prefix in ['Recommendation:', 'Action:', 'Solution:', '- ']):
            recommendations.append(line)
    
    return recommendations[:5]  # Limit to top 5 recommendations

app.state.process_error_stream = process_error_stream

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "RAG Error Reporting Service",
        "version": "1.0.0",
        "status": "running",
        "description": "Knowledge-based error reporting with LLM-powered analysis"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health_status = await app.state.health_checker.check_all_services([
        app.state.kafka_consumer,
        app.state.kafka_producer,
        app.state.database,
        app.state.knowledge_base,
        app.state.llm_service
    ])
    
    if health_status["status"] == "healthy":
        return health_status
    else:
        raise HTTPException(status_code=503, detail=health_status)

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/analyze")
async def analyze_error(error_report: ErrorReport):
    """Manual error analysis endpoint"""
    try:
        with PROCESSING_DURATION.time():
            logger.info("Manual error analysis requested", error_id=error_report.error_id)
            
            # Search knowledge base
            knowledge_results = await app.state.knowledge_base.search(error_report.search_query)
            
            # Generate LLM analysis
            llm_response = await app.state.llm_service.generate_error_analysis(
                error_data=error_report.error_data,
                knowledge_context=knowledge_results
            )
            
            result = ErrorResponse(
                error_id=error_report.error_id,
                error_type=error_report.error_type,
                original_error=error_report.error_data,
                knowledge_context=knowledge_results,
                llm_analysis=llm_response,
                severity=determine_severity(error_report.error_data, llm_response),
                recommendations=extract_recommendations(llm_response),
                timestamp=error_report.timestamp
            )
            
            return result
            
    except Exception as e:
        logger.error("Failed manual error analysis", error=str(e))
        raise HTTPException(status_code=500, detail=f"Error analysis failed: {str(e)}")

@app.get("/knowledge/search")
async def search_knowledge(query: str, limit: int = 10):
    """Search knowledge base endpoint"""
    try:
        results = await app.state.knowledge_base.search(query, limit=limit)
        KNOWLEDGE_SEARCHES.inc()
        return {"query": query, "results": results, "count": len(results)}
    except Exception as e:
        logger.error("Failed knowledge search", error=str(e))
        raise HTTPException(status_code=500, detail=f"Knowledge search failed: {str(e)}")

@app.post("/knowledge/add")
async def add_knowledge(content: Dict[str, Any]):
    """Add content to knowledge base"""
    try:
        await app.state.knowledge_base.add_document(content)
        logger.info("Added content to knowledge base", doc_id=content.get('id'))
        return {"status": "success", "message": "Content added to knowledge base"}
    except Exception as e:
        logger.error("Failed to add knowledge", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to add knowledge: {str(e)}")

@app.get("/reports")
async def get_error_reports(limit: int = 50, severity: Optional[str] = None):
    """Get recent error reports"""
    try:
        reports = await app.state.database.get_error_reports(limit=limit, severity=severity)
        return {"reports": reports, "count": len(reports)}
    except Exception as e:
        logger.error("Failed to get error reports", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get reports: {str(e)}")

@app.get("/statistics")
async def get_rag_statistics():
    """Get RAG system statistics"""
    try:
        stats = await app.state.database.get_rag_stats()
        return stats
    except Exception as e:
        logger.error("Failed to get RAG statistics", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 