# Terraform Outputs for Azure Event-Driven Anomaly Detection Architecture
# Resource identifiers and connection details

# Resource Group Information
output "resource_group_name" {
  description = "Name of the created resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.main.location
}

# Redis Cache Outputs
output "redis_name" {
  description = "Name of the Redis cache instance"
  value       = azurerm_redis_cache.main.name
}

output "redis_hostname" {
  description = "Hostname of the Redis cache"
  value       = azurerm_redis_cache.main.hostname
}

output "redis_port" {
  description = "Port of the Redis cache"
  value       = azurerm_redis_cache.main.port
}

output "redis_ssl_port" {
  description = "SSL port of the Redis cache"
  value       = azurerm_redis_cache.main.ssl_port
}

output "redis_connection_string" {
  description = "Redis connection string for applications"
  value       = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port}/0"
  sensitive   = true
}

output "redis_access_key" {
  description = "Primary access key for Redis cache"
  value       = azurerm_redis_cache.main.primary_access_key
  sensitive   = true
}

output "redis_secondary_access_key" {
  description = "Secondary access key for Redis cache"
  value       = azurerm_redis_cache.main.secondary_access_key
  sensitive   = true
}

# Cosmos DB Outputs
output "cosmos_db_name" {
  description = "Name of the Cosmos DB account"
  value       = azurerm_cosmosdb_account.main.name
}

output "cosmos_db_endpoint" {
  description = "Endpoint URL for Cosmos DB"
  value       = azurerm_cosmosdb_account.main.endpoint
}

output "cosmos_db_primary_key" {
  description = "Primary master key for Cosmos DB"
  value       = azurerm_cosmosdb_account.main.primary_key
  sensitive   = true
}

output "cosmos_db_secondary_key" {
  description = "Secondary master key for Cosmos DB"
  value       = azurerm_cosmosdb_account.main.secondary_key
  sensitive   = true
}

output "cosmos_db_connection_string" {
  description = "Connection string for Cosmos DB"
  value       = "AccountEndpoint=${azurerm_cosmosdb_account.main.endpoint};AccountKey=${azurerm_cosmosdb_account.main.primary_key};"
  sensitive   = true
}

output "cosmos_db_database_name" {
  description = "Name of the Cosmos DB database"
  value       = azurerm_cosmosdb_sql_database.main.name
}

# Azure Functions Outputs
output "function_app_name" {
  description = "Name of the Azure Function App"
  value       = azurerm_windows_function_app.main.name
}

output "function_app_default_hostname" {
  description = "Default hostname of the Function App"
  value       = azurerm_windows_function_app.main.default_hostname
}

output "function_app_identity_principal_id" {
  description = "Principal ID of the Function App's managed identity"
  value       = azurerm_windows_function_app.main.identity[0].principal_id
}

# Container Apps Outputs
output "container_app_name" {
  description = "Name of the Container App"
  value       = azurerm_container_app.fastapi.name
}

output "container_app_fqdn" {
  description = "Fully qualified domain name of the Container App"
  value       = azurerm_container_app.fastapi.latest_revision_fqdn
}

output "container_app_url" {
  description = "URL of the Container App"
  value       = "https://${azurerm_container_app.fastapi.latest_revision_fqdn}"
}

# App Service Outputs
output "app_service_name" {
  description = "Name of the App Service"
  value       = azurerm_linux_web_app.dashboard.name
}

output "app_service_url" {
  description = "URL of the App Service"
  value       = "https://${azurerm_linux_web_app.dashboard.default_hostname}"
}

output "app_service_default_hostname" {
  description = "Default hostname of the App Service"
  value       = azurerm_linux_web_app.dashboard.default_hostname
}

output "app_service_identity_principal_id" {
  description = "Principal ID of the App Service's managed identity"
  value       = azurerm_linux_web_app.dashboard.identity[0].principal_id
}

# Azure OpenAI Outputs
output "openai_name" {
  description = "Name of the Azure OpenAI service"
  value       = azurerm_cognitive_account.openai.name
}

output "openai_endpoint" {
  description = "Endpoint URL for Azure OpenAI"
  value       = azurerm_cognitive_account.openai.endpoint
}

output "openai_api_key" {
  description = "Primary API key for Azure OpenAI"
  value       = azurerm_cognitive_account.openai.primary_access_key
  sensitive   = true
}

output "openai_secondary_api_key" {
  description = "Secondary API key for Azure OpenAI"
  value       = azurerm_cognitive_account.openai.secondary_access_key
  sensitive   = true
}

