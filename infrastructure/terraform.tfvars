# Terraform Variables for Azure Event-Driven Anomaly Detection Architecture
# Same tenant configuration with Azure Service Tags for Redis access

# Location and Environment Configuration
location     = "UAE North"
environment  = "prod"
project_name = "anomaly-detection"

# Redis Configuration (Standard SKU for UAE North compatibility)
redis_sku_name           = "Standard"
redis_family             = "C"
redis_capacity           = 2     # C2 (2.5GB) for better availability
redis_enable_persistence = false # Not available on Standard SKU
redis_ttl_hours          = 24

# Cosmos DB Configuration
cosmosdb_offer_type        = "Standard"
cosmosdb_consistency_level = "Session"
cosmosdb_enable_serverless = true
cosmosdb_enable_backup     = true

# App Service Configuration
app_service_sku_tier                = "Basic"
app_service_sku_size                = "B1"
app_service_enable_vnet_integration = true

# Azure Functions Configuration
functions_storage_account_type = "LRS"
functions_consumption_plan     = true

# Container Apps Configuration
container_apps_cpu          = 0.5
container_apps_memory       = "1Gi"
container_apps_min_replicas = 1
container_apps_max_replicas = 10

# Azure OpenAI Configuration
openai_model_deployment_name = "gpt-4o-mini"
openai_model_name            = "gpt-4o-mini"
openai_model_version         = "2024-12-01-preview"
openai_sku_name              = "S0"
openai_capacity              = 10

# Networking Configuration
vnet_address_space                      = ["10.0.0.0/16"]
subnet_app_service_address_prefix       = "10.0.1.0/24"
subnet_container_apps_address_prefix    = "10.0.2.0/23"
subnet_functions_address_prefix         = "10.0.4.0/24"
subnet_private_endpoints_address_prefix = "10.0.5.0/24"

# Security Configuration
enable_private_endpoints          = true
enable_rbac_assignments           = false
create_network_watcher            = false
enable_management_locks           = false
create_current_user_access_policy = true

# Azure Service Tags for Redis Access (Same Tenant)
# This allows Azure Fabric and other Azure services to access Redis
allowed_ip_ranges = [
  # Azure Service Tags - allows Azure services in same tenant
  "20.0.0.0/8",  # Azure East US, West US, Central US
  "40.0.0.0/8",  # Azure Europe, Asia Pacific
  "52.0.0.0/8",  # Azure Australia, Canada
  "104.0.0.0/8", # Azure additional ranges
  "168.0.0.0/8", # Azure additional ranges

  # Specific Azure Fabric ranges (if known)
  "20.190.0.0/16", # Azure Fabric specific
  "20.191.0.0/16", # Azure Fabric specific

  # Add your external IP here if you need external access
  "217.165.102.109/32"  # Your current IP address
]

# Monitoring Configuration
log_retention_days     = 30
enable_diagnostic_logs = false

# Cost Optimization
enable_autoscaling = true
schedule_shutdown  = false

# Custom Domain and SSL
custom_domain     = ""
enable_https_only = true

# Backup and Disaster Recovery
enable_geo_redundancy = false
backup_retention_days = 7

# Additional Tags
additional_tags = {
  Department = "Engineering"
  CostCenter = "CC-123"
  Owner      = "Platform Team"
  Contact    = "platform-team@company.com"
  Tenant     = "same-tenant"
  Purpose    = "anomaly-detection"
  Access     = "azure-service-tags"
}
