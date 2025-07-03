"""
Azure Infrastructure for Real-Time Monitoring Dashboard
Implements best practices for multi-service deployment
"""

terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# Variables
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "realtime-monitoring"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "East US"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Project     = "realtime-monitoring"
    Environment = "dev"
    Owner       = "monitoring-team"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.location
  tags     = var.tags
}

# Storage Account for Data Lake
resource "azurerm_storage_account" "data_lake" {
  name                     = "${replace(var.project_name, "-", "")}${var.environment}datalake"
  resource_group_name      = azurerm_resource_group.main.name
  location                = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  is_hns_enabled          = true  # Enable Data Lake Gen2

  tags = var.tags
}

# Container for data ingestion
resource "azurerm_storage_container" "data_ingestion" {
  name                  = "data-ingestion"
  storage_account_name  = azurerm_storage_account.data_lake.name
  container_access_type = "private"
}

# Azure SQL Database - Staging and Final Data
resource "azurerm_mssql_server" "main" {
  name                         = "${var.project_name}-${var.environment}-sql"
  resource_group_name          = azurerm_resource_group.main.name
  location                    = azurerm_resource_group.main.location
  version                     = "12.0"
  administrator_login         = "sqladmin"
  administrator_login_password = "P@ssw0rd123!"  # Use Key Vault in production

  tags = var.tags
}

resource "azurerm_mssql_database" "staging" {
  name      = "monitoring-staging"
  server_id = azurerm_mssql_server.main.id
  sku_name  = "S2"

  tags = var.tags
}

resource "azurerm_mssql_database" "final" {
  name      = "monitoring-final"
  server_id = azurerm_mssql_server.main.id
  sku_name  = "S2"

  tags = var.tags
}

# Azure Cosmos DB - Anomaly and Knowledge Base
resource "azurerm_cosmosdb_account" "main" {
  name                = "${var.project_name}-${var.environment}-cosmos"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  tags = var.tags
}

resource "azurerm_cosmosdb_sql_database" "anomaly" {
  name                = "anomaly-db"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
}

resource "azurerm_cosmosdb_sql_database" "knowledge" {
  name                = "knowledge-db"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
}

# Azure IoT Hub - Real-time data ingestion
resource "azurerm_iothub" "main" {
  name                = "${var.project_name}-${var.environment}-iothub"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  sku {
    name     = "S1"
    capacity = 1
  }

  tags = var.tags
}

# Azure Event Hubs - Kafka-compatible streaming
resource "azurerm_eventhub_namespace" "main" {
  name                = "${var.project_name}-${var.environment}-eventhub"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "Standard"
  capacity            = 2
  kafka_enabled       = true

  tags = var.tags
}

resource "azurerm_eventhub" "data_ingestion" {
  name                = "iot-data-ingestion"
  namespace_name      = azurerm_eventhub_namespace.main.name
  resource_group_name = azurerm_resource_group.main.name
  partition_count     = 4
  message_retention   = 7
}

resource "azurerm_eventhub" "batch_data" {
  name                = "batch-data-ingestion"
  namespace_name      = azurerm_eventhub_namespace.main.name
  resource_group_name = azurerm_resource_group.main.name
  partition_count     = 4
  message_retention   = 7
}

resource "azurerm_eventhub" "rag_errors" {
  name                = "rag-error-reporting"
  namespace_name      = azurerm_eventhub_namespace.main.name
  resource_group_name = azurerm_resource_group.main.name
  partition_count     = 2
  message_retention   = 7
}

# Azure Machine Learning Workspace
resource "azurerm_machine_learning_workspace" "main" {
  name                    = "${var.project_name}-${var.environment}-ml"
  location                = azurerm_resource_group.main.location
  resource_group_name     = azurerm_resource_group.main.name
  application_insights_id = azurerm_application_insights.main.id
  key_vault_id           = azurerm_key_vault.main.id
  storage_account_id     = azurerm_storage_account.data_lake.id

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

# Azure OpenAI Service
resource "azurerm_cognitive_account" "openai" {
  name                = "${var.project_name}-${var.environment}-openai"
  location            = "East US"  # OpenAI is only available in certain regions
  resource_group_name = azurerm_resource_group.main.name
  kind                = "OpenAI"
  sku_name            = "S0"

  tags = var.tags
}

# Azure Cognitive Search - Knowledge Base
resource "azurerm_search_service" "main" {
  name                = "${var.project_name}-${var.environment}-search"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "standard"

  tags = var.tags
}

# Azure Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                = "${var.project_name}-${var.environment}-env"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = var.tags
}

# Azure Container Registry
resource "azurerm_container_registry" "main" {
  name                = "${replace(var.project_name, "-", "")}${var.environment}acr"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Standard"
  admin_enabled       = true

  tags = var.tags
}

# Data Ingestion Container App
resource "azurerm_container_app" "data_ingestion" {
  name                         = "${var.project_name}-data-ingestion"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  template {
    container {
      name   = "data-ingestion"
      image  = "${azurerm_container_registry.main.login_server}/data-ingestion:latest"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "DATABASE_URL"
        value = "mssql://${azurerm_mssql_server.main.administrator_login}:${azurerm_mssql_server.main.administrator_login_password}@${azurerm_mssql_server.main.fully_qualified_domain_name}:1433/${azurerm_mssql_database.staging.name}"
      }

      env {
        name  = "KAFKA_BOOTSTRAP_SERVERS"
        value = "${azurerm_eventhub_namespace.main.name}.servicebus.windows.net:9093"
      }

      env {
        name  = "AZURE_IOT_HUB_CONNECTION_STRING"
        value = azurerm_iothub.main.shared_access_policy[0].connection_string
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 8000
    
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  tags = var.tags
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "${var.project_name}-${var.environment}-insights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"

  tags = var.tags
}

# Key Vault
resource "azurerm_key_vault" "main" {
  name                = "${var.project_name}-${var.environment}-kv"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete"
    ]
  }

  tags = var.tags
}

data "azurerm_client_config" "current" {}

# Static Web App for Dashboard
resource "azurerm_static_site" "dashboard" {
  name                = "${var.project_name}-${var.environment}-dashboard"
  resource_group_name = azurerm_resource_group.main.name
  location            = "East US 2"  # Static Web Apps available regions
  sku_tier            = "Standard"
  sku_size            = "Standard"

  tags = var.tags
}

# Outputs
output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "storage_account_name" {
  value = azurerm_storage_account.data_lake.name
}

output "sql_server_fqdn" {
  value = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "cosmos_db_endpoint" {
  value = azurerm_cosmosdb_account.main.endpoint
}

output "iot_hub_hostname" {
  value = azurerm_iothub.main.hostname
}

output "eventhub_namespace" {
  value = azurerm_eventhub_namespace.main.name
}

output "ml_workspace_name" {
  value = azurerm_machine_learning_workspace.main.name
}

output "openai_endpoint" {
  value = azurerm_cognitive_account.openai.endpoint
}

output "search_service_name" {
  value = azurerm_search_service.main.name
}

output "container_registry_login_server" {
  value = azurerm_container_registry.main.login_server
}

output "dashboard_url" {
  value = azurerm_static_site.dashboard.default_host_name
} 