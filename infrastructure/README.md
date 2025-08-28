# Azure Event-Driven Anomaly Detection Infrastructure

This Terraform infrastructure deploys a comprehensive event-driven anomaly detection system on Azure, designed for real-time processing of industrial sensor data with three-tier analysis (Heuristic → Statistical → LLM).

## 🏗️ Architecture Overview

### Data Flow Architecture
```
Microsoft Fabric → Redis (24h TTL) → Next.js Dashboard (Real-time)
                     ↓
                Azure Function (Redis Trigger) → FastAPI (3-tier Analysis)
                     ↓
                Cosmos DB (Results) ← Next.js Dashboard (Anomaly Display)
```

### Infrastructure Components

- **Azure Cache for Redis** - Premium tier with 24-hour rolling window
- **Azure Cosmos DB** - Serverless NoSQL database with 4 collections
- **Azure Functions** - Event-driven processing with Redis triggers
- **Azure Container Apps** - FastAPI application hosting
- **Azure App Service** - Next.js dashboard with dual data access
- **Azure OpenAI** - GPT-4o-mini for LLM analysis
- **Azure Key Vault** - Centralized secrets management
- **Virtual Network** - Secure networking with private endpoints
- **Application Insights** - Monitoring and observability

## 📊 Data Specifications

- **Volume**: 100-key JSON payload every 10 seconds (~360 records/hour)
- **Redis TTL**: 24-hour data retention with timestamps
- **Core Fields**: 8 guaranteed values, additional fields variable
- **Update Frequencies**: Mixed (10s and 1-hour intervals)
- **Real-time Access**: Next.js → Redis (10-second polling)
- **Anomaly Storage**: Next.js → Cosmos DB (historical analysis)

## 🚀 Quick Start

### Prerequisites

1. **Azure CLI** installed and authenticated
   ```bash
   az login
   az account set --subscription "your-subscription-id"
   ```

2. **Terraform** >= 1.0 installed
   ```bash
   # macOS
   brew install terraform
   
   # Windows
   choco install terraform
   
   # Linux
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   ```

3. **Azure Permissions**
   - Contributor role on target subscription
   - Key Vault Administrator (for secrets management)
   - Network Contributor (for VNet configuration)

### Deployment Steps

1. **Clone and Configure**
   ```bash
   cd infrastructure/
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your specific values
   ```

2. **Deploy Infrastructure**
   ```bash
   # Plan deployment (recommended first step)
   ./deploy.sh -e prod -p
   
   # Deploy with confirmation
   ./deploy.sh -e prod
   
   # Deploy with auto-approval (CI/CD)
   ./deploy.sh -e prod -y
   ```

3. **Verify Deployment**
   ```bash
   terraform output
   ```

## 📁 File Structure

```
infrastructure/
├── main.tf                    # Provider configuration and locals
├── variables.tf              # Input variables with validation
├── outputs.tf               # Output values (sensitive marked)
├── resource-group.tf        # Resource group definition
├── redis.tf                 # Redis Premium with dual access
├── cosmos-db.tf             # Cosmos DB with 4 collections
├── functions.tf             # Azure Functions with triggers
├── container-apps.tf        # FastAPI container deployment
├── app-service.tf          # Next.js web application
├── openai.tf               # Azure OpenAI GPT-4o-mini
├── key-vault.tf            # Secrets management
├── monitoring.tf           # Application Insights & alerts
├── networking.tf           # VNet, subnets, NSGs
├── security.tf             # Managed identities & RBAC
├── terraform.tfvars.example # Example configuration
├── deploy.sh               # Deployment script
├── destroy.sh              # Safe destruction script
└── README.md               # This documentation
```

## 🔧 Configuration

### Environment Variables

The infrastructure automatically configures these environment variables in Key Vault:

**Redis Configuration**
- `REDIS_CONNECTION_STRING` - Secure connection string
- `REDIS_HOSTNAME` - Redis endpoint hostname
- `REDIS_PORT` - SSL port (6380)
- `REDIS_ACCESS_KEY` - Primary access key

**Cosmos DB Configuration**
- `COSMOS_DB_CONNECTION_STRING` - Account connection string
- `COSMOS_DB_ENDPOINT` - Account endpoint URL
- `COSMOS_DB_DATABASE_NAME` - Database name

**Azure OpenAI Configuration**
- `OPENAI_ENDPOINT` - Service endpoint
- `OPENAI_API_KEY` - Authentication key
- `OPENAI_DEPLOYMENT_NAME` - Model deployment name

**Application Configuration**
- `FASTAPI_ENDPOINT` - Container app URL
- `APPLICATION_INSIGHTS_CONNECTION_STRING` - Monitoring

### Cosmos DB Collections Schema

#### 1. anomaly_results
```json
{
  "id": "string",
  "timestamp": "datetime",
  "raw_data": "object",
  "heuristic": {
    "timestamp": "datetime",
    "method": "heuristic",
    "results": {
      "SENSOR_NAME": {
        "value": "number",
        "alarm_type": "OK|High|Low|High-High|Low-Low",
        "status": "Normal|Anomaly",
        "context": "string"
      }
    }
  },
  "statistical": { /* similar structure */ },
  "ml": {
    "timestamp": "datetime",
    "method": "ml",
    "results": {
      "values": { "SENSOR_NAME": "number" },
      "status": "Normal|Anomaly"
    },
    "processing_time_ms": "number"
  },
  "final_status": "normal|anomaly",
  "overall_confidence": "float"
}
```

