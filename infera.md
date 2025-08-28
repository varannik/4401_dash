# Terraform Azure Event-Driven Anomaly Detection Architecture - Cursor AI Prompt

I need you to create a comprehensive Terraform infrastructure for an event-driven anomaly detection system on Azure. Here are the exact specifications:

## Architecture Overview
Create an event-driven architecture with the following data flow:
1. **Data Source**: Microsoft Fabric → Redis (24-hour rolling window)
2. **Real-time Dashboard**: Next.js ↔ Redis (direct connection for real-time visualization)
3. **Processing**: Azure Function (Redis trigger) → FastAPI (3-tier analysis)
4. **Storage**: Results → Azure Cosmos DB (multiple collections)
5. **UI Updates**: Next.js dashboard (10-second Redis polling + Cosmos DB for anomalies)
6. **Analytics**: Three-tier anomaly detection (Heuristic → Statistical → LLM)

## Technical Requirements

### Data Specifications
- **Volume**: 100-key JSON payload every 10 seconds (~360 records/hour)
- **Redis TTL**: 24-hour data retention with timestamps
- **Guaranteed Fields**: 8 core values always present, additional fields variable
- **Update Frequencies**: Some values update every 10s, others every 1 hour
- **Real-time Access**: Next.js fetches Redis data directly for real-time dashboard visualization
- **Dual Data Sources**: Next.js reads from Redis (live data) + Cosmos DB (anomaly results)

### Azure Resources Needed
1. **Resource Group**: `rg-anomaly-detection-prod`
2. **Azure Cache for Redis**: Premium tier with persistence + public access for Next.js
3. **Azure Functions**: Consumption plan with Redis trigger
4. **Azure Container Apps**: Host FastAPI server with 3 endpoints
5. **Azure Cosmos DB**: Serverless tier with 4 collections
6. **Azure App Service**: Host Next.js dashboard with Redis client connectivity
7. **Azure OpenAI**: GPT-4o-mini for LLM analysis
8. **Azure Key Vault**: Secrets management (including Redis connection strings)
9. **Azure Application Insights**: Monitoring and logging
10. **Azure Storage Account**: Function app storage
11. **Virtual Network**: Enable secure Redis access from App Service

### FastAPI in dash/anomaly-detection
```
/detect/heuristic using llm in Azure OpenAI
/detect/statistical using llm in Azure OpenAI
/detect/ml 
```

