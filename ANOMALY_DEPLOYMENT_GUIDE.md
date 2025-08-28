# FastAPI Anomaly Detection Deployment Guide

This guide explains how to deploy the FastAPI anomaly detection application to Azure Container Apps using the provisioned infrastructure.

## Prerequisites

Before deploying, ensure you have the following installed:

- **Azure CLI** - For Azure resource management
- **Docker** - For building and pushing container images
- **Terraform** - For infrastructure management
- **jq** (optional) - For JSON parsing in test scripts

## Infrastructure Overview

The deployment uses the following Azure services:

- **Azure Container Apps** - Hosts the FastAPI application
- **Azure Container Registry** - Stores the Docker images
- **Azure Redis Cache** - Provides caching and session storage
- **Azure Cosmos DB** - Stores anomaly detection data
- **Azure OpenAI** - Provides AI/ML capabilities
- **Application Insights** - Monitoring and logging

## Deployment Steps

### 1. Configure Terraform Variables

First, create your Terraform variables file:

```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your specific values:

```hcl
# Location and Environment Configuration
location      = "UAE North"
environment   = "prod"
project_name  = "anomaly-detection"

# Container Apps Configuration
container_apps_cpu         = 0.5
container_apps_memory      = "1Gi"
container_apps_min_replicas = 1
container_apps_max_replicas = 10

# Azure OpenAI Configuration
openai_model_deployment_name = "gpt-4o-mini"
openai_model_name           = "gpt-4o-mini"
openai_sku_name            = "S0"
openai_capacity            = 10

# Security Configuration
allowed_ip_ranges       = [
  "your.ip.address.range/32"  # Replace with your IP
]
```

### 2. Deploy Infrastructure

Deploy the Azure infrastructure:

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

This will create all necessary Azure resources including:
- Resource Group
- Virtual Network
- Container Apps Environment
- Container Registry
- Redis Cache
- Cosmos DB
- Azure OpenAI
- Application Insights

### 3. Deploy the FastAPI Application

Run the deployment script:

```bash
./deploy-anomaly-detection.sh
```

This script will:
1. Build the Docker image from the anomaly-detection folder
2. Push the image to Azure Container Registry
3. Deploy the image to Azure Container Apps
4. Display the application URL

### 4. Test the Deployment

Test all API endpoints:

```bash
./test-anomaly-api.sh
```

This will test:
- Health check endpoint (`/health`)
- Statistics endpoint (`/stats`)
- Heuristic detection (`/detect/heuristic`)
- Statistical detection (`/detect/statistical`)
- ML detection (`/detect/ml`)
- API documentation (`/docs`)

## API Endpoints

Once deployed, your FastAPI application will be available at:

- **Base URL**: `https://<container-app-fqdn>`
- **API Documentation**: `https://<container-app-fqdn>/docs`
- **Health Check**: `https://<container-app-fqdn>/health`

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check and system status |
| `/stats` | GET | System statistics and performance metrics |
| `/detect/heuristic` | POST | Heuristic anomaly detection |
| `/detect/statistical` | POST | Statistical anomaly detection |
| `/detect/ml` | POST | Machine learning anomaly detection |
| `/docs` | GET | Interactive API documentation |

### Example API Usage

#### Health Check
```bash
curl https://<container-app-fqdn>/health
```

#### Anomaly Detection
```bash
curl -X POST https://<container-app-fqdn>/detect/heuristic \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-01-15T10:30:00Z",
    "sensor_id": "sensor-001",
    "temperature": 25.5,
    "pressure": 1013.25,
    "humidity": 60.0,
    "flow_rate": 100.0,
    "vibration": 0.5
  }'
```

## Environment Variables

The application is configured with the following environment variables:

### Azure Services
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI service endpoint
- `AZURE_OPENAI_API_KEY` - Azure OpenAI API key
- `AZURE_OPENAI_DEPLOYMENT` - OpenAI model deployment name
- `COSMOS_DB_CONNECTION_STRING` - Cosmos DB connection string
- `APPLICATION_INSIGHTS_CONNECTION_STRING` - Application Insights connection

### Redis Configuration
- `REDIS_HOST` - Redis cache hostname
- `REDIS_PASSWORD` - Redis cache password
- `REDIS_PORT` - Redis cache port
- `REDIS_SSL` - Redis SSL enabled (true/false)

