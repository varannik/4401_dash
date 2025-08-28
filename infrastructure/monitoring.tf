# Azure Monitoring and Observability Configuration
# Application Insights, Log Analytics, and monitoring for the anomaly detection system

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-${local.naming_prefix}-${local.unique_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = var.log_retention_days

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "log-analytics"
    Purpose   = "centralized-logging"
  })
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = local.insights_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "application-insights"
    Purpose   = "application-monitoring"
  })
}

# Diagnostic Settings for Redis Cache
resource "azurerm_monitor_diagnostic_setting" "redis" {
  count                      = var.enable_diagnostic_logs ? 1 : 0
  name                       = "diag-${local.redis_name}"
  target_resource_id         = azurerm_redis_cache.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "ConnectedClientList"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# Diagnostic Settings for Cosmos DB
resource "azurerm_monitor_diagnostic_setting" "cosmos_db" {
  count                      = var.enable_diagnostic_logs ? 1 : 0
  name                       = "diag-${local.cosmos_name}"
  target_resource_id         = azurerm_cosmosdb_account.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "DataPlaneRequests"
  }

  enabled_log {
    category = "QueryRuntimeStatistics"
  }

  enabled_log {
    category = "PartitionKeyStatistics"
  }

  enabled_log {
    category = "PartitionKeyRUConsumption"
  }

  metric {
    category = "Requests"
    enabled  = true
  }
}

# Diagnostic Settings for Function App
resource "azurerm_monitor_diagnostic_setting" "function_app" {
  count                      = var.enable_diagnostic_logs ? 1 : 0
  name                       = "diag-${local.function_name}"
  target_resource_id         = azurerm_windows_function_app.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "FunctionAppLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# Diagnostic Settings for App Service
resource "azurerm_monitor_diagnostic_setting" "app_service" {
  count                      = var.enable_diagnostic_logs ? 1 : 0
  name                       = "diag-${local.app_service_name}"
  target_resource_id         = azurerm_linux_web_app.dashboard.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "AppServiceHTTPLogs"
  }

  enabled_log {
    category = "AppServiceConsoleLogs"
  }

  enabled_log {
    category = "AppServiceAppLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

# Action Group for Alerts
resource "azurerm_monitor_action_group" "main" {
  name                = "ag-${local.naming_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = "anomalyalert"

  # Email notification (configure with actual email)
  email_receiver {
    name          = "admin-email"
    email_address = "admin@example.com" # Update with actual email
  }

  # Webhook notification (optional)
  webhook_receiver {
    name        = "webhook-alert"
    service_uri = "https://example.com/webhook" # Update with actual webhook URL
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "action-group"
    Purpose   = "alerting"
  })
}

# Alert Rule: High Redis Memory Usage
resource "azurerm_monitor_metric_alert" "redis_memory" {
  name                = "alert-redis-memory-${local.naming_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_redis_cache.main.id]
  description         = "Alert when Redis memory usage is high"
  enabled             = true
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.Cache/Redis"
    metric_name      = "usedmemorypercentage"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "metric-alert"
    Service   = "redis"
  })
}

# Alert Rule: High Cosmos DB RU Consumption
resource "azurerm_monitor_metric_alert" "cosmos_db_ru" {
  count               = var.cosmosdb_enable_serverless ? 0 : 1
  name                = "alert-cosmos-ru-${local.naming_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_cosmosdb_account.main.id]
  description         = "Alert when Cosmos DB RU consumption is high"
  enabled             = true
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.DocumentDB/databaseAccounts"
    metric_name      = "TotalRequestUnits"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = 1000
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "metric-alert"
    Service   = "cosmos-db"
  })
}

# Alert Rule: Function App Errors
resource "azurerm_monitor_metric_alert" "function_errors" {
  name                = "alert-function-errors-${local.naming_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_windows_function_app.main.id]
  description         = "Alert when Function App has high error rate"
  enabled             = true
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = 1

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "Http5xx"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = 5
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "metric-alert"
    Service   = "function-app"
  })
}

# Alert Rule: App Service Response Time
resource "azurerm_monitor_metric_alert" "app_service_response_time" {
  name                = "alert-app-response-time-${local.naming_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_linux_web_app.dashboard.id]
  description         = "Alert when App Service response time is high"
  enabled             = true
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "HttpResponseTime"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 30 # 30 seconds
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "metric-alert"
    Service   = "app-service"
  })
}

# Alert Rule: Container App CPU Usage
resource "azurerm_monitor_metric_alert" "container_app_cpu" {
  name                = "alert-container-cpu-${local.naming_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_container_app.fastapi.id]
  description         = "Alert when Container App CPU usage is high"
  enabled             = true
  frequency           = "PT1M"
  window_size         = "PT5M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.App/containerApps"
    metric_name      = "UsageNanoCores"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 800000000 # 80% of 1 core in nanocores
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "metric-alert"
    Service   = "container-app"
  })
}

# Custom Dashboard for Monitoring
resource "azurerm_portal_dashboard" "main" {
  name                = "dashboard-${local.naming_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  dashboard_properties = jsonencode({
    lenses = {
      "0" = {
        order = 0
        parts = {
          "0" = {
            position = {
              x       = 0
              y       = 0
              rowSpan = 4
              colSpan = 6
            }
            metadata = {
              inputs = [
                {
                  name       = "resourceTypeMode"
                  isOptional = true
                }
              ]
              type = "Extension/HubsExtension/PartType/MonitorChartPart"
              settings = {
                content = {
                  options = {
                    chart = {
                      metrics = [
                        {
                          resourceMetadata = {
                            id = azurerm_redis_cache.main.id
                          }
                          name            = "usedmemorypercentage"
                          aggregationType = 4
                          namespace       = "Microsoft.Cache/Redis"
                          metricVisualization = {
                            displayName = "Used Memory Percentage"
                          }
                        }
                      ]
                      title     = "Redis Memory Usage"
                      titleKind = 1
                      visualization = {
                        chartType = 2
                        legendVisualization = {
                          isVisible    = true
                          position     = 2
                          hideSubtitle = false
                        }
                        axisVisualization = {
                          x = {
                            isVisible = true
                            axisType  = 2
                          }
                          y = {
                            isVisible = true
                            axisType  = 1
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    metadata = {
      model = {
        timeRange = {
          value = {
            relative = {
              duration = 24
              timeUnit = 1
            }
          }
          type = "MsPortalFx.Composition.Configuration.ValueTypes.TimeRange"
        }
        filterLocale = {
          value = "en-us"
        }
        filters = {
          value = {
            MsPortalFx_TimeRange = {
              model = {
                format      = "utc"
                granularity = "auto"
                relative    = "24h"
              }
              displayCache = {
                name  = "UTC Time"
                value = "Past 24 hours"
              }
              filteredPartIds = []
            }
          }
        }
      }
    }
  })

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "dashboard"
    Purpose   = "monitoring"
  })
}