### Cosmos DB Collections Schema
```json
{
  "anomaly_results": {
    "id": "string",
    "timestamp": "datetime",
    "raw_data": "object",

    "heuristic": {
"timestamp": "2025-08-26T10:40:29.652000Z",
  "method": "heuristic",
  "results": {
    "CO2_FLOW_RATE": {
      "value": 40,
      "alarm_type": "OK",
      "status": "Normal",
      "context": ""
    },
    "WATER_FLOW_RATE": {
      "value": 2,
      "alarm_type": "High",
      "status": "Anomaly",
      "context": "There is a high alarm for the water flow rate. This alarm can occur during startup or acceleration if a VFD-driven pump operates at a higher frequency than expected, causing a spike in flow rate."
    },
    "LIQUID_TRACER_FLOW_RATE": {
      "value": 0.5,
      "alarm_type": "OK",
      "status": "Normal",
      "context": ""
    },
    "INJECTION_PRESSURE": {
      "value": 35,
      "alarm_type": "OK",
      "status": "Normal",
      "context": ""
},
"HASA-4_TUBING_PRESSURE": {
"value": 35,
"alarm_type": "OK",
"status": "Normal",
"context": ""
},
"WATER_TO_CO2_RATIO": {
"value": 25,
"alarm_type": "OK",
"status": "Normal",
"context": ""
},
   },

},
    "statistical": {
"timestamp": "2025-08-26T10:40:29.652000Z",
  "method": "statistical",
  "results": {
    "WATER_FLOW_RATE": {
      "value": 2,
      "alarm_type": "OK",
      "status": "Normal",
      "context": ""
    },
    "CO2_FLOW_RATE": {
      "value": 40,
      "alarm_type": "OK",
      "status": "Normal",
      "context": ""
    },
    "LIQUID_TRACER_FLOW_RATE": {
      "value": 0.5,
      "alarm_type": "OK",
      "status": "Normal",
      "context": ""
    },
    "INJECTION_PRESSURE": {
      "value": 55,
      "alarm_type": "High-High",
      "status": "Anomaly",
      "context": "The alarm is for high-high injection pressure. This situation occurs when the water or CO2 injection pumps operate at a speed higher than the expected setpoint. "
    },
    "HASA-4_TUBING_PRESSURE": {
"value": 35,
"alarm_type": "OK",
"status": "Normal",
"context": ""
},
"WATER_TO_CO2_RATIO": {
"value": 25,
"alarm_type": "OK",
"status": "Normal",
"context": ""
}
},

},
    "ml": {
"timestamp": "2025-08-26T10:40:29.652000Z",
  "method": "ml",
  "results": {
    "values": {
      "WATER_FLOW_RATE": 2,
      "CO2_FLOW_RATE": 40,
      "LIQUID_TRACER_FLOW_RATE": 0.5,
      "INJECTION_PRESSURE": 55,
      "HASA-4_TUBING_PRESSURE": 35,
      "WATER_TO_CO2_RATIO": 25
},
"status": "Anomaly"
},
"processing_time_ms": 2.2554397583007812
},
    "final_status": "anomaly|normal",
    "overall_confidence": "float"
  },
  "unresolved_anomalies": {
    "anomaly_id": "string",
    "detected_at": "datetime", 
    "severity_level": "string",
    "assigned_to": "string"
  },
  "resolved_anomalies": {
    "anomaly_id": "string",
    "resolved_at": "datetime",
    "resolved_by": "string", 
    "resolution_notes": "string"
  },
  "modified_values": {
    "original_data": "object",
    "modified_data": "object",
    "modified_by": "string",
    "modification_reason": "string",
    "modified_at": "datetime"
  }
}
```

## Terraform Structure Requirements

### File Organization
```
terraform/
├── main.tf                    # Provider configuration
├── variables.tf              # Input variables
├── outputs.tf               # Output values
├── resource-group.tf        # Resource group
├── redis.tf                 # Azure Cache for Redis
├── cosmos-db.tf             # Cosmos DB with collections
├── functions.tf             # Azure Functions with triggers
├── container-apps.tf        # FastAPI container deployment
├── app-service.tf          # Next.js web app
├── openai.tf               # Azure OpenAI service
├── key-vault.tf            # Key Vault with secrets
├── monitoring.tf           # Application Insights
├── networking.tf           # VNet, subnets, NSGs
├── security.tf             # Managed identities, RBAC
└── terraform.tfvars.example # Example variables
```

## Specific Implementation Requirements

### 1. Redis Configuration
- Premium tier with persistence enabled
- 24-hour TTL configuration
- Redis trigger configuration for Azure Functions
- **Dual Access Pattern**: 
- Function Apps: Managed identity access via private endpoint
- Next.js App Service: Direct Redis connection for real-time data fetching
- Network security rules allowing both Azure Functions and App Service access
- Redis client libraries configuration for Next.js (node-redis or ioredis)

### 2. Azure Functions
- **Function 1**: Redis trigger → Process data → Call FastAPI endpoints
- **Function 2**: Cosmos DB change feed → Update dashboard cache
- **Function 3**: Timer trigger → Cleanup old data
- Managed identity authentication
- Application Insights integration

### 3. Next.js App Service Configuration
- **Dual Data Access**:
  - Redis client for real-time data visualization (10-second polling)
  - Cosmos DB client for anomaly results and historical data