output "openai_deployment_name" {
  description = "Name of the OpenAI model deployment"
  value       = azurerm_cognitive_deployment.gpt4o_mini.name
}

# Key Vault Outputs
output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

output "key_vault_id" {
  description = "Resource ID of the Key Vault"
  value       = azurerm_key_vault.main.id
}

# Application Insights Outputs
output "application_insights_name" {
  description = "Name of Application Insights"
  value       = azurerm_application_insights.main.name
}

output "application_insights_instrumentation_key" {
  description = "Instrumentation key for Application Insights"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Connection string for Application Insights"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

# Networking Outputs
output "virtual_network_name" {
  description = "Name of the virtual network"
  value       = azurerm_virtual_network.main.name
}

output "virtual_network_id" {
  description = "Resource ID of the virtual network"
  value       = azurerm_virtual_network.main.id
}

output "subnet_app_service_id" {
  description = "Resource ID of the App Service subnet"
  value       = azurerm_subnet.app_service.id
}

output "subnet_container_apps_id" {
  description = "Resource ID of the Container Apps subnet"
  value       = azurerm_subnet.container_apps.id
}

output "subnet_functions_id" {
  description = "Resource ID of the Functions subnet"
  value       = azurerm_subnet.functions.id
}

# Storage Account Outputs
output "storage_account_name" {
  description = "Name of the storage account for Functions"
  value       = azurerm_storage_account.functions.name
}

output "storage_account_primary_connection_string" {
  description = "Primary connection string for the storage account"
  value       = azurerm_storage_account.functions.primary_connection_string
  sensitive   = true
}

# Log Analytics Outputs
output "log_analytics_workspace_name" {
  description = "Name of the Log Analytics workspace"
  value       = azurerm_log_analytics_workspace.main.name
}

output "log_analytics_workspace_id" {
  description = "Resource ID of the Log Analytics workspace"
  value       = azurerm_log_analytics_workspace.main.id
}

# Container Registry Outputs
output "container_registry_name" {
  description = "Name of the Azure Container Registry"
  value       = var.environment == "prod" ? azurerm_container_registry.main[0].name : "No ACR in non-prod environment"
}

output "container_registry_login_server" {
  description = "Login server URL for the Azure Container Registry"
  value       = var.environment == "prod" ? azurerm_container_registry.main[0].login_server : "No ACR in non-prod environment"
}

output "container_registry_admin_username" {
  description = "Admin username for the Azure Container Registry"
  value       = var.environment == "prod" ? azurerm_container_registry.main[0].admin_username : "No ACR in non-prod environment"
  sensitive   = true
}

output "container_registry_admin_password" {
  description = "Admin password for the Azure Container Registry"
  value       = var.environment == "prod" ? azurerm_container_registry.main[0].admin_password : "No ACR in non-prod environment"
  sensitive   = true
}

# Environment Variables Summary (for easy configuration)
output "environment_variables" {
  description = "Environment variables needed for applications (non-sensitive)"
  value = {
    REDIS_HOSTNAME                         = azurerm_redis_cache.main.hostname
    REDIS_PORT                             = azurerm_redis_cache.main.ssl_port
    COSMOS_DB_ENDPOINT                     = azurerm_cosmosdb_account.main.endpoint
    COSMOS_DB_DATABASE_NAME                = azurerm_cosmosdb_sql_database.main.name
    OPENAI_ENDPOINT                        = azurerm_cognitive_account.openai.endpoint
    OPENAI_DEPLOYMENT_NAME                 = azurerm_cognitive_deployment.gpt4o_mini.name
    FASTAPI_ENDPOINT                       = "https://${azurerm_container_app.fastapi.latest_revision_fqdn}"
    KEY_VAULT_URI                          = azurerm_key_vault.main.vault_uri
    APPLICATION_INSIGHTS_CONNECTION_STRING = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=application-insights-connection-string)"
    REDIS_CONNECTION_STRING                = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=redis-connection-string)"
    COSMOS_DB_CONNECTION_STRING            = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=cosmos-db-connection-string)"
    OPENAI_API_KEY                         = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=openai-api-key)"
  }
}

# Deployment Information
output "deployment_info" {
  description = "Information about the deployment"
  value = {
    resource_group    = azurerm_resource_group.main.name
    location          = azurerm_resource_group.main.location
    environment       = var.environment
    project_name      = var.project_name
    deployment_date   = timestamp()
    terraform_version = "~> 1.0"
  }
}
