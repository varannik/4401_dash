# Real-Time Monitoring Dashboard - Deployment Guide

This guide provides step-by-step instructions for deploying the real-time monitoring dashboard system across both Azure and AWS cloud platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Local Development](#local-development)
4. [Azure Deployment](#azure-deployment)
5. [AWS Deployment](#aws-deployment)
6. [System Architecture](#system-architecture)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js 18+** and npm
- **Python 3.9+** and pip
- **Docker** and Docker Compose
- **Terraform 1.0+**
- **Git**

### Cloud Provider Tools

#### For Azure Deployment
- **Azure CLI** - [Installation Guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- **Azure Subscription** with appropriate permissions

#### For AWS Deployment
- **AWS CLI** - [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- **AWS Account** with appropriate permissions

### Required Permissions

#### Azure Permissions
- Contributor role on the subscription
- Ability to create:
  - Resource Groups
  - Storage Accounts
  - SQL Databases
  - IoT Hubs
  - Event Hubs
  - Container Apps
  - Machine Learning Workspaces
  - Cognitive Services

#### AWS Permissions
- AdministratorAccess (or specific IAM policies for):
  - VPC and networking
  - RDS and DynamoDB
  - ECS and ECR
  - IoT Core and MSK
  - SageMaker and Kendra
  - S3 and CloudWatch

## Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd realtime-monitoring

# Make deployment script executable
chmod +x scripts/deploy.sh

# Check prerequisites
./scripts/deploy.sh check
```

### 2. Environment Configuration
```bash
# Copy environment template
cp env.template .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=your-database-connection-string
REDIS_URL=your-redis-connection-string

# Kafka
KAFKA_BOOTSTRAP_SERVERS=your-kafka-servers

# Cloud Provider (Azure)
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_SUBSCRIPTION_ID=your-subscription-id

# Cloud Provider (AWS)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1

# AI Services
AZURE_OPENAI_API_KEY=your-openai-key
OPENAI_API_KEY=your-openai-key  # Alternative
```

### 3. Choose Deployment Type

#### Local Development
```bash
./scripts/deploy.sh local
```

#### Azure Deployment
```bash
CLOUD_PROVIDER=azure ./scripts/deploy.sh full
```

#### AWS Deployment
```bash
CLOUD_PROVIDER=aws ./scripts/deploy.sh full
```

## Local Development

### Start Local Environment
```bash
# Setup and start all services
./scripts/deploy.sh local

# Or manually
npm run setup
docker-compose up -d
npm run dev
```

### Service URLs
- **Dashboard**: http://localhost:3000
- **Kafka UI**: http://localhost:8080
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Data Ingestion API**: http://localhost:8001
- **Anomaly Detection API**: http://localhost:8003
- **RAG System API**: http://localhost:8004

### Testing the System

#### 1. Test Data Ingestion
```bash
# Test real-time data endpoint
curl -X POST http://localhost:8001/ingest/realtime \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "sensor-001",
    "timestamp": "2024-01-01T12:00:00Z",
    "data": {
      "temperature": 23.5,
      "humidity": 45.2,
      "pressure": 1013.25
    }
  }'

# Test batch data endpoint
curl -X POST http://localhost:8001/ingest/batch \
  -H "Content-Type: application/json" \
  -d '{
    "source": "api-test",
    "data": [
      {"id": "1", "value": 100, "timestamp": "2024-01-01T12:00:00Z"},
      {"id": "2", "value": 200, "timestamp": "2024-01-01T12:01:00Z"}
    ]
  }'
```

#### 2. Test CSV Upload
```bash
# Create sample CSV
echo "id,temperature,humidity,timestamp
1,22.5,50.0,2024-01-01T12:00:00Z
2,23.0,48.5,2024-01-01T12:01:00Z" > sample.csv

# Upload CSV
curl -X POST http://localhost:8001/ingest/csv \
  -F "file=@sample.csv"
```

## Azure Deployment

### 1. Azure Authentication
```bash
# Login to Azure
az login

# Set subscription (if you have multiple)
az account set --subscription "your-subscription-id"
```

### 2. Deploy Infrastructure
```bash
cd infrastructure/azure

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var="project_name=realtime-monitoring" -var="environment=dev"

# Apply deployment
terraform apply -var="project_name=realtime-monitoring" -var="environment=dev"
```

### 3. Deploy Services
```bash
# Build and push Docker images
CLOUD_PROVIDER=azure ./scripts/deploy.sh build

# Get ACR login server
ACR_LOGIN_SERVER=$(cd infrastructure/azure && terraform output -raw container_registry_login_server)

# Login to ACR
az acr login --name $ACR_LOGIN_SERVER

# Push images
docker tag realtime-monitoring/data-ingestion:latest $ACR_LOGIN_SERVER/data-ingestion:latest
docker push $ACR_LOGIN_SERVER/data-ingestion:latest
```

### 4. Configure Services

#### Update Container Apps
The Terraform configuration automatically creates Container Apps, but you may need to update them with the correct image URLs:

```bash
# Update Container App with new image
az containerapp update \
  --name realtime-monitoring-data-ingestion \
  --resource-group realtime-monitoring-dev-rg \
  --image $ACR_LOGIN_SERVER/data-ingestion:latest
```

### 5. Deploy Dashboard
```bash
cd dashboard

# Build for production
npm run build

# Deploy to Azure Static Web Apps (requires GitHub integration)
# Or use Azure CLI
az staticwebapp create \
  --name realtime-monitoring-dashboard \
  --resource-group realtime-monitoring-dev-rg \
  --source . \
  --location "East US 2" \
  --branch main \
  --token "your-github-token"
```

## AWS Deployment

### 1. AWS Authentication
```bash
# Configure AWS CLI
aws configure

# Or use environment variables
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-1
```

### 2. Deploy Infrastructure
```bash
cd infrastructure/aws

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var="project_name=realtime-monitoring" -var="environment=dev"

# Apply deployment
terraform apply -var="project_name=realtime-monitoring" -var="environment=dev"
```

### 3. Deploy Services
```bash
# Build Docker images
./scripts/deploy.sh build

# Get ECR repository URL
ECR_URL=$(cd infrastructure/aws && terraform output -raw ecr_data_ingestion_url)

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URL

# Push images
docker tag realtime-monitoring/data-ingestion:latest $ECR_URL:latest
docker push $ECR_URL:latest
```

### 4. Deploy to ECS
```bash
# Create ECS service (example for data ingestion)
aws ecs create-service \
  --cluster realtime-monitoring-dev-cluster \
  --service-name data-ingestion \
  --task-definition data-ingestion:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### 5. Deploy Dashboard
```bash
# The Amplify app is created by Terraform
# Connect your GitHub repository to Amplify
aws amplify create-app \
  --name realtime-monitoring-dashboard \
  --repository "https://github.com/your-org/realtime-monitoring" \
  --platform WEB

# Create branch
aws amplify create-branch \
  --app-id your-amplify-app-id \
  --branch-name main \
  --framework "Next.js - SSG"
```

## System Architecture

### Data Flow Overview

```
IoT Devices/APIs → Data Ingestion → Kafka → Data Processing → Anomaly Detection
                                                                      ↓
                                                               RAG Error System
                                                                      ↓
Expert Review ← Final Database ← Clean Data              Anomaly Database
      ↓                                                           ↓
Corrections → Next.js Dashboard ← WebSocket/API ← Real-time Monitoring
```

### Component Architecture

#### 1. Data Ingestion Layer
- **Azure**: IoT Hub + Event Hubs + Data Factory
- **AWS**: IoT Core + MSK + Glue
- **Function**: Handles real-time IoT data and batch data from APIs/CSV

#### 2. Stream Processing
- **Technology**: Apache Kafka
- **Function**: Event-driven data streaming between services

#### 3. Data Storage
- **Staging DB**: PostgreSQL (AWS RDS) / SQL Database (Azure)
- **Anomaly DB**: DynamoDB (AWS) / Cosmos DB (Azure)
- **Final DB**: PostgreSQL (AWS RDS) / SQL Database (Azure)

#### 4. Anomaly Detection
- **Heuristic Engine**: Rule-based anomaly detection
- **ML Engine**: Azure ML / AWS SageMaker for advanced detection

#### 5. RAG Error Reporting
- **Knowledge Base**: Azure Cognitive Search / AWS Kendra
- **LLM**: Azure OpenAI / AWS Bedrock
- **Function**: Intelligent error analysis and reporting

#### 6. Monitoring Dashboard
- **Technology**: Next.js with real-time updates
- **Deployment**: Azure Static Web Apps / AWS Amplify

## Best Practices

### Security

1. **Environment Variables**: Never commit secrets to version control
2. **IAM Policies**: Use least privilege access
3. **Network Security**: Use private subnets for databases
4. **Encryption**: Enable encryption at rest and in transit
5. **Secrets Management**: Use Azure Key Vault / AWS Secrets Manager

### Performance

1. **Auto Scaling**: Configure auto-scaling for container services
2. **Caching**: Use Redis for frequently accessed data
3. **Load Balancing**: Distribute traffic across multiple instances
4. **Monitoring**: Set up comprehensive monitoring and alerting

### Cost Optimization

1. **Resource Sizing**: Right-size your resources based on usage
2. **Auto Shutdown**: Implement auto-shutdown for dev environments
3. **Reserved Instances**: Use reserved instances for predictable workloads
4. **Storage Lifecycle**: Implement data lifecycle policies

### Monitoring

1. **Application Insights** (Azure) or **CloudWatch** (AWS)
2. **Custom Metrics**: Implement custom metrics for business KPIs
3. **Alerting**: Set up alerts for system health and anomalies
4. **Dashboards**: Create operational dashboards for monitoring

## Troubleshooting

### Common Issues

#### 1. Service Connection Issues
```bash
# Check service health
curl http://localhost:8001/health
curl http://localhost:8003/health
curl http://localhost:8004/health

# Check Docker logs
docker-compose logs data-ingestion
docker-compose logs anomaly-detection
docker-compose logs rag-system
```

#### 2. Kafka Connection Issues
```bash
# Check Kafka topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Check consumer groups
docker exec -it kafka kafka-consumer-groups --list --bootstrap-server localhost:9092
```

#### 3. Database Connection Issues
```bash
# Test database connection
docker exec -it postgres psql -U admin -d monitoring

# Check Redis connection
docker exec -it redis redis-cli ping
```

#### 4. Cloud Deployment Issues

**Azure**:
```bash
# Check Container App logs
az containerapp logs show --name data-ingestion --resource-group realtime-monitoring-dev-rg

# Check resource status
az resource list --resource-group realtime-monitoring-dev-rg --output table
```

**AWS**:
```bash
# Check ECS service status
aws ecs describe-services --cluster realtime-monitoring-dev-cluster --services data-ingestion

# Check CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/ecs/realtime-monitoring"
```

### Getting Help

1. Check the [GitHub Issues](https://github.com/your-org/realtime-monitoring/issues)
2. Review the [Documentation](./docs/)
3. Join our [Community Discord](https://discord.gg/your-community)

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Next Steps

After successful deployment:

1. **Configure Monitoring**: Set up alerts and dashboards
2. **Load Test**: Test the system with realistic data loads
3. **Security Review**: Conduct a security audit
4. **Documentation**: Update documentation with your specific configuration
5. **Training**: Train your team on system operation and maintenance

For detailed configuration options and advanced topics, see the [Advanced Configuration Guide](./docs/ADVANCED.md). 