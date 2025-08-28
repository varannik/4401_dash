# Azure Security Configuration
# Managed identities, RBAC assignments, and security policies

# Managed Identity for Function App
resource "azurerm_user_assigned_identity" "function_app" {
  name                = "mi-${local.function_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "managed-identity"
    Service   = "function-app"
  })
}

# Managed Identity for App Service
resource "azurerm_user_assigned_identity" "app_service" {
  name                = "mi-${local.app_service_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "managed-identity"
    Service   = "app-service"
  })
}

# Managed Identity for Container App
resource "azurerm_user_assigned_identity" "container_app" {
  name                = "mi-${local.container_app_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "managed-identity"
    Service   = "container-app"
  })
}

# RBAC: Function App access to Redis
resource "azurerm_role_assignment" "function_app_redis_contributor" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_redis_cache.main.id
  role_definition_name = "Redis Cache Contributor"
  principal_id         = azurerm_user_assigned_identity.function_app.principal_id
}

# RBAC: Function App access to Cosmos DB
resource "azurerm_role_assignment" "function_app_cosmos_contributor" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_cosmosdb_account.main.id
  role_definition_name = "DocumentDB Account Contributor"
  principal_id         = azurerm_user_assigned_identity.function_app.principal_id
}

# RBAC: Function App access to Key Vault
resource "azurerm_role_assignment" "function_app_keyvault_secrets" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.function_app.principal_id
}

# RBAC: App Service access to Redis
resource "azurerm_role_assignment" "app_service_redis_contributor" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_redis_cache.main.id
  role_definition_name = "Redis Cache Contributor"
  principal_id         = azurerm_user_assigned_identity.app_service.principal_id
}

# RBAC: App Service access to Cosmos DB
resource "azurerm_role_assignment" "app_service_cosmos_reader" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_cosmosdb_account.main.id
  role_definition_name = "Cosmos DB Account Reader Role"
  principal_id         = azurerm_user_assigned_identity.app_service.principal_id
}

# RBAC: App Service access to Key Vault
resource "azurerm_role_assignment" "app_service_keyvault_secrets" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.app_service.principal_id
}

# RBAC: Container App access to OpenAI
resource "azurerm_role_assignment" "container_app_openai_user" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = azurerm_user_assigned_identity.container_app.principal_id
}

# RBAC: Container App access to Key Vault
resource "azurerm_role_assignment" "container_app_keyvault_secrets" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.container_app.principal_id
}

# RBAC: Container App access to Cosmos DB (for storing results)
resource "azurerm_role_assignment" "container_app_cosmos_contributor" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_cosmosdb_account.main.id
  role_definition_name = "DocumentDB Account Contributor"
  principal_id         = azurerm_user_assigned_identity.container_app.principal_id
}

# RBAC: Allow managed identities to access Application Insights
resource "azurerm_role_assignment" "function_app_monitoring_contributor" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_application_insights.main.id
  role_definition_name = "Monitoring Contributor"
  principal_id         = azurerm_user_assigned_identity.function_app.principal_id
}

resource "azurerm_role_assignment" "app_service_monitoring_contributor" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_application_insights.main.id
  role_definition_name = "Monitoring Contributor"
  principal_id         = azurerm_user_assigned_identity.app_service.principal_id
}

resource "azurerm_role_assignment" "container_app_monitoring_contributor" {
  count                = var.enable_rbac_assignments ? 1 : 0
  scope                = azurerm_application_insights.main.id
  role_definition_name = "Monitoring Contributor"
  principal_id         = azurerm_user_assigned_identity.container_app.principal_id
}

# Security Policy: Disable public blob access for storage account
resource "azurerm_storage_account_network_rules" "functions_storage" {
  storage_account_id = azurerm_storage_account.functions.id

  default_action             = "Deny"
  bypass                     = ["AzureServices"]
  virtual_network_subnet_ids = [azurerm_subnet.functions.id]
  ip_rules                   = [for range in var.allowed_ip_ranges : range if !can(regex("^[0-9.]+/32$", range))]
}

