# Azure App Service Configuration
# Next.js dashboard with dual data access (Redis for real-time + Cosmos DB for anomalies)

# App Service Plan for Next.js Dashboard
resource "azurerm_service_plan" "dashboard" {
  name                = "asp-${local.app_service_name}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku_size

  # Zone redundancy for production
  zone_balancing_enabled = var.environment == "prod" && var.enable_geo_redundancy

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "app-service-plan"
    Service   = "dashboard"
    Framework = "nextjs"
  })
}

# Linux Web App for Next.js Dashboard
resource "azurerm_linux_web_app" "dashboard" {
  name                = local.app_service_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.dashboard.id

  # Enable VNet integration for secure access to Redis and Cosmos DB
  virtual_network_subnet_id = var.app_service_enable_vnet_integration ? azurerm_subnet.app_service.id : null

  # Identity configuration
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app_service.id]
  }

  site_config {
    # Node.js runtime for Next.js
    application_stack {
      node_version = "18-lts"
    }

    # Performance and security settings
    always_on                   = var.app_service_sku_tier != "Free"
    use_32_bit_worker           = false
    ftps_state                  = "Disabled"
    http2_enabled               = true
    minimum_tls_version         = "1.2"
    scm_use_main_ip_restriction = false
    vnet_route_all_enabled      = var.app_service_enable_vnet_integration

    # Health check configuration
    health_check_path                 = "/api/health"
    health_check_eviction_time_in_min = 2

    # CORS configuration
    cors {
      allowed_origins = compact([
        "https://${azurerm_container_app.fastapi.latest_revision_fqdn}",
        var.custom_domain != "" ? "https://${var.custom_domain}" : "",
        var.custom_domain != "" ? "https://www.${var.custom_domain}" : ""
      ])
      support_credentials = true
    }

    # IP restrictions for security
    dynamic "ip_restriction" {
      for_each = var.allowed_ip_ranges
      content {
        ip_address = ip_restriction.value
        action     = "Allow"
        priority   = 100 + ip_restriction.key
        name       = "AllowedRange${ip_restriction.key}"
      }
    }

    # Custom startup command for Next.js
    app_command_line = "npm run start"
  }

  # Application settings with Key Vault references and dual data access
  app_settings = {
    # Next.js runtime configuration
    "WEBSITE_NODE_DEFAULT_VERSION"   = "18"
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
    "ENABLE_ORYX_BUILD"              = "true"

    # Application Insights
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=application-insights-connection-string)"

    # Redis configuration for real-time data access
    "REDIS_CONNECTION_STRING" = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=redis-connection-string)"
    "REDIS_HOSTNAME"          = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=redis-hostname)"
    "REDIS_PORT"              = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=redis-port)"
    "REDIS_ACCESS_KEY"        = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=redis-access-key)"
    "REDIS_TTL_HOURS"         = tostring(var.redis_ttl_hours)

    # Cosmos DB configuration for anomaly data access
    "COSMOS_DB_CONNECTION_STRING" = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=cosmos-db-connection-string)"
    "COSMOS_DB_ENDPOINT"          = azurerm_cosmosdb_account.main.endpoint
    "COSMOS_DB_DATABASE_NAME"     = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=cosmos-db-database-name)"

    # FastAPI endpoint for anomaly processing
    "FASTAPI_ENDPOINT" = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=fastapi-endpoint)"

    # Dashboard configuration
    "NEXT_PUBLIC_API_BASE_URL" = "https://${azurerm_container_app.fastapi.latest_revision_fqdn}"
    "NEXT_PUBLIC_ENVIRONMENT"  = var.environment
    "NEXT_PUBLIC_PROJECT_NAME" = var.project_name

    # Data polling configuration
    "REDIS_POLLING_INTERVAL_MS"  = "10000" # 10 seconds
    "COSMOS_POLLING_INTERVAL_MS" = "30000" # 30 seconds

    # Connection pooling settings
    "REDIS_POOL_SIZE"         = "10"
    "REDIS_POOL_MAX_LIFETIME" = "300"

    # Security settings
    "WEBSITE_HTTPLOGGING_RETENTION_DAYS" = tostring(var.log_retention_days)

    # Managed Identity configuration
    "AZURE_CLIENT_ID" = azurerm_user_assigned_identity.app_service.client_id

    # Next.js specific settings
    "NEXT_TELEMETRY_DISABLED" = "1"
    "NEXTAUTH_URL"            = var.custom_domain != "" ? "https://${var.custom_domain}" : "https://${local.app_service_name}.azurewebsites.net"
    "NEXTAUTH_SECRET"         = "your-nextauth-secret-here" # Should be in Key Vault in production
  }

  # Connection strings for database access
  connection_string {
    name  = "Redis"
    type  = "Custom"
    value = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=redis-connection-string)"
  }

  connection_string {
    name  = "CosmosDB"
    type  = "Custom"
    value = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=cosmos-db-connection-string)"
  }

  # Sticky settings for deployment slots
  sticky_settings {
    app_setting_names = [
      "ENVIRONMENT",
      "AZURE_CLIENT_ID"
    ]
    connection_string_names = [
      "Redis",
      "CosmosDB"
    ]
  }

  # Enable HTTPS only
  https_only = var.enable_https_only

  # Backup configuration for production
  dynamic "backup" {
    for_each = var.environment == "prod" && var.cosmosdb_enable_backup ? [1] : []
    content {
      name                = "backup-${local.app_service_name}"
      storage_account_url = "https://${azurerm_storage_account.functions.name}.blob.core.windows.net/backups"
      enabled             = true

      schedule {
        frequency_interval       = 1
        frequency_unit           = "Day"
        keep_at_least_one_backup = true
        retention_period_days    = var.backup_retention_days
        start_time               = "2023-01-01T02:00:00Z"
      }
    }
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component  = "web-app"
    Framework  = "nextjs"
    Purpose    = "dashboard"
    DataAccess = "redis-cosmos-dual"
  })

  depends_on = [
    azurerm_key_vault_secret.redis_connection_string,
    azurerm_key_vault_secret.cosmos_db_connection_string,
    azurerm_key_vault_secret.fastapi_endpoint,
    azurerm_key_vault_access_policy.app_service
  ]
}

