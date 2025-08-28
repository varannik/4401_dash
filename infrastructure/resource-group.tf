# Azure Resource Group for Event-Driven Anomaly Detection Architecture
# Main resource group that will contain all the infrastructure components

resource "azurerm_resource_group" "main" {
  name     = local.resource_group_name
  location = var.location

  tags = merge(local.common_tags, var.additional_tags, {
    Purpose     = "event-driven-anomaly-detection"
    Component   = "resource-group"
    Description = "Main resource group for anomaly detection system"
  })

  lifecycle {
    prevent_destroy = true
  }
}
