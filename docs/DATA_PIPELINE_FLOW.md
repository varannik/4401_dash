# Data Pipeline Flow - How It Works

## Overview
The data pipeline processes data through 7 sequential steps, from raw ingestion to expert-reviewed final storage, with anomaly detection and intelligent error reporting.

## Step-by-Step Data Flow

### Step 1: Data Ingestion Layer
**Real-time IoT + Batch API/CSV → Staging Database**

#### 1.1 Real-time IoT Data
```
IoT Devices → Azure IoT Hub/AWS IoT Core → Event Hubs/MSK → Data Ingestion Service
```
- IoT sensors send telemetry (temperature, pressure, etc.)
- Azure IoT Hub/AWS IoT Core receives and validates messages
- Events stream to Event Hubs/MSK topics: `iot-raw-data`
- Data Ingestion Service consumes events and stores in staging DB

#### 1.2 Batch API Data
```
External APIs → Data Ingestion Service → Event Hubs/MSK → Staging Database
```
- REST APIs provide batch data (weather, market data, etc.)
- Data Ingestion Service polls APIs on schedule
- Normalizes data format and publishes to `batch-data` topic
- Stores processed batch data in staging database

#### 1.3 CSV File Upload
```
CSV Files → Blob Storage → Data Ingestion Service → Staging Database
```
- Users upload CSV files via dashboard
- Files stored in Azure Blob/S3
- Data Ingestion Service processes files asynchronously
- Validates CSV structure and stores records in staging DB

**Output**: All raw data consolidated in staging database with metadata

---

### Step 2: Centralized Monitoring Dashboard
**Data Visualization from Staging Database**

```
Staging Database → Dashboard API → Next.js Frontend → Real-time Charts
```

#### Dashboard Features:
- **Real-time Metrics**: Live data streams via WebSocket
- **Historical Charts**: Time-series visualization of ingested data
- **Data Source Monitoring**: Status of IoT devices, API endpoints, file uploads
- **Volume Metrics**: Records per second, data throughput

**Output**: Real-time visibility into incoming data streams

---

### Step 3: Missing Value Detection
**Data Quality Check → Anomaly Database**

```
Staging Database → Data Processing Service → Missing Value Detector → Anomaly Database
```

#### Process:
1. **Continuous Scanning**: Data Processing Service reads from staging DB
2. **Rule-based Detection**: Checks for:
   - NULL/empty values in required fields
   - Missing timestamps
   - Incomplete sensor readings
   - Invalid data ranges
3. **Anomaly Logging**: Missing values logged to anomaly database
4. **Dashboard Alerts**: Real-time notifications on dashboard

**Output**: Clean data identified, missing values catalogued

---

### Step 4: Clean Data Processing
**Validated Data → Next Staging Database**

```
Staging Database → Data Processing Service → Validation Engine → Final Database
```

#### Validation Rules:
- **Data Type Validation**: Ensure numeric fields are numbers
- **Range Validation**: Values within expected ranges
- **Business Logic**: Domain-specific validation rules
- **Completeness Check**: All required fields present

#### Processing:
1. **Stream Processing**: Consumes from `validated-data` topic
2. **Transformation**: Data normalization and enrichment
3. **Quality Scoring**: Assigns quality score to each record
4. **Clean Data Storage**: Only validated data moves to final database

**Output**: High-quality, validated data ready for analysis

---

### Step 5: 2-Step Anomaly Detection
**Heuristic Rules + Machine Learning**

#### 5.1 Heuristic Rules (Step 1)
```
Final Database → Anomaly Detection Service → Rule Engine → Anomaly Database
```

**Rules Examples**:
- Temperature > 100°C or < -50°C
- Pressure readings with sudden spikes (>50% change)
- Missing heartbeat signals from IoT devices
- API response time > 5 seconds

#### 5.2 Machine Learning (Step 2)
```
Final Database → ML Model (Azure ML/SageMaker) → Anomaly Score → RAG System
```

**ML Process**:
1. **Feature Engineering**: Statistical features from time-series data
2. **Model Inference**: Trained isolation forest/autoencoder models
3. **Anomaly Scoring**: 0-1 score for each data point
4. **Threshold Detection**: Anomalies with score > 0.8