#### 2. unresolved_anomalies
- Anomalies requiring human intervention
- Partitioned by `severity_level`

#### 3. resolved_anomalies
- Historical record of resolved anomalies
- Partitioned by `resolved_by`

#### 4. modified_values
- Audit trail for manual data modifications
- Partitioned by `modified_by`

## 🔒 Security Features

### Network Security
- **Private Endpoints** for Cosmos DB, Redis, Key Vault
- **VNet Integration** for App Service and Functions
- **Network Security Groups** with least privilege rules
- **IP Restrictions** configurable per environment

### Identity & Access Management
- **Managed Identities** for all services
- **RBAC Assignments** with minimal required permissions
- **Key Vault Access Policies** for secrets management
- **Resource Locks** preventing accidental deletion

### Data Protection
- **TLS 1.2+** enforced on all endpoints
- **HTTPS Only** for web applications
- **Encrypted Storage** for all data at rest
- **Backup Enabled** for critical resources

## 📈 Monitoring & Observability

### Application Insights Integration
- **Distributed Tracing** across all components
- **Custom Metrics** for anomaly detection rates
- **Performance Counters** for resource utilization
- **Log Analytics** for centralized logging

### Alerts Configuration
- Redis memory usage > 80%
- Cosmos DB RU consumption spikes
- Function execution errors
- App Service response time > 30s
- Container App CPU usage > 80%

### Custom Dashboard
- Real-time metrics visualization
- Infrastructure health status
- Cost tracking and optimization insights

## 🌍 Multi-Environment Support

### Environment Configurations

**Development**
```bash
# Minimal cost configuration
./deploy.sh -e dev -f dev.tfvars
```

**Staging**
```bash
# Production-like with reduced capacity
./deploy.sh -e staging -f staging.tfvars
```

**Production**
```bash
# Full production with high availability
./deploy.sh -e prod -f prod.tfvars
```

### Workspace Management
```bash
# Create environment-specific workspaces
terraform workspace new production
terraform workspace new staging
terraform workspace new development

# Deploy to specific workspace
./deploy.sh -e prod -w production
```

## 💰 Cost Optimization

### Automatic Cost Controls
- **Serverless Cosmos DB** - Pay per RU consumed
- **Consumption Functions** - Pay per execution
- **Auto-scaling** enabled for variable workloads
- **Scheduled Shutdown** for dev/staging environments

### Cost Monitoring
- **Resource Tagging** for cost allocation
- **Budget Alerts** configured per environment
- **Right-sizing Recommendations** in monitoring

## 🔄 Deployment Strategies

### Blue-Green Deployments
```bash
# Deploy to staging slot
terraform apply -target=azurerm_linux_web_app_slot.staging

# Swap slots after validation
az webapp deployment slot swap \
  --name $APP_NAME \
  --resource-group $RG_NAME \
  --slot staging
```

### Rolling Updates
- Container Apps support zero-downtime deployments
- Functions automatically handle version transitions
- Database migrations handled via Functions

## 🛠️ Troubleshooting

### Common Issues

**1. Redis Connection Timeouts**
```bash
# Check VNet integration
az webapp vnet-integration list --name $APP_NAME --resource-group $RG_NAME

# Verify NSG rules
az network nsg rule list --nsg-name nsg-app-service --resource-group $RG_NAME
```

**2. Cosmos DB Throttling**
```bash
# Check RU consumption
az cosmosdb database throughput show \
  --account-name $COSMOS_ACCOUNT \
  --resource-group $RG_NAME \
  --name $DATABASE_NAME
```

**3. Function Cold Starts**
- Consider Premium plan for production
- Implement keep-alive strategies
- Monitor execution duration metrics

### Debug Commands
```bash
# View deployment logs
az functionapp log tail --name $FUNCTION_NAME --resource-group $RG_NAME

# Check container logs
az containerapp logs show --name $CONTAINER_NAME --resource-group $RG_NAME

# Monitor Redis metrics
az redis show-metrics --name $REDIS_NAME --resource-group $RG_NAME
```

## 🗑️ Cleanup

### Safe Destruction
```bash
# Plan destruction (review first)
./destroy.sh -e dev -p

# Destroy with data preservation
./destroy.sh -e dev

# Complete destruction (including data)
./destroy.sh -e dev --destroy-data --force-destroy
```

### Manual Cleanup
If automated destruction fails:
1. Delete resources via Azure Portal
2. Clean up Terraform state: `terraform state rm`
3. Verify no orphaned resources remain

## 📚 Additional Resources

- [Azure Architecture Center](https://docs.microsoft.com/en-us/azure/architecture/)
- [Terraform Azure Provider Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure OpenAI Service Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Azure Container Apps Documentation](https://docs.microsoft.com/en-us/azure/container-apps/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test changes in development environment
4. Submit pull request with infrastructure impact analysis

## 📄 License

This infrastructure code is provided as-is for the anomaly detection system project.

---

**⚠️ Important Notes:**
- Always test in development before deploying to production
- Review security settings for your specific compliance requirements
- Monitor costs closely, especially in production environments
- Keep Terraform state files secure and backed up