# App Service Deployment Slot for Staging (production only)
resource "azurerm_linux_web_app_slot" "staging" {
  count          = var.environment == "prod" ? 1 : 0
  name           = "staging"
  app_service_id = azurerm_linux_web_app.dashboard.id

  site_config {
    application_stack {
      node_version = "18-lts"
    }
    always_on         = var.app_service_sku_tier != "Free"
    health_check_path = "/api/health"
  }

  app_settings = merge(
    azurerm_linux_web_app.dashboard.app_settings,
    {
      "NEXT_PUBLIC_ENVIRONMENT" = "staging"
      "NEXTAUTH_URL"            = "https://${local.app_service_name}-staging.azurewebsites.net"
    }
  )

  tags = merge(local.common_tags, var.additional_tags, {
    Component   = "web-app-slot"
    Environment = "staging"
    Purpose     = "blue-green-deployment"
  })
}

# Auto-scaling rules for App Service
resource "azurerm_monitor_autoscale_setting" "dashboard" {
  count               = var.enable_autoscaling ? 1 : 0
  name                = "autoscale-${local.app_service_name}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  target_resource_id  = azurerm_service_plan.dashboard.id

  profile {
    name = "default"

    capacity {
      default = 1
      minimum = 1
      maximum = 5
    }

    # Scale out based on CPU
    rule {
      metric_trigger {
        metric_name        = "CpuPercentage"
        metric_resource_id = azurerm_service_plan.dashboard.id
        time_grain         = "PT1M"
        statistic          = "Average"
        time_window        = "PT5M"
        time_aggregation   = "Average"
        operator           = "GreaterThan"
        threshold          = 70
      }

      scale_action {
        direction = "Increase"
        type      = "ChangeCount"
        value     = "1"
        cooldown  = "PT5M"
      }
    }

    # Scale in based on CPU
    rule {
      metric_trigger {
        metric_name        = "CpuPercentage"
        metric_resource_id = azurerm_service_plan.dashboard.id
        time_grain         = "PT1M"
        statistic          = "Average"
        time_window        = "PT10M"
        time_aggregation   = "Average"
        operator           = "LessThan"
        threshold          = 30
      }

      scale_action {
        direction = "Decrease"
        type      = "ChangeCount"
        value     = "1"
        cooldown  = "PT10M"
      }
    }

    # Scale out based on HTTP queue length
    rule {
      metric_trigger {
        metric_name        = "HttpQueueLength"
        metric_resource_id = azurerm_service_plan.dashboard.id
        time_grain         = "PT1M"
        statistic          = "Average"
        time_window        = "PT5M"
        time_aggregation   = "Average"
        operator           = "GreaterThan"
        threshold          = 100
      }

      scale_action {
        direction = "Increase"
        type      = "ChangeCount"
        value     = "1"
        cooldown  = "PT5M"
      }
    }
  }

  # Weekend profile with reduced capacity
  profile {
    name = "weekend"

    capacity {
      default = 1
      minimum = 1
      maximum = 2
    }

    recurrence {
      timezone = "UTC"
      days     = ["Saturday", "Sunday"]
      hours    = [0]
      minutes  = [0]
    }
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "autoscale-setting"
    Service   = "dashboard"
  })
}

# Note: Custom domain configuration for App Service
# For custom domains on Linux Web Apps, configure after deployment using:
# 1. Azure Portal: App Service > Custom domains
# 2. Azure CLI commands:
#
# # Add custom domain
# az webapp config hostname add \
#   --webapp-name "${azurerm_linux_web_app.dashboard.name}" \
#   --resource-group "${azurerm_resource_group.main.name}" \
#   --hostname "yourdomain.com"
#
# # Add managed certificate
# az webapp config ssl bind \
#   --name "${azurerm_linux_web_app.dashboard.name}" \
#   --resource-group "${azurerm_resource_group.main.name}" \
#   --certificate-type Managed \
#   --hostname "yourdomain.com"
#
# The Terraform azurerm_app_service_* resources are deprecated for Linux Web Apps