#### Error Routing:
- **Clean Data**: Anomaly score < 0.8 → Stays in final database
- **Detected Anomalies**: Score ≥ 0.8 → Sent to RAG Error System

**Output**: Intelligent anomaly detection with dual validation

---

### Step 6: RAG Error Reporting System
**Knowledge Base Search + LLM Analysis**

```
Detected Anomalies → RAG System → Knowledge Search + LLM → Formatted Error Reports
```

#### RAG Process:
1. **Context Preparation**: Anomaly data + metadata
2. **Knowledge Search**: 
   - Azure Cognitive Search/AWS Kendra
   - Query: "temperature anomaly troubleshooting"
   - Returns: Relevant documentation, past incidents
3. **LLM Analysis**:
   - Azure OpenAI/AWS Bedrock
   - Input: Anomaly + Knowledge context
   - Output: Root cause analysis, recommendations
4. **Error Formatting**: Structured error reports with:
   - Anomaly description
   - Possible causes
   - Recommended actions
   - Related knowledge base articles

#### Knowledge Base Content:
- Historical incident reports
- Troubleshooting guides
- Sensor specifications
- Maintenance procedures

**Output**: Intelligent error reports with actionable insights

---

### Step 7: Expert Review System
**Manual Corrections → Final Database**

```
Error Reports → Dashboard → Expert Review → Manual Corrections → Final Database
```

#### Expert Workflow:
1. **Review Queue**: Dashboard shows pending anomalies
2. **Error Analysis**: Experts review RAG-generated reports
3. **Decision Making**:
   - **False Positive**: Mark as normal, update ML model
   - **True Anomaly**: Confirm and create incident
   - **Data Correction**: Fix incorrect values manually
4. **Final Storage**: Approved/corrected data stored in final database

#### Dashboard Features:
- **Review Interface**: Side-by-side anomaly data and recommendations
- **Correction Tools**: Forms to edit values and add notes
- **Approval Workflow**: Multi-stage approval for critical corrections
- **Audit Trail**: Complete history of manual changes

**Output**: Expert-validated, high-quality final dataset

---

## Event Streaming Architecture

### Kafka Topics Flow:
```
iot-raw-data → data-validated → anomalies-detected → errors-processed → final-approved
```

### Event Schema Example:
```json
{
  "id": "uuid",
  "source": "iot|api|csv",
  "timestamp": "2024-01-01T10:00:00Z",
  "data": { /* sensor readings */ },
  "quality_score": 0.95,
  "anomaly_score": 0.02,
  "pipeline_stage": "validated|anomaly|error|final"
}
```

## Data Storage Strategy

### Staging Database (SQL)
- **Schema**: Time-series optimized
- **Retention**: 30 days
- **Purpose**: Temporary storage for processing

### Final Database (SQL)
- **Schema**: Normalized, production-ready
- **Retention**: Long-term (years)
- **Purpose**: Clean, validated data for analytics

### Anomaly Database (NoSQL)
- **Schema**: Document-based (JSON)
- **Retention**: 1 year
- **Purpose**: Anomaly tracking and analysis

### Knowledge Database (NoSQL)
- **Schema**: Vector embeddings + documents
- **Retention**: Permanent
- **Purpose**: RAG knowledge base for error analysis

## Performance Characteristics

### Throughput:
- **IoT Data**: 10,000+ events/second
- **Batch Processing**: 1M+ records/hour
- **Real-time Latency**: <100ms end-to-end

### Scalability:
- **Horizontal Scaling**: Auto-scaling container services
- **Database Scaling**: Read replicas and partitioning
- **Event Streaming**: Kafka partition scaling

## Monitoring & Observability

### Pipeline Metrics:
- **Data Volume**: Records processed per minute
- **Error Rates**: Anomalies detected per data source
- **Processing Latency**: Time through each pipeline stage
- **Expert Review Time**: Average time for manual corrections

### Health Checks:
- **Service Health**: All microservices operational
- **Data Freshness**: Latest data timestamp monitoring
- **Queue Depth**: Event processing backlog
- **Database Performance**: Query response times

This pipeline ensures high-quality, validated data flows from raw ingestion to expert-approved final storage with intelligent anomaly detection and error reporting. 