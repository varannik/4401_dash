# Azure Container Apps Configuration
# FastAPI application with 3 endpoints for anomaly detection

# Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${local.naming_prefix}-${local.unique_suffix}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  # Network configuration
  infrastructure_subnet_id       = azurerm_subnet.container_apps.id
  internal_load_balancer_enabled = false

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "container-app-environment"
    Purpose   = "fastapi-hosting"
  })
}

# Container App for FastAPI
resource "azurerm_container_app" "fastapi" {
  name                         = local.container_app_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  # Identity configuration
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_app.id]
  }

  template {
    # Scaling configuration
    min_replicas = var.container_apps_min_replicas
    max_replicas = var.container_apps_max_replicas

    container {
      name   = "fastapi-anomaly-detection"
      image  = "${azurerm_container_registry.main[0].login_server}/anomaly-detection:latest"
      cpu    = var.container_apps_cpu
      memory = var.container_apps_memory

      # Environment variables for FastAPI app
      env {
        name  = "AZURE_OPENAI_ENDPOINT"
        value = azurerm_cognitive_account.openai.endpoint
      }

      env {
        name        = "AZURE_OPENAI_API_KEY"
        secret_name = "openai-api-key"
      }

      env {
        name  = "AZURE_OPENAI_DEPLOYMENT"
        value = azurerm_cognitive_deployment.gpt4o_mini.name
      }

      env {
        name  = "AZURE_OPENAI_API_VERSION"
        value = "2024-12-01-preview"
      }

      env {
        name        = "COSMOS_DB_CONNECTION_STRING"
        secret_name = "cosmos-db-connection-string"
      }

      env {
        name  = "COSMOS_DB_ENDPOINT"
        value = azurerm_cosmosdb_account.main.endpoint
      }

      env {
        name  = "COSMOS_DB_DATABASE_NAME"
        value = azurerm_cosmosdb_sql_database.main.name
      }

      env {
        name        = "APPLICATION_INSIGHTS_CONNECTION_STRING"
        secret_name = "application-insights-connection-string"
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "PROJECT_NAME"
        value = var.project_name
      }

      env {
        name  = "AZURE_CLIENT_ID"
        value = azurerm_user_assigned_identity.container_app.client_id
      }

      # Redis configuration
      env {
        name  = "REDIS_HOST"
        value = azurerm_redis_cache.main.hostname
      }

      env {
        name        = "REDIS_PASSWORD"
        secret_name = "redis-password"
      }

      env {
        name  = "REDIS_PORT"
        value = tostring(azurerm_redis_cache.main.ssl_port)
      }

      env {
        name  = "REDIS_SSL"
        value = "true"
      }

      env {
        name  = "REDIS_DB"
        value = "0"
      }

      # API configuration
      env {
        name  = "API_HOST"
        value = "0.0.0.0"
      }

      env {
        name  = "API_PORT"
        value = "8000"
      }

      env {
        name  = "DEBUG"
        value = var.environment == "dev" ? "true" : "false"
      }

      env {
        name  = "LOG_LEVEL"
        value = var.environment == "prod" ? "INFO" : "DEBUG"
      }

      # Health probe configuration
      liveness_probe {
        transport               = "HTTP"
        port                    = 8000
        path                    = "/health"
        interval_seconds        = 30
        timeout                 = 5
        failure_count_threshold = 3
      }

      readiness_probe {
        transport               = "HTTP"
        port                    = 8000
        path                    = "/health"
        interval_seconds        = 10
        timeout                 = 3
        failure_count_threshold = 3
        success_count_threshold = 1
      }

      startup_probe {
        transport               = "HTTP"
        port                    = 8000
        path                    = "/health"
        interval_seconds        = 10
        timeout                 = 3
        failure_count_threshold = 10 # Maximum allowed value
      }
    }

    # Scaling rules
    http_scale_rule {
      name                = "http-scale-rule"
      concurrent_requests = 30
    }

    # CPU scaling rule
    custom_scale_rule {
      name             = "cpu-scale-rule"
      custom_rule_type = "cpu"
      metadata = {
        type  = "Utilization"
        value = "70"
      }
    }

    # Memory scaling rule
    custom_scale_rule {
      name             = "memory-scale-rule"
      custom_rule_type = "memory"
      metadata = {
        type  = "Utilization"
        value = "80"
      }
    }
  }

  # Ingress configuration
  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 8000
    transport                  = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }

    # IP restrictions for security
    dynamic "ip_security_restriction" {
      for_each = var.allowed_ip_ranges
      content {
        name             = "allowed-range-${ip_security_restriction.key}"
        ip_address_range = ip_security_restriction.value
        action           = "Allow"
      }
    }
  }

  # Secrets for environment variables
  secret {
    name  = "openai-api-key"
    value = azurerm_cognitive_account.openai.primary_access_key
  }

  secret {
    name  = "cosmos-db-connection-string"
    value = "AccountEndpoint=${azurerm_cosmosdb_account.main.endpoint};AccountKey=${azurerm_cosmosdb_account.main.primary_key};"
  }

  secret {
    name  = "application-insights-connection-string"
    value = azurerm_application_insights.main.connection_string
  }

  secret {
    name  = "redis-password"
    value = azurerm_redis_cache.main.primary_access_key
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "container-app"
    Service   = "fastapi"
    Purpose   = "anomaly-detection-api"
    Endpoints = "heuristic,statistical,ml"
  })

  depends_on = [
    azurerm_cognitive_account.openai,
    azurerm_cosmosdb_account.main,
    azurerm_application_insights.main
  ]
}

