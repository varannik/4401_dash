import time
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime
from enum import Enum
from ..core.HeuristicAnomalyDetector import HeuristicAnomalyDetector
from ..core.StatisticalAnomalyDetector import StatisticalAnomalyDetector
from ..core.context_processor import AlarmContextProcessor
from ..core.MLAnomalyDetector import MLAnomalyDetector
from ..integrations.llm import LLM
from ..models.schemas import MLDetectionResponse, SensorData, DetectionResponse, HealthResponse, ErrorResponse, DetectionMethod
from ..utils.logging import get_logger
from ..config.settings import settings
import os
import json

logger = get_logger(__name__)

class AnomalyDetectionService:
    """Service class for managing anomaly detection operations."""
    
    def __init__(self):
        self.heuristic_detector: Optional[HeuristicAnomalyDetector] = None
        self.statistical_detector: Optional[StatisticalAnomalyDetector] = None
        self.ml_detector: Optional[MLAnomalyDetector] = None
        self._initialized = False
        
    def initialize(self) -> None:
        """Initialize all 3 anomaly detectors"""
        if self._initialized:
            return
            
        try:

            # Load the threshold values
            with open(settings.thresholds_path, "r", encoding="utf-8") as f:
                thresholds = json.load(f)

            # Check if alarm_context.json exists
            if not os.path.exists(settings.alarm_context_path):
                logger.info("alarm_context.json not found, generating from Excel...")
                AlarmContextProcessor.create_json_from_excel(
                    settings.excel_questionnaire_path,
                    output_json_path=settings.alarm_context_path
                )

            # Initialize context processor
            context_processor = AlarmContextProcessor.from_json_file(
                settings.alarm_context_path
            )

            # Initialize LLM
            llm = LLM(enabled=True)
            
            # Initialize heuristic detector
            self.heuristic_detector = HeuristicAnomalyDetector(
                thresholds=thresholds,
                context_processor=context_processor,
                llm=llm
            )

            # Initialize statistical detector
            self.statistical_detector = StatisticalAnomalyDetector(
                window_size=settings.statistical_window_size,
                min_data_points=settings.statistical_min_data_points,
                redis_host=settings.redis_host,
                redis_port=settings.redis_port,
                redis_db=settings.redis_db,
                key_prefix=settings.redis_key_prefix,
                context_processor=context_processor,
                llm=llm
            )
        

            # Initialize ML detector
            self.ml_detector = MLAnomalyDetector(
                model_path=settings.ml_model_path
            )
            
            self._initialized = True
            logger.info("Anomaly detection service initialized successfully")

        except Exception as e:
            self.heuristic_detector = None
            self.statistical_detector = None
            self.ml_detector = None
            self._initialized = False
            logger.error("Failed to initialize anomaly detection service", error=str(e))
            raise
    
    def detect_heuristic_anomalies(self, sensor_data: SensorData) -> DetectionResponse:
        """Run only heuristic detection."""
        if not self._initialized:
            self.initialize()
        
        start_time = time.time()

        try:
            result = self._run_heuristic_detection(sensor_data)
            return result
        except Exception as e:
            logger.error("Heuristic detection failed", error=str(e))
            return self._create_error_response(
                sensor_data.timestamp, 
                DetectionMethod.HEURISTIC, 
                (time.time() - start_time) * 1000
            )

    def _run_heuristic_detection(self, record: SensorData) -> DetectionResponse:
        """Run heuristic anomaly detection."""
        start_time = time.time()
        detector_result = self.heuristic_detector.evaluate_anomaly(record)
        processing_time = (time.time() - start_time) * 1000
        
        return DetectionResponse(
            timestamp=record.timestamp,
            method=DetectionMethod.HEURISTIC,
            results=detector_result,
            processing_time_ms=processing_time
        )

    def detect_statistical_anomalies(self, sensor_data: SensorData) -> DetectionResponse:
        """Run only statistical detection."""
        if not self._initialized:
            self.initialize()
        
        start_time = time.time()
        
        try:
            result = self._run_statistical_detection(sensor_data)
            return result
        except Exception as e:
            logger.error("Statistical detection failed", error=str(e))
            return self._create_error_response(
                sensor_data.timestamp, 
                DetectionMethod.STATISTICAL, 
                (time.time() - start_time) * 1000
            )

    def _run_statistical_detection(self, record: SensorData) -> DetectionResponse:
        """Run statistical anomaly detection."""
        start_time = time.time()
        results = self.statistical_detector.evaluate_anomaly(record)
        processing_time = (time.time() - start_time) * 1000
        
        return DetectionResponse(
            timestamp=record.timestamp,
            method=DetectionMethod.STATISTICAL,
            results=results,
            processing_time_ms=processing_time
        )
        
    def detect_ml_anomalies(self, sensor_data: SensorData) -> MLDetectionResponse:
        """Run only ML detection."""
        if not self._initialized:
            self.initialize()
        
        start_time = time.time()
        
        try:
            result = self._run_ml_detection(sensor_data)
            return result
        except Exception as e:
            logger.error("ML detection failed", error=str(e))
            from ..models.schemas import MLAnomalyResult
            return MLDetectionResponse(
                timestamp=sensor_data.timestamp,
                method=DetectionMethod.ML,
                results=MLAnomalyResult(
                    values=sensor_data.data,
                    status="Error"
                ),
                processing_time_ms=(time.time() - start_time) * 1000
            )
    

    def _run_ml_detection(self, record: SensorData) -> MLDetectionResponse:
        
        start_time = time.time()
        
        result = self.ml_detector.evaluate_anomaly(record)
        processing_time = (time.time() - start_time) * 1000

        return MLDetectionResponse(
            timestamp=record.timestamp,
            method=DetectionMethod.ML,
            results=result,
            processing_time_ms=processing_time
        )
        
    def _create_error_response(self, timestamp: datetime, method: DetectionMethod, processing_time: float) -> DetectionResponse:
        """Create an error response when detection fails."""
        return DetectionResponse(
            timestamp=timestamp,
            method=method,
            results={},
            processing_time_ms=processing_time
        )
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get system health information."""
        if not self._initialized:
            return {"status": "not_initialized"}
        
        try:
            # Get Redis health
            redis_health = self.statistical_detector.get_system_health()
            
            # Get ML model info
            ml_health = {}
            if self.ml_detector:
                try:
                    ml_health = self.ml_detector.get_model_info()
                except Exception as e:
                    ml_health = {"error": str(e)}
            
            return {
                "status": "healthy",
                "redis_health": redis_health,
                "ml_health": ml_health,
                "detectors_initialized": True
            }
        
        except Exception as e:
            logger.error("Health check failed", error=str(e))
            return {
                "status": "unhealthy",
                "error": str(e)
            }

# Global service instance
anomaly_service = AnomalyDetectionService()