- Environment variables for both Redis and Cosmos DB connections
- **Smart Update Logic**: Compare timestamps to determine which data needs updates
- **Connection Pooling**: Efficient Redis connection management
- CORS configuration for API calls
- Health check endpoint that verifies both Redis and Cosmos DB connectivity

### 4. Container Apps Environment
- FastAPI application 
- Auto-scaling configuration (min 1, max 10 instances)
- Environment variables for database connections
- Health probes configuration


### 5. Security & Best Practices
- Managed identities for all service-to-service communication
- **Redis Access Control**:
  - Private endpoints for Azure Functions access
  - VNet integration for App Service to access Redis securely
  - Redis AUTH configuration with secure connection strings
- Key Vault integration for all connection strings (Redis + Cosmos DB)
- Network security groups with least privilege
- HTTPS enforcement on all endpoints

### 5. Monitoring & Observability
- Application Insights workspace
- Custom metrics and alerts
- Log Analytics workspace
- Health check endpoints
- Performance counters

### 6. Cost Optimization
- Serverless Cosmos DB (auto-scales based on usage)
- Functions consumption plan (pay-per-execution)
- Basic tier App Service (sufficient for low traffic)
- Reserved instances where cost-effective

## Variables to Include
```hcl
# Location and naming
variable "location" { default = "East US" }
variable "environment" { default = "prod" }
variable "project_name" { default = "anomaly-detection" }

# Redis configuration
variable "redis_sku_name" { default = "Premium" }
variable "redis_family" { default = "P" }
variable "redis_capacity" { default = 1 }

# Cosmos DB configuration  
variable "cosmosdb_offer_type" { default = "Standard" }
variable "cosmosdb_consistency_level" { default = "Session" }

# App Service configuration
variable "app_service_sku_tier" { default = "Basic" }
variable "app_service_sku_size" { default = "B1" }

# Container Apps configuration
variable "container_apps_cpu" { default = 0.5 }
variable "container_apps_memory" { default = "1Gi" }

# Azure OpenAI
variable "openai_model_deployment_name" { default = "gpt-4o-mini" }
variable "openai_sku_name" { default = "Standard" }
```

## Expected Outputs
```hcl
# Resource identifiers
output "resource_group_name"
output "redis_connection_string" 
output "cosmos_db_endpoint"
output "function_app_name"
output "container_app_fqdn"
output "app_service_url"
output "openai_endpoint"
output "key_vault_uri"

# Connection details (sensitive)
output "cosmos_db_primary_key" { sensitive = true }
output "redis_access_key" { sensitive = true }
output "redis_connection_string" { sensitive = true }
output "openai_api_key" { sensitive = true }
```

## Special Requirements
1. **Environment Variables**: Automatically populate all connection strings in Key Vault
   - `REDIS_CONNECTION_STRING` for Next.js real-time access
   - `COSMOS_DB_CONNECTION_STRING` for anomaly data
   - `FASTAPI_ENDPOINT` for anomaly processing
2. **CORS Configuration**: Enable CORS for Next.js app to call APIs
3. **VNet Integration**: Configure App Service VNet integration for secure Redis access
4. **Redis Client Configuration**: Next.js environment variables for Redis connection pooling
5. **Dual Data Source Logic**: Next.js app configuration to handle both Redis and Cosmos DB efficiently
6. **Scaling Rules**: Configure auto-scaling based on queue length and CPU usage
7. **Backup Strategy**: Enable point-in-time backup for Cosmos DB
8. **SSL Certificates**: Use Azure-managed certificates for custom domains
9. **Tags**: Apply consistent tagging strategy for cost tracking and governance

## Deployment Considerations
- Use Terraform workspaces for multiple environments
- Include data source references for existing resources if needed
- Add validation rules for critical configurations
- Include lifecycle rules to prevent accidental deletion of stateful resources
- Configure remote state storage in Azure Storage Account

Please create production-ready Terraform code that follows Azure best practices, includes proper error handling, and is well-documented with comments explaining each resource's purpose in the event-driven architecture. Create deploy and destory for it. also 