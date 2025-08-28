from ..utils.redis_namespaces import AnomalyRedisKeys, AnomalyRedisTTL
import redis
import json
import numpy as np
from typing import Dict, List, Optional, Any

from ..models.schemas import SensorData, AnomalyResult
from .context_processor import AlarmContextProcessor
from ..integrations.llm import LLM

class StatisticalAnomalyDetector:
    def __init__(self, 
                 window_size: int, 
                 min_data_points: int,
                 redis_host: str, 
                 redis_port: int, 
                 redis_db: int, 
                 key_prefix: str,
                 context_processor: AlarmContextProcessor,
                 llm: LLM):

        self.window_size = window_size
        self.min_data_points = min_data_points 
        self.redis_client = redis.Redis(host=redis_host, port=redis_port, db=redis_db, decode_responses=True)
        self.key_prefix = key_prefix
        self.context_processor = context_processor
        self.llm = llm


    def evaluate_anomaly(self, record: SensorData) -> Dict[str, AnomalyResult]:
        """
        Process a multi-sensor record and return anomaly detection results
        """
        timestamp = record.timestamp
        sensor_data = record.data
        
        results = {}
        
        # Process each sensor individually
        for sensor_name, value in sensor_data.items():
            # Create simple data point (just timestamp and value)
            point_data = {
                "timestamp": timestamp.isoformat(),
                "value": float(value)
            }
            
            # Get PREVIOUS data for this sensor (before adding new point)
            previous_data = self._get_sensor_queue_data(sensor_name)
            
            # Check for outlier using ONLY previous data
            outlier_info = self._check_outlier(point_data, previous_data)
            
            # Add to sensor-specific queue AFTER calculation
            self._add_to_sensor_queue(sensor_name, point_data)
            
            # Create AnomalyResult object
            results[sensor_name] = AnomalyResult(
                value=value,
                alarm_type=outlier_info["alarm_type"], 
                status="Anomaly" if outlier_info["alarm_type"] != "OK" else "Normal", 
                context=""
            )
            
            # If anomaly attach context and summarize via LLM
            if results[sensor_name].alarm_type != "OK":
                raw_ctx = self.context_processor.lookup_context(sensor_name, results[sensor_name].alarm_type)
                if raw_ctx:
                    try:
                        text = self.llm.summarize(sensor_name, results[sensor_name].alarm_type, raw_ctx)
                        results[sensor_name].context = text if text else "LLM summarization failed"
                    except Exception as e:
                        print(f"LLM error for {sensor_name}: {e}")
                        results[sensor_name].context = "LLM summarization error"
                else:
                    results[sensor_name].context = f"No context available for {sensor_name} {results[sensor_name].alarm_type}"
        
        return results


    def _get_sensor_queue_key(self, sensor_name: str) -> str:
        """Generate Redis key for specific sensor"""
        return AnomalyRedisKeys.temp_data(sensor_name)
    
    def _add_to_sensor_queue(self, sensor_name: str, point_data: Dict):
        """Add data point to sensor-specific Redis queue"""
        queue_key = self._get_sensor_queue_key(sensor_name)
        point_json = json.dumps(point_data)
        
        # Use Redis pipeline for atomic operations
        pipe = self.redis_client.pipeline()
        pipe.rpush(queue_key, point_json)
        pipe.ltrim(queue_key, -self.window_size, -1)
        pipe.execute()
    
    def _get_sensor_queue_data(self, sensor_name: str) -> List[Dict]:
        """Retrieve all data points for a specific sensor from Redis"""
        queue_key = self._get_sensor_queue_key(sensor_name)
        data_json_list = self.redis_client.lrange(queue_key, 0, -1)
        data_points = []
        
        for data_json in data_json_list:
            try:
                point_data = json.loads(data_json)
                data_points.append(point_data)
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                print(f"Warning: Could not parse data point for {sensor_name}: {e}")
                continue
                
        return data_points
    
    def _check_outlier(self, point_data: Dict, data: List[Dict]) -> Dict:
        """Check if the current point is an outlier using IQR method"""
        current_value = point_data["value"]
        
        if len(data) < self.min_data_points:
            # Not enough data, always return OK
            return {
                "timestamp": point_data["timestamp"],
                "value": current_value,
                "is_outlier": False,
                "alarm_type": "OK"
            }

        values = [dp["value"] for dp in data]
        q1 = np.percentile(values, 25)
        q3 = np.percentile(values, 75)
        iqr = q3 - q1

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        v = current_value
        min_v, max_v = min(values), max(values)

        # Determine alarm type based on value position
        if v < lower_bound:
            alarm_type = "Low-Low" if v < min_v else "Low"
        elif v > upper_bound:
            alarm_type = "High-High" if v > max_v else "High"
        elif v < q1:
            alarm_type = "Low"
        elif v > q3:
            alarm_type = "High"
        else:
            alarm_type = "OK"

        is_outlier = v < lower_bound or v > upper_bound

        return {
            "timestamp": point_data["timestamp"],
            "value": v,
            "is_outlier": is_outlier,
            "alarm_type": alarm_type,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound
        }

    ## Function to clear all data in the queue, currently not being used, but can be used as and when required
    
    def clear_all_data(self) -> bool:
        """Clear all sensor data - use with caution in production"""
        try:
            pattern = AnomalyRedisKeys.PREFIX + ":temp:data:*:queue"
            keys = self.redis_client.keys(pattern)
            if keys:
                deleted_count = self.redis_client.delete(*keys)
                print(f"Cleared {deleted_count} sensor queues")
            return True
        except Exception as e:
            print(f"Error clearing data: {e}")
            return False

    def get_system_health(self) -> Dict[str, int]:
        """Get queue lengths for all sensors - useful for monitoring"""
        pattern = AnomalyRedisKeys.PREFIX + ":temp:data:*:queue"
        keys = self.redis_client.keys(pattern)
        health_info = {}
        
        for key in keys:
            sensor_name = key.split(':')[1]  # Extract sensor name from key
            queue_length = self.redis_client.llen(key)
            health_info[sensor_name] = int(queue_length)  # Convert to native Python int
        
        return health_info