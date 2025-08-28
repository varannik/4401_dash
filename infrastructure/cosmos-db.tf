# Azure Cosmos DB with Serverless tier and multiple collections
# Stores anomaly detection results, resolved/unresolved anomalies, and modified values

# Cosmos DB Account (Serverless for cost optimization)
resource "azurerm_cosmosdb_account" "main" {
  name                = local.cosmos_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = var.cosmosdb_offer_type
  kind                = "GlobalDocumentDB"

  # Serverless tier for variable workloads
  capabilities {
    name = var.cosmosdb_enable_serverless ? "EnableServerless" : "EnableTable"
  }

  consistency_policy {
    consistency_level       = var.cosmosdb_consistency_level
    max_interval_in_seconds = var.cosmosdb_consistency_level == "BoundedStaleness" ? 300 : null
    max_staleness_prefix    = var.cosmosdb_consistency_level == "BoundedStaleness" ? 100000 : null
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  # Additional geo-replication for production environments
  dynamic "geo_location" {
    for_each = var.enable_geo_redundancy ? [1] : []
    content {
      location          = var.location == "East US" ? "West US 2" : "East US"
      failover_priority = 1
    }
  }

  # Backup configuration
  backup {
    type                = var.cosmosdb_enable_backup ? "Periodic" : "Continuous"
    interval_in_minutes = var.cosmosdb_enable_backup ? 240 : null
    retention_in_hours  = var.cosmosdb_enable_backup ? (var.backup_retention_days * 24) : null
    storage_redundancy  = var.enable_geo_redundancy ? "Geo" : "Local"
  }

  # Network access configuration
  public_network_access_enabled     = true
  is_virtual_network_filter_enabled = var.enable_private_endpoints

  # Virtual network rules for secure access
  dynamic "virtual_network_rule" {
    for_each = var.enable_private_endpoints ? [
      {
        id                                   = azurerm_subnet.app_service.id
        ignore_missing_vnet_service_endpoint = false
      },
      {
        id                                   = azurerm_subnet.container_apps.id
        ignore_missing_vnet_service_endpoint = false
      },
      {
        id                                   = azurerm_subnet.functions.id
        ignore_missing_vnet_service_endpoint = false
      }
    ] : []

    content {
      id                                   = virtual_network_rule.value.id
      ignore_missing_vnet_service_endpoint = virtual_network_rule.value.ignore_missing_vnet_service_endpoint
    }
  }

  # IP firewall rules - Cosmos DB requires specific CIDR format with no spaces
  # Note: 0.0.0.0/0 allows all traffic, use specific IP ranges for security
  ip_range_filter = length(var.allowed_ip_ranges) > 0 && !contains(var.allowed_ip_ranges, "0.0.0.0/0") ? join(",", [for range in var.allowed_ip_ranges : trimspace(range)]) : ""

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "cosmos-db"
    Purpose   = "anomaly-results-storage"
    Tier      = var.cosmosdb_enable_serverless ? "serverless" : "provisioned"
    Backup    = var.cosmosdb_enable_backup ? "enabled" : "disabled"
  })

  lifecycle {
    prevent_destroy = true
  }
}

# Cosmos DB SQL Database
resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "anomaly-detection-db"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name

  # Serverless databases don't support throughput configuration
  dynamic "autoscale_settings" {
    for_each = var.cosmosdb_enable_serverless ? [] : [1]
    content {
      max_throughput = 1000
    }
  }
}

# Collection 1: Anomaly Results
# Main collection storing all anomaly detection results with heuristic, statistical, and ML analysis
resource "azurerm_cosmosdb_sql_container" "anomaly_results" {
  name                = "anomaly_results"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_paths = ["/timestamp"]

  # Serverless containers don't support throughput configuration
  dynamic "autoscale_settings" {
    for_each = var.cosmosdb_enable_serverless ? [] : [1]
    content {
      max_throughput = 1000
    }
  }

  # Indexing policy for efficient queries
  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    excluded_path {
      path = "/raw_data/*"
    }

    composite_index {
      index {
        path  = "/timestamp"
        order = "descending"
      }
      index {
        path  = "/final_status"
        order = "ascending"
      }
    }

    composite_index {
      index {
        path  = "/heuristic/method"
        order = "ascending"
      }
      index {
        path  = "/timestamp"
        order = "descending"
      }
    }
  }

  # TTL for automatic cleanup (optional, set to null for manual management)
  default_ttl = var.environment == "dev" ? 604800 : null # 7 days for dev environment

  # NOTE: Cosmos DB 'id' is automatically unique - no unique key constraint needed
  # If you need business logic uniqueness, use application-specific fields like:
  # unique_key {
  #   paths = ["/anomaly_id", "/timestamp"]
  # }
}

