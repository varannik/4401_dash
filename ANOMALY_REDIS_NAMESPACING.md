# Anomaly Detection Redis Namespacing

This document explains how Redis namespacing is implemented in the FastAPI anomaly detection application to prevent conflicts with other applications using the same Redis instance.

## Overview

The anomaly detection system uses the `anomaly:` namespace for all Redis operations to ensure:
- **No conflicts** with other applications (NextAuth, Fabric data, etc.)
- **Organized key structure** for different types of data
- **Proper TTL management** for different data types
- **Easy monitoring and debugging**

## Namespace Structure

### **Anomaly Detection Namespace (`anomaly:`)**

**Purpose**: Anomaly detection processing, sensor data, and analysis results

**Key Patterns**:
```
anomaly:temp:data:{sensor_name}:queue     # Temporary sensor data queues
anomaly:queue:processing:{batch_id}       # Processing queues
anomaly:results:analysis:{analysis_id}    # Analysis results
anomaly:cache:{category}:{key}            # Cache storage
anomaly:model:{model_name}                # ML model storage
anomaly:health:{component}                # Health check data
anomaly:metrics:{metric_name}:{interval}  # Metrics storage
anomaly:alerts:{alert_id}                 # Alert storage
anomaly:config:{config_name}              # Configuration storage
```

**Example Keys**:
```
anomaly:temp:data:temperature_sensor:queue
anomaly:temp:data:pressure_sensor:queue
anomaly:queue:processing:batch-12345
anomaly:results:analysis:analysis-abc123
anomaly:cache:thresholds:sensor_001
anomaly:model:anomaly_detector_v1
anomaly:health:statistical_detector
anomaly:metrics:processing_time:hourly
anomaly:alerts:high_temp_alert_001
anomaly:config:window_size
```

## Configuration

### **Settings Configuration**

```python
# src/anomaly_detection/config/settings.py
class Settings(BaseSettings):
    # Redis Configuration
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: Optional[str] = None
    redis_ssl: bool = False
    
    # Anomaly Detection Configuration
    redis_key_prefix: str = "anomaly"  # Uses 'anomaly:' namespace
```

### **StatisticalAnomalyDetector Configuration**

```python
# src/anomaly_detection/core/StatisticalAnomalyDetector.py
from ..utils.redis_namespaces import AnomalyRedisKeys, AnomalyRedisTTL

class StatisticalAnomalyDetector:
    def _get_sensor_queue_key(self, sensor_name: str) -> str:
        """Generate Redis key for specific sensor using anomaly namespace"""
        return AnomalyRedisKeys.temp_data(sensor_name)
    
    def _add_to_sensor_queue(self, sensor_name: str, point_data: Dict):
        """Add data point to sensor-specific Redis queue with TTL"""
        queue_key = self._get_sensor_queue_key(sensor_name)
        point_json = json.dumps(point_data)
        
        # Use Redis pipeline for atomic operations
        pipe = self.redis_client.pipeline()
        pipe.rpush(queue_key, point_json)
        pipe.ltrim(queue_key, -self.window_size, -1)
        pipe.expire(queue_key, AnomalyRedisTTL.TEMP_DATA)  # Set TTL
        pipe.execute()
```

## TTL Configuration

Different data types have appropriate TTL (Time To Live) settings:

```python
class AnomalyRedisTTL:
    # Temporary data (sensor queues)
    TEMP_DATA = 3600  # 1 hour
    
    # Processing queues
    PROCESSING_QUEUE = 1800  # 30 minutes
    
    # Analysis results
    RESULTS = 86400  # 24 hours
    
    # Cache data
    CACHE = 3600  # 1 hour
    
    # ML models
    MODEL = 86400  # 24 hours
    
    # Health checks
    HEALTH = 300  # 5 minutes
    
    # Metrics
    METRICS = 3600  # 1 hour
    
    # Alerts
    ALERTS = 604800  # 7 days
    
    # Configuration
    CONFIG = 86400  # 24 hours
```

## Redis Trigger Patterns

Azure Functions can listen to specific anomaly detection patterns:

