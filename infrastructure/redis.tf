# Azure Cache for Redis - Premium tier with dual access configuration
# Supports both Function Apps (private endpoint) and Next.js App Service (VNet integration)

# Redis Cache Instance
resource "azurerm_redis_cache" "main" {
  name                = local.redis_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  # Standard tier for better regional availability in UAE North
  capacity = var.redis_capacity
  family   = var.redis_family
  sku_name = var.redis_sku_name

  # Enable persistence for Premium tier
  non_ssl_port_enabled = false
  minimum_tls_version  = "1.2"

  # Redis configuration for 24-hour TTL
  redis_configuration {
    # Enable persistence (Premium tier only)
    rdb_backup_enabled            = var.redis_enable_persistence && var.redis_sku_name == "Premium"
    rdb_backup_frequency          = var.redis_enable_persistence && var.redis_sku_name == "Premium" ? 60 : null
    rdb_backup_max_snapshot_count = var.redis_enable_persistence && var.redis_sku_name == "Premium" ? 1 : null
    rdb_storage_connection_string = var.redis_enable_persistence && var.redis_sku_name == "Premium" ? azurerm_storage_account.functions.primary_connection_string : null

    # Memory management
    maxmemory_reserved = 50
    maxmemory_delta    = 50
    maxmemory_policy   = "allkeys-lru"

    # Enable keyspace notifications for Function triggers
    notify_keyspace_events = "Ex"

    # Authentication
    authentication_enabled = true
  }

  # Public network access for Next.js App Service
  public_network_access_enabled = true

  # NOTE: subnet_id (VNet integration) is only available for Premium SKU
  # Standard SKU relies on public network access with firewall rules

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "redis-cache"
    Purpose   = "real-time-data-storage"
    TTL       = "${var.redis_ttl_hours}h"
    Access    = "dual-pattern"
  })

  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      redis_configuration[0].rdb_storage_connection_string,
      public_network_access_enabled,
      redis_configuration[0].authentication_enabled
    ]
  }
}

# Private endpoint for Azure Functions access to Redis
resource "azurerm_private_endpoint" "redis" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "pe-${local.redis_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id           = azurerm_subnet.private_endpoints.id

  private_service_connection {
    name                           = "psc-${local.redis_name}"
    private_connection_resource_id = azurerm_redis_cache.main.id
    subresource_names              = ["redisCache"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "pdzg-redis"
    private_dns_zone_ids = [azurerm_private_dns_zone.redis[0].id]
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-endpoint"
    Service   = "redis"
  })
}

# Private DNS Zone for Redis
resource "azurerm_private_dns_zone" "redis" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "privatelink.redis.cache.windows.net"
  resource_group_name = azurerm_resource_group.main.name

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-dns-zone"
    Service   = "redis"
  })
}

# Link Private DNS Zone to VNet
resource "azurerm_private_dns_zone_virtual_network_link" "redis" {
  count                 = var.enable_private_endpoints ? 1 : 0
  name                  = "pdzvnl-redis"
  resource_group_name   = azurerm_resource_group.main.name
  private_dns_zone_name = azurerm_private_dns_zone.redis[0].name
  virtual_network_id    = azurerm_virtual_network.main.id
  registration_enabled  = false

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-dns-zone-link"
    Service   = "redis"
  })
}

# Firewall rule to allow access from App Service subnet
resource "azurerm_redis_firewall_rule" "app_service" {
  name                = "app_service_subnet"
  redis_cache_name    = azurerm_redis_cache.main.name
  resource_group_name = azurerm_resource_group.main.name
  start_ip            = cidrhost(var.subnet_app_service_address_prefix, 0)
  end_ip              = cidrhost(var.subnet_app_service_address_prefix, -1)
}

# Firewall rule to allow access from Container Apps subnet
resource "azurerm_redis_firewall_rule" "container_apps" {
  name                = "container_apps_subnet"
  redis_cache_name    = azurerm_redis_cache.main.name
  resource_group_name = azurerm_resource_group.main.name
  start_ip            = cidrhost(var.subnet_container_apps_address_prefix, 0)
  end_ip              = cidrhost(var.subnet_container_apps_address_prefix, -1)
}

# Firewall rule to allow access from Functions subnet
resource "azurerm_redis_firewall_rule" "functions" {
  name                = "functions_subnet"
  redis_cache_name    = azurerm_redis_cache.main.name
  resource_group_name = azurerm_resource_group.main.name
  start_ip            = cidrhost(var.subnet_functions_address_prefix, 0)
  end_ip              = cidrhost(var.subnet_functions_address_prefix, -1)
}

# Additional firewall rules for allowed IP ranges
resource "azurerm_redis_firewall_rule" "allowed_ips" {
  count               = length(var.allowed_ip_ranges)
  name                = "allowed_range_${count.index}"
  redis_cache_name    = azurerm_redis_cache.main.name
  resource_group_name = azurerm_resource_group.main.name
  start_ip            = cidrhost(var.allowed_ip_ranges[count.index], 0)
  end_ip              = cidrhost(var.allowed_ip_ranges[count.index], -1)
}