# Container App Job for batch processing (optional)
resource "azurerm_container_app_job" "batch_processor" {
  count                        = var.environment == "prod" ? 1 : 0
  name                         = "caj-batch-${local.naming_prefix}"
  location                     = azurerm_resource_group.main.location
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = azurerm_container_app_environment.main.id

  replica_timeout_in_seconds = 1800 # 30 minutes
  replica_retry_limit        = 3
  manual_trigger_config {
    parallelism              = 1
    replica_completion_count = 1
  }

  template {
    container {
      name   = "batch-processor"
      image  = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest" # Placeholder
      cpu    = 1.0
      memory = "2Gi"

      env {
        name  = "JOB_TYPE"
        value = "batch-processing"
      }

      env {
        name        = "COSMOS_DB_CONNECTION_STRING"
        secret_name = "cosmos-db-connection-string"
      }
    }
  }

  secret {
    name  = "cosmos-db-connection-string"
    value = "AccountEndpoint=${azurerm_cosmosdb_account.main.endpoint};AccountKey=${azurerm_cosmosdb_account.main.primary_key};"
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "container-app-job"
    Purpose   = "batch-processing"
  })
}

# Diagnostic settings for Container App
resource "azurerm_monitor_diagnostic_setting" "container_app" {
  count                      = var.enable_diagnostic_logs ? 1 : 0
  name                       = "diag-${local.container_app_name}"
  target_resource_id         = azurerm_container_app.fastapi.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "ContainerAppConsoleLogs"
  }

  enabled_log {
    category = "ContainerAppSystemLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# Note: Custom domain configuration for Container Apps
# Container Apps custom domains and certificates are currently managed through:
# 1. Azure CLI: az containerapp hostname add
# 2. Azure Portal: Container Apps > Custom domains
# 3. ARM templates or Bicep
# 
# The Terraform AzureRM provider doesn't yet support:
# - azurerm_container_app_custom_domain
# - azurerm_container_app_managed_certificate
#
# To add custom domains after deployment, use:
# az containerapp hostname add \
#   --hostname "api.yourdomain.com" \
#   --name "${azurerm_container_app.fastapi.name}" \
#   --resource-group "${azurerm_resource_group.main.name}"

# Container Registry (if you want to use private images)
resource "azurerm_container_registry" "main" {
  count               = var.environment == "prod" ? 1 : 0
  name                = "acr${replace(var.project_name, "-", "")}${var.environment}${local.unique_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true

  # Network access - public_network_access_enabled can only be disabled for Premium SKU
  public_network_access_enabled = true # Basic/Standard SKU requires public access
  network_rule_bypass_option    = "AzureServices"

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "container-registry"
    Purpose   = "private-images"
  })
}

# RBAC for Container App to pull from ACR
resource "azurerm_role_assignment" "container_app_acr_pull" {
  count                = var.environment == "prod" && var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_container_registry.main[0].id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.container_app.principal_id
}