```python
# Listen to anomaly temp data
@redis_trigger(key_pattern="anomaly:temp:data:*")
def process_anomaly_data(key: str, value: str):
    pass

# Listen to anomaly processing queues
@redis_trigger(key_pattern="anomaly:queue:processing:*")
def process_anomaly_queue(key: str, value: str):
    pass

# Listen to anomaly results
@redis_trigger(key_pattern="anomaly:results:analysis:*")
def handle_anomaly_results(key: str, value: str):
    pass
```

## Key Management

### **AnomalyRedisManager Class**

The `AnomalyRedisManager` class provides helper methods for Redis operations:

```python
from ..utils.redis_namespaces import AnomalyRedisManager

# Initialize manager
redis_manager = AnomalyRedisManager(redis_client)

# Store temporary data
redis_manager.store_temp_data("temperature_sensor", data)

# Get analysis results
results = redis_manager.get_analysis_result("analysis-123")

# Store alerts
redis_manager.store_alert("alert-001", alert_data)

# Get system health
health = redis_manager.get_system_health()

# Clear temporary data
redis_manager.clear_temp_data("temperature_sensor")
```

## Monitoring and Debugging

### **List Keys by Namespace**

```bash
# Connect to Redis
redis-cli

# List all anomaly keys
KEYS anomaly:*

# List specific key types
KEYS anomaly:temp:data:*
KEYS anomaly:results:analysis:*
KEYS anomaly:queue:processing:*
KEYS anomaly:alerts:*
```

### **Health Monitoring**

```python
# Get system health information
def get_system_health(self) -> Dict[str, int]:
    """Get queue lengths for all sensors - useful for monitoring"""
    pattern = AnomalyRedisKeys.PREFIX + ":temp:data:*:queue"
    keys = self.redis_client.keys(pattern)
    health_info = {}
    
    for key in keys:
        # Extract sensor name from key: anomaly:temp:data:{sensor_name}:queue
        parts = key.split(':')
        if len(parts) >= 4:
            sensor_name = parts[3]
            queue_length = self.redis_client.llen(key)
            health_info[sensor_name] = int(queue_length)
    
    return health_info
```

## Complete Redis Key Structure

### **All Applications Using Redis**

1. **NextAuth** (`nextauth:`)
   ```
   nextauth:user:12345678-1234-1234-1234-123456789abc
   nextauth:session:abcdef12-3456-7890-abcd-ef1234567890
   nextauth:account:azure:user@example.com
   ```

2. **Fabric Data** (`fabric:`)
   ```
   fabric:user:12345678-1234-1234-1234-123456789abc:tokens
   fabric:data:chart:co2-flow:realtime
   fabric:cache:query:plant-overview
   ```

3. **Anomaly Detection** (`anomaly:`)
   ```
   anomaly:temp:data:temperature_sensor:queue
   anomaly:results:analysis:analysis-abc123
   anomaly:queue:processing:batch-12345
   anomaly:alerts:high_temp_alert_001
   ```

## Benefits

1. **No Conflicts**: Each application has its own namespace
2. **Easy Cleanup**: Can delete all keys for a specific app
3. **Better Monitoring**: Can track usage per application
4. **Selective Triggers**: Redis triggers can listen to specific namespaces
5. **Debugging**: Easy to identify which app owns which data
6. **TTL Management**: Proper expiration for different data types

## Migration Notes

If you have existing data in Redis without namespaces, you may need to migrate:

```bash
# Example migration script
redis-cli --eval migrate-anomaly-keys.lua

# Or manually migrate specific keys
redis-cli RENAME anomaly_detector:temp:data:sensor1 anomaly:temp:data:sensor1:queue
redis-cli RENAME anomaly_detector:results:analysis1 anomaly:results:analysis:analysis1
```

## Best Practices

1. **Always use namespaced keys** when adding new Redis operations
2. **Use consistent naming patterns** within the anomaly namespace
3. **Set appropriate TTL** for different data types
4. **Monitor key usage** by namespace
5. **Clean up old keys** regularly
6. **Test trigger patterns** before deploying to production
7. **Use the AnomalyRedisManager** for complex operations
