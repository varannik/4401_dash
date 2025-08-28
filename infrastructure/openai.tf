# Azure OpenAI Service Configuration
# GPT-4o-mini deployment for LLM-based anomaly analysis

# Azure OpenAI Service Account
# NOTE: If soft-deleted resource exists, purge it first using:
# az cognitiveservices account purge --name openai-anomaly-detection-prod-xxx --resource-group rg-anomaly-detection-prod-xxx --location "UAE North"
resource "azurerm_cognitive_account" "openai" {
  name                = local.openai_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "OpenAI"
  sku_name            = var.openai_sku_name

  # Custom subdomain is required for network ACLs
  custom_subdomain_name = local.openai_name

  # Network access configuration
  public_network_access_enabled               = true
  custom_question_answering_search_service_id = null

  # Network ACLs for secure access (disabled for external access)
  # Note: Network ACLs are disabled to allow external access since Azure OpenAI
  # doesn't support /32 CIDR ranges in ip_rules
  # dynamic "network_acls" {
  #   for_each = contains(var.allowed_ip_ranges, "0.0.0.0/0") ? [] : [1]
  #   content {
  #     default_action = "Deny"
  #
  #     # Allow access from specific IP ranges (excluding 0.0.0.0/0 and /32 ranges)
  #     ip_rules = [for range in var.allowed_ip_ranges : range if range != "0.0.0.0/0" && !can(regex("^[0-9.]+/32$", range))]
  #
  #     # Allow access from VNet subnets
  #     virtual_network_rules {
  #       subnet_id                            = azurerm_subnet.container_apps.id
  #       ignore_missing_vnet_service_endpoint = false
  #     }
  #
  #     virtual_network_rules {
  #       subnet_id                            = azurerm_subnet.functions.id
  #       ignore_missing_vnet_service_endpoint = false
  #     }
  #   }
  # }

  # Enable local authentication alongside managed identity
  local_auth_enabled = true

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "cognitive-services"
    Service   = "openai"
    Model     = "gpt-4o-mini"
    Purpose   = "anomaly-analysis"
  })

  lifecycle {
    prevent_destroy = true
  }
}

# GPT-3.5 Turbo Model Deployment (UAE North compatible)
resource "azurerm_cognitive_deployment" "gpt4o_mini" {
  name                 = var.openai_model_deployment_name
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = var.openai_model_name
    version = var.openai_model_version
  }

  scale {
    type     = "Manual"
    capacity = var.openai_capacity
  }

  rai_policy_name = "Microsoft.Default"

  # Ensure deployment is created after the cognitive account
  depends_on = [azurerm_cognitive_account.openai]
}

# Private endpoint for OpenAI (if private endpoints are enabled)
resource "azurerm_private_endpoint" "openai" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "pe-${local.openai_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id           = azurerm_subnet.private_endpoints.id

  private_service_connection {
    name                           = "psc-${local.openai_name}"
    private_connection_resource_id = azurerm_cognitive_account.openai.id
    subresource_names              = ["account"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "pdzg-openai"
    private_dns_zone_ids = [azurerm_private_dns_zone.openai[0].id]
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-endpoint"
    Service   = "openai"
  })
}

# Private DNS Zone for OpenAI
resource "azurerm_private_dns_zone" "openai" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "privatelink.openai.azure.com"
  resource_group_name = azurerm_resource_group.main.name

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-dns-zone"
    Service   = "openai"
  })
}

# Link Private DNS Zone to VNet
resource "azurerm_private_dns_zone_virtual_network_link" "openai" {
  count                 = var.enable_private_endpoints ? 1 : 0
  name                  = "pdzvnl-openai"
  resource_group_name   = azurerm_resource_group.main.name
  private_dns_zone_name = azurerm_private_dns_zone.openai[0].name
  virtual_network_id    = azurerm_virtual_network.main.id
  registration_enabled  = false

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-dns-zone-link"
    Service   = "openai"
  })
}

# Diagnostic settings for OpenAI
resource "azurerm_monitor_diagnostic_setting" "openai" {
  count                      = var.enable_diagnostic_logs ? 1 : 0
  name                       = "diag-${local.openai_name}"
  target_resource_id         = azurerm_cognitive_account.openai.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "Audit"
  }

  enabled_log {
    category = "RequestResponse"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# Alert for OpenAI quota usage
resource "azurerm_monitor_metric_alert" "openai_quota" {
  name                = "alert-openai-quota-${local.naming_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_cognitive_account.openai.id]
  description         = "Alert when OpenAI quota usage is high"
  enabled             = true
  frequency           = "PT5M"
  window_size         = "PT15M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.CognitiveServices/accounts"
    metric_name      = "TokenTransaction"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = var.openai_capacity * 1000 * 0.8 # 80% of capacity
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "metric-alert"
    Service   = "openai"
  })
}

# Content filter for responsible AI
resource "azurerm_cognitive_account_customer_managed_key" "openai" {
  count                = var.environment == "prod" && var.enable_rbac_assignments ? 1 : 0
  cognitive_account_id = azurerm_cognitive_account.openai.id
  key_vault_key_id     = azurerm_key_vault_key.openai[0].id
}

# Key Vault Key for OpenAI encryption (production only and when key permissions are available)
resource "azurerm_key_vault_key" "openai" {
  count        = var.environment == "prod" && var.enable_rbac_assignments ? 1 : 0
  name         = "openai-encryption-key"
  key_vault_id = azurerm_key_vault.main.id
  key_type     = "RSA"
  key_size     = 2048

  key_opts = [
    "decrypt",
    "encrypt",
    "sign",
    "unwrapKey",
    "verify",
    "wrapKey",
  ]

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "encryption-key"
    Service   = "openai"
  })

  depends_on = [azurerm_key_vault_access_policy.current_user]
}