# Data source to find existing Network Watcher in the region
data "azurerm_network_watcher" "existing" {
  count               = var.create_network_watcher ? 0 : 1
  name                = "NetworkWatcher_${replace(lower(var.location), " ", "")}"
  resource_group_name = "NetworkWatcherRG"
}

# Network Watcher for security monitoring (optional - create only if needed)
resource "azurerm_network_watcher" "main" {
  count               = var.create_network_watcher ? 1 : 0
  name                = "nw-${local.naming_prefix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "network-watcher"
    Purpose   = "security-monitoring"
  })
}

# NOTE: Network Watcher locals are defined in main.tf

# Network Security Group Flow Logs
resource "azurerm_network_watcher_flow_log" "app_service" {
  count                = var.enable_diagnostic_logs ? 1 : 0
  network_watcher_name = local.network_watcher_name
  resource_group_name  = local.network_watcher_rg
  name                 = "flowlog-app-service"

  network_security_group_id = azurerm_network_security_group.app_service.id
  storage_account_id        = azurerm_storage_account.functions.id
  enabled                   = true

  retention_policy {
    enabled = true
    days    = 7
  }

  traffic_analytics {
    enabled               = true
    workspace_id          = azurerm_log_analytics_workspace.main.workspace_id
    workspace_region      = azurerm_log_analytics_workspace.main.location
    workspace_resource_id = azurerm_log_analytics_workspace.main.id
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "flow-log"
    NSG       = "app-service"
  })
}

# Security Center Contact (optional - configure with actual contact info)
# NOTE: Commented out because a default contact already exists in the subscription
# To manage the existing contact, import it first:
# terraform import azurerm_security_center_contact.main /subscriptions/8d3f078c-e1ef-46f9-98ac-eb2e8e50bb67/providers/Microsoft.Security/securityContacts/default1
#
# resource "azurerm_security_center_contact" "main" {
#   email = "security@example.com" # Update with actual security contact
#   phone = "+1-555-123-4567"      # Update with actual phone number
#
#   alert_notifications = true
#   alerts_to_admins    = true
# }

# NOTE: Key Vault access policy for current user is defined in key-vault.tf

# Resource Lock for Critical Resources (prevent accidental deletion)
resource "azurerm_management_lock" "cosmos_db" {
  count      = var.enable_management_locks ? 1 : 0
  name       = "lock-cosmos-db"
  scope      = azurerm_cosmosdb_account.main.id
  lock_level = "CanNotDelete"
  notes      = "Prevent accidental deletion of Cosmos DB account"
}

resource "azurerm_management_lock" "redis" {
  count      = var.enable_management_locks ? 1 : 0
  name       = "lock-redis"
  scope      = azurerm_redis_cache.main.id
  lock_level = "CanNotDelete"
  notes      = "Prevent accidental deletion of Redis cache"
}

resource "azurerm_management_lock" "key_vault" {
  count      = var.enable_management_locks ? 1 : 0
  name       = "lock-key-vault"
  scope      = azurerm_key_vault.main.id
  lock_level = "CanNotDelete"
  notes      = "Prevent accidental deletion of Key Vault"
}

# Note: Azure Policy Assignment for Security
# Policy assignments are managed through:
# 1. Azure Portal: Policy > Assignments
# 2. Azure CLI: az policy assignment create
# 3. ARM templates or Bicep
#
# The Terraform AzureRM provider doesn't support azurerm_policy_assignment
# 
# To assign HTTPS-only policy after deployment, use:
# az policy assignment create \
#   --name "require-https-${local.naming_prefix}" \
#   --scope "${azurerm_resource_group.main.id}" \
#   --policy "/providers/Microsoft.Authorization/policyDefinitions/a4af4a39-4135-47fb-b175-47fbdf85311d" \
#   --params '{"effect":{"value":"Audit"}}'

# Diagnostic settings for Key Vault
resource "azurerm_monitor_diagnostic_setting" "key_vault" {
  count                      = var.enable_diagnostic_logs ? 1 : 0
  name                       = "diag-${local.keyvault_name}"
  target_resource_id         = azurerm_key_vault.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "AuditEvent"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}
