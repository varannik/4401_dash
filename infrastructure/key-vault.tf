# Azure Key Vault Configuration
# Centralized secrets management for all connection strings and API keys

# Key Vault
resource "azurerm_key_vault" "main" {
  name                = local.keyvault_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  # Security configuration
  soft_delete_retention_days      = 7
  purge_protection_enabled        = var.environment == "prod" ? true : false
  enabled_for_disk_encryption     = true
  enabled_for_deployment          = true
  enabled_for_template_deployment = true

  # Network access configuration
  public_network_access_enabled = true
  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"

    # Allow access from specific IP ranges
    ip_rules = var.allowed_ip_ranges

    # Allow access from VNet subnets
    virtual_network_subnet_ids = [
      azurerm_subnet.app_service.id,
      azurerm_subnet.container_apps.id,
      azurerm_subnet.functions.id
    ]
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "key-vault"
    Purpose   = "secrets-management"
  })

  lifecycle {
    prevent_destroy = true
  }
}

# Access policies for managed identities
resource "azurerm_key_vault_access_policy" "function_app" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_user_assigned_identity.function_app.principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

resource "azurerm_key_vault_access_policy" "app_service" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_user_assigned_identity.app_service.principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

resource "azurerm_key_vault_access_policy" "container_app" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_user_assigned_identity.container_app.principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

# Access policy for current user/service principal (Terraform deployment)
resource "azurerm_key_vault_access_policy" "current_user" {
  count        = var.create_current_user_access_policy ? 1 : 0
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  secret_permissions = [
    "Get",
    "List",
    "Set",
    "Delete",
    "Recover",
    "Backup",
    "Restore",
    "Purge"
  ]

  key_permissions = [
    "Get",
    "List",
    "Create",
    "Delete",
    "Update",
    "Recover",
    "Backup",
    "Restore",
    "Purge",
    "Decrypt",
    "Encrypt",
    "Sign",
    "Verify",
    "WrapKey",
    "UnwrapKey",
    "GetRotationPolicy",
    "SetRotationPolicy"
  ]

  certificate_permissions = [
    "Get",
    "List",
    "Create",
    "Delete",
    "Update",
    "Recover",
    "Backup",
    "Restore",
    "Purge"
  ]
}

# Store Redis connection string
resource "azurerm_key_vault_secret" "redis_connection_string" {
  name         = "redis-connection-string"
  value        = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:${azurerm_redis_cache.main.ssl_port}/0"
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "redis"
  })

  depends_on = [azurerm_key_vault.main]
}

# Store Redis primary access key
resource "azurerm_key_vault_secret" "redis_access_key" {
  name         = "redis-access-key"
  value        = azurerm_redis_cache.main.primary_access_key
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "redis"
  })

  depends_on = [azurerm_key_vault.main]
}

# Store Cosmos DB connection string
resource "azurerm_key_vault_secret" "cosmos_db_connection_string" {
  name         = "cosmos-db-connection-string"
  value        = "AccountEndpoint=${azurerm_cosmosdb_account.main.endpoint};AccountKey=${azurerm_cosmosdb_account.main.primary_key};"
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "cosmos-db"
  })

  depends_on = [azurerm_key_vault.main]
}

# Store Cosmos DB primary key
resource "azurerm_key_vault_secret" "cosmos_db_primary_key" {
  name         = "cosmos-db-primary-key"
  value        = azurerm_cosmosdb_account.main.primary_key
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "cosmos-db"
  })

  depends_on = [azurerm_key_vault.main]
}

# Store OpenAI API key
resource "azurerm_key_vault_secret" "openai_api_key" {
  name         = "openai-api-key"
  value        = azurerm_cognitive_account.openai.primary_access_key
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "openai"
  })

  depends_on = [azurerm_key_vault.main]
}

# Store Application Insights connection string
resource "azurerm_key_vault_secret" "application_insights_connection_string" {
  name         = "application-insights-connection-string"
  value        = azurerm_application_insights.main.connection_string
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "application-insights"
  })

  depends_on = [azurerm_key_vault.main]
}

# Store Application Insights instrumentation key
resource "azurerm_key_vault_secret" "application_insights_instrumentation_key" {
  name         = "application-insights-instrumentation-key"
  value        = azurerm_application_insights.main.instrumentation_key
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "application-insights"
  })

  depends_on = [azurerm_key_vault.main]
}

# Store Functions storage account connection string
resource "azurerm_key_vault_secret" "functions_storage_connection_string" {
  name         = "functions-storage-connection-string"
  value        = azurerm_storage_account.functions.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "functions-storage"
  })

  depends_on = [azurerm_key_vault.main]
}

# Store FastAPI endpoint URL
resource "azurerm_key_vault_secret" "fastapi_endpoint" {
  name         = "fastapi-endpoint"
  value        = "https://${azurerm_container_app.fastapi.latest_revision_fqdn}"
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "fastapi"
  })

  depends_on = [azurerm_key_vault.main]
}

# Store Database names and configuration
resource "azurerm_key_vault_secret" "cosmos_db_database_name" {
  name         = "cosmos-db-database-name"
  value        = azurerm_cosmosdb_sql_database.main.name
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "cosmos-db"
  })

  depends_on = [azurerm_key_vault.main]
}

# Store OpenAI configuration
resource "azurerm_key_vault_secret" "openai_endpoint" {
  name         = "openai-endpoint"
  value        = azurerm_cognitive_account.openai.endpoint
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "openai"
  })

  depends_on = [azurerm_key_vault.main]
}

resource "azurerm_key_vault_secret" "openai_deployment_name" {
  name         = "openai-deployment-name"
  value        = azurerm_cognitive_deployment.gpt4o_mini.name
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "openai"
  })

  depends_on = [azurerm_key_vault.main]
}

# Store Redis configuration
resource "azurerm_key_vault_secret" "redis_hostname" {
  name         = "redis-hostname"
  value        = azurerm_redis_cache.main.hostname
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "redis"
  })

  depends_on = [azurerm_key_vault.main]
}

resource "azurerm_key_vault_secret" "redis_port" {
  name         = "redis-port"
  value        = tostring(azurerm_redis_cache.main.ssl_port)
  key_vault_id = azurerm_key_vault.main.id

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "secret"
    Service   = "redis"
  })

  depends_on = [azurerm_key_vault.main]
}

# Private endpoint for Key Vault
resource "azurerm_private_endpoint" "key_vault" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "pe-${local.keyvault_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id           = azurerm_subnet.private_endpoints.id

  private_service_connection {
    name                           = "psc-${local.keyvault_name}"
    private_connection_resource_id = azurerm_key_vault.main.id
    subresource_names              = ["vault"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "pdzg-keyvault"
    private_dns_zone_ids = [azurerm_private_dns_zone.key_vault[0].id]
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-endpoint"
    Service   = "key-vault"
  })
}

# Private DNS Zone for Key Vault
resource "azurerm_private_dns_zone" "key_vault" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "privatelink.vaultcore.azure.net"
  resource_group_name = azurerm_resource_group.main.name

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-dns-zone"
    Service   = "key-vault"
  })
}

# Link Private DNS Zone to VNet
resource "azurerm_private_dns_zone_virtual_network_link" "key_vault" {
  count                 = var.enable_private_endpoints ? 1 : 0
  name                  = "pdzvnl-keyvault"
  resource_group_name   = azurerm_resource_group.main.name
  private_dns_zone_name = azurerm_private_dns_zone.key_vault[0].name
  virtual_network_id    = azurerm_virtual_network.main.id
  registration_enabled  = false

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-dns-zone-link"
    Service   = "key-vault"
  })
}