### Application Configuration
- `API_HOST` - API host (0.0.0.0)
- `API_PORT` - API port (8000)
- `DEBUG` - Debug mode (true/false)
- `LOG_LEVEL` - Logging level (INFO/DEBUG)

## Monitoring and Logging

### Application Insights
- **Metrics**: CPU, memory, response times
- **Logs**: Application logs and errors
- **Dependencies**: External service calls
- **Performance**: Request tracing

### Container Apps Monitoring
- **Replicas**: Auto-scaling based on load
- **Health**: Health check status
- **Logs**: Container logs via Azure CLI

### View Logs
```bash
# Get Container App logs
az containerapp logs show \
  --name <container-app-name> \
  --resource-group <resource-group-name>

# Get Application Insights logs
az monitor app-insights query \
  --app <app-insights-name> \
  --resource-group <resource-group-name> \
  --analytics-query "traces | where timestamp > ago(1h)"
```

## Scaling Configuration

The Container App is configured with:

- **Min Replicas**: 1 (always running)
- **Max Replicas**: 10 (scales up based on load)
- **CPU Scaling**: 70% utilization threshold
- **Memory Scaling**: 80% utilization threshold
- **HTTP Scaling**: 30 concurrent requests

## Security Features

- **HTTPS Only**: All traffic is encrypted
- **IP Restrictions**: Configurable IP allowlist
- **Managed Identity**: Secure access to Azure services
- **Key Vault Integration**: Secure secret management
- **Private Endpoints**: Optional private network access

## Troubleshooting

### Common Issues

1. **Container App Not Starting**
   ```bash
   # Check container app status
   az containerapp show \
     --name <container-app-name> \
     --resource-group <resource-group-name>
   
   # Check logs
   az containerapp logs show \
     --name <container-app-name> \
     --resource-group <resource-group-name>
   ```

2. **Image Pull Issues**
   ```bash
   # Verify ACR login
   az acr login --name <acr-name>
   
   # Check image exists
   az acr repository list --name <acr-name>
   ```

3. **Environment Variable Issues**
   ```bash
   # Check environment variables
   az containerapp show \
     --name <container-app-name> \
     --resource-group <resource-group-name> \
     --query "properties.template.containers[0].env"
   ```

### Health Check Failures

If health checks are failing:

1. Verify Redis connectivity
2. Check Azure OpenAI service status
3. Ensure all required environment variables are set
4. Review application logs for errors

### Performance Issues

1. **High Response Times**
   - Check Redis connection
   - Monitor Azure OpenAI quota
   - Review auto-scaling settings

2. **Memory Issues**
   - Increase container memory allocation
   - Check for memory leaks in application
   - Monitor Redis memory usage

## Cost Optimization

### Development Environment
- Use Basic SKU for Redis
- Set min replicas to 0
- Enable scheduled shutdown
- Use consumption plan for Functions

### Production Environment
- Use Standard/Premium SKU for Redis
- Set appropriate min replicas
- Monitor and adjust scaling rules
- Use reserved instances for predictable workloads

## Backup and Recovery

### Data Backup
- **Cosmos DB**: Automatic point-in-time backup
- **Redis**: Data persistence (Premium SKU)
- **Container Images**: Stored in ACR

### Disaster Recovery
- **Multi-region**: Deploy to multiple regions
- **Backup Strategy**: Regular infrastructure backups
- **Recovery Plan**: Documented recovery procedures

## Updates and Maintenance

### Application Updates
```bash
# Build and deploy new version
./deploy-anomaly-detection.sh
```

### Infrastructure Updates
```bash
cd infrastructure
terraform plan
terraform apply
```

### Security Updates
- Regularly update base images
- Monitor security advisories
- Apply patches promptly

## Support and Resources

- **Azure Container Apps Documentation**: https://docs.microsoft.com/en-us/azure/container-apps/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Terraform Azure Provider**: https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs

## Next Steps

After successful deployment:

1. **Integration**: Connect your applications to the API
2. **Monitoring**: Set up alerts and dashboards
3. **Testing**: Implement comprehensive test suites
4. **Documentation**: Create API documentation for your team
5. **Security**: Review and enhance security measures