# Collection 2: Unresolved Anomalies
# Tracks anomalies that require human intervention
resource "azurerm_cosmosdb_sql_container" "unresolved_anomalies" {
  name                = "unresolved_anomalies"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_paths = ["/severity_level"]

  dynamic "autoscale_settings" {
    for_each = var.cosmosdb_enable_serverless ? [] : [1]
    content {
      max_throughput = 400
    }
  }

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    composite_index {
      index {
        path  = "/detected_at"
        order = "descending"
      }
      index {
        path  = "/severity_level"
        order = "ascending"
      }
    }

    composite_index {
      index {
        path  = "/assigned_to"
        order = "ascending"
      }
      index {
        path  = "/detected_at"
        order = "descending"
      }
    }
  }
}

# Collection 3: Resolved Anomalies
# Historical record of resolved anomalies with resolution details
resource "azurerm_cosmosdb_sql_container" "resolved_anomalies" {
  name                = "resolved_anomalies"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_paths = ["/resolved_by"]

  dynamic "autoscale_settings" {
    for_each = var.cosmosdb_enable_serverless ? [] : [1]
    content {
      max_throughput = 400
    }
  }

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    composite_index {
      index {
        path  = "/resolved_at"
        order = "descending"
      }
      index {
        path  = "/resolved_by"
        order = "ascending"
      }
    }
  }

  # Longer TTL for resolved anomalies (historical data)
  default_ttl = var.environment == "dev" ? 2592000 : null # 30 days for dev environment
}

# Collection 4: Modified Values
# Tracks manual modifications to sensor data with audit trail
resource "azurerm_cosmosdb_sql_container" "modified_values" {
  name                = "modified_values"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_paths = ["/modified_by"]

  dynamic "autoscale_settings" {
    for_each = var.cosmosdb_enable_serverless ? [] : [1]
    content {
      max_throughput = 400
    }
  }

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    composite_index {
      index {
        path  = "/modified_at"
        order = "descending"
      }
      index {
        path  = "/modified_by"
        order = "ascending"
      }
    }
  }

  # Audit trail - keep modifications for compliance
  default_ttl = null # No automatic cleanup for audit data
}

# Private endpoint for Cosmos DB (secure access from Azure services)
resource "azurerm_private_endpoint" "cosmos_db" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "pe-${local.cosmos_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id           = azurerm_subnet.private_endpoints.id

  private_service_connection {
    name                           = "psc-${local.cosmos_name}"
    private_connection_resource_id = azurerm_cosmosdb_account.main.id
    subresource_names              = ["Sql"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "pdzg-cosmos"
    private_dns_zone_ids = [azurerm_private_dns_zone.cosmos_db[0].id]
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-endpoint"
    Service   = "cosmos-db"
  })
}

# Private DNS Zone for Cosmos DB
resource "azurerm_private_dns_zone" "cosmos_db" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "privatelink.documents.azure.com"
  resource_group_name = azurerm_resource_group.main.name

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-dns-zone"
    Service   = "cosmos-db"
  })
}

# Link Private DNS Zone to VNet
resource "azurerm_private_dns_zone_virtual_network_link" "cosmos_db" {
  count                 = var.enable_private_endpoints ? 1 : 0
  name                  = "pdzvnl-cosmos"
  resource_group_name   = azurerm_resource_group.main.name
  private_dns_zone_name = azurerm_private_dns_zone.cosmos_db[0].name
  virtual_network_id    = azurerm_virtual_network.main.id
  registration_enabled  = false

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "private-dns-zone-link"
    Service   = "cosmos-db"
  })
}
