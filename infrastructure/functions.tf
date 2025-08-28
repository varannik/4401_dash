# Azure Functions Configuration
# Three functions: Redis trigger, Cosmos DB change feed, and cleanup timer

# Storage Account for Azure Functions
resource "azurerm_storage_account" "functions" {
  name                     = local.storage_name
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = var.functions_storage_account_type

  # Security configuration
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  shared_access_key_enabled       = true

  # Enable blob versioning for backup
  blob_properties {
    versioning_enabled = true
    delete_retention_policy {
      days = var.backup_retention_days
    }
    container_delete_retention_policy {
      days = var.backup_retention_days
    }
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "storage-account"
    Purpose   = "functions-storage"
  })
}

# App Service Plan for Functions (Consumption or Premium)
resource "azurerm_service_plan" "functions" {
  name                = "asp-${local.function_name}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Windows"

  # Use Consumption plan for cost optimization
  sku_name = var.functions_consumption_plan ? "Y1" : "EP1"

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "app-service-plan"
    Service   = "functions"
    Tier      = var.functions_consumption_plan ? "consumption" : "premium"
  })
}

# Azure Function App
resource "azurerm_windows_function_app" "main" {
  name                = local.function_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.functions.id

  storage_account_name       = azurerm_storage_account.functions.name
  storage_account_access_key = azurerm_storage_account.functions.primary_access_key

  # Enable VNet integration
  virtual_network_subnet_id = var.app_service_enable_vnet_integration ? azurerm_subnet.functions.id : null

  # Identity configuration
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.function_app.id]
  }

  site_config {
    # Runtime configuration
    application_stack {
      powershell_core_version = "7.2"
    }

    # Performance and scaling
    always_on                   = !var.functions_consumption_plan
    use_32_bit_worker           = false
    ftps_state                  = "Disabled"
    http2_enabled               = true
    minimum_tls_version         = "1.2"
    scm_use_main_ip_restriction = false

    # CORS configuration for Next.js app
    cors {
      allowed_origins = compact([
        "https://${local.app_service_name}.azurewebsites.net",
        var.custom_domain != "" ? "https://${var.custom_domain}" : ""
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
      }
    }
  }

  # Application settings with Key Vault references
  app_settings = {
    # Azure Functions runtime
    "FUNCTIONS_WORKER_RUNTIME"            = "powershell"
    "FUNCTIONS_EXTENSION_VERSION"         = "~4"
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"

    # Application Insights
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=application-insights-connection-string)"

    # Redis configuration
    "REDIS_CONNECTION_STRING" = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=redis-connection-string)"
    "REDIS_HOSTNAME"          = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=redis-hostname)"
    "REDIS_PORT"              = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=redis-port)"
    "REDIS_ACCESS_KEY"        = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=redis-access-key)"

    # Cosmos DB configuration
    "COSMOS_DB_CONNECTION_STRING" = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=cosmos-db-connection-string)"
    "COSMOS_DB_ENDPOINT"          = azurerm_cosmosdb_account.main.endpoint
    "COSMOS_DB_DATABASE_NAME"     = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=cosmos-db-database-name)"

    # FastAPI endpoint
    "FASTAPI_ENDPOINT" = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=fastapi-endpoint)"

    # Configuration
    "REDIS_TTL_HOURS" = tostring(var.redis_ttl_hours)
    "ENVIRONMENT"     = var.environment
    "PROJECT_NAME"    = var.project_name

    # Managed Identity configuration
    "AZURE_CLIENT_ID" = azurerm_user_assigned_identity.function_app.client_id
  }

  # Enable HTTPS only
  https_only = var.enable_https_only

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "function-app"
    Purpose   = "event-processing"
    Runtime   = "python"
  })

  lifecycle {
    ignore_changes = [
      app_settings["WEBSITE_RUN_FROM_PACKAGE"]
    ]
  }

  depends_on = [
    azurerm_key_vault_secret.redis_connection_string,
    azurerm_key_vault_secret.cosmos_db_connection_string,
    azurerm_key_vault_secret.fastapi_endpoint,
    azurerm_key_vault_access_policy.function_app
  ]
}

# Function App Deployment Slots (for blue-green deployments in production)
resource "azurerm_windows_function_app_slot" "staging" {
  count                      = var.environment == "prod" ? 1 : 0
  name                       = "staging"
  function_app_id            = azurerm_windows_function_app.main.id
  storage_account_name       = azurerm_storage_account.functions.name
  storage_account_access_key = azurerm_storage_account.functions.primary_access_key

  site_config {
    application_stack {
      powershell_core_version = "7.2"
    }
    always_on = !var.functions_consumption_plan
  }

  app_settings = azurerm_windows_function_app.main.app_settings

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "function-app-slot"
    Purpose   = "staging-deployment"
    Slot      = "staging"
  })
}

# Auto-scaling rules for Premium plan
resource "azurerm_monitor_autoscale_setting" "functions" {
  count               = var.enable_autoscaling && !var.functions_consumption_plan ? 1 : 0
  name                = "autoscale-${local.function_name}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  target_resource_id  = azurerm_service_plan.functions.id

  profile {
    name = "default"

    capacity {
      default = 1
      minimum = 1
      maximum = 10
    }

    # Scale out rule based on CPU
    rule {
      metric_trigger {
        metric_name        = "CpuPercentage"
        metric_resource_id = azurerm_service_plan.functions.id
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

    # Scale in rule based on CPU
    rule {
      metric_trigger {
        metric_name        = "CpuPercentage"
        metric_resource_id = azurerm_service_plan.functions.id
        time_grain         = "PT1M"
        statistic          = "Average"
        time_window        = "PT5M"
        time_aggregation   = "Average"
        operator           = "LessThan"
        threshold          = 30
      }

      scale_action {
        direction = "Decrease"
        type      = "ChangeCount"
        value     = "1"
        cooldown  = "PT5M"
      }
    }
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "autoscale-setting"
    Service   = "functions"
  })
}

# Storage account private endpoint
resource "azurerm_private_endpoint" "functions_storage" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "pe-${local.storage_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id           = azurerm_subnet.private_endpoints.id

  private_service_connection {
    name                           = "psc-${local.storage_name}"
    private_connection_resource_id = azurerm_storage_account.functions.id
    subresource_names              = ["blob"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "pdzg-storage"
    private_dns_zone_ids = [azurerm_private_dns_zone.storage[0].id]
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-endpoint"
    Service   = "storage"
  })
}

# Private DNS Zone for Storage
resource "azurerm_private_dns_zone" "storage" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "privatelink.blob.core.windows.net"
  resource_group_name = azurerm_resource_group.main.name

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-dns-zone"
    Service   = "storage"
  })
}

# Link Private DNS Zone to VNet
resource "azurerm_private_dns_zone_virtual_network_link" "storage" {
  count                 = var.enable_private_endpoints ? 1 : 0
  name                  = "pdzvnl-storage"
  resource_group_name   = azurerm_resource_group.main.name
  private_dns_zone_name = azurerm_private_dns_zone.storage[0].name
  virtual_network_id    = azurerm_virtual_network.main.id
  registration_enabled  = false

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-dns-zone-link"
    Service   = "storage"
  })
}

# Note: Function App backup configuration
# Azure Functions backup is automatically handled by the platform
# For additional backup strategies, consider:
# 1. Source code backup via Git repositories
# 2. Configuration backup via ARM templates
# 3. Data backup via storage account geo-replication
