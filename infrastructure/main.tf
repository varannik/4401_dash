# Terraform Azure Event-Driven Anomaly Detection Architecture
# Provider configuration for Azure Resource Manager

terraform {
  required_version = ">= 1.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  # Remote state configuration - uncomment and configure for production
  # backend "azurerm" {
  #   resource_group_name  = "rg-terraform-state"
  #   storage_account_name = "terraformstate"
  #   container_name       = "tfstate"
  #   key                  = "anomaly-detection.tfstate"
  # }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {
    # Enable enhanced security features
    key_vault {
      purge_soft_delete_on_destroy = false
    }

    cognitive_account {
      purge_soft_delete_on_destroy = false
    }
  }
}

# Random string for unique naming
resource "random_string" "unique" {
  length  = 6
  special = false
  upper   = false
}

# Data source for current client configuration
data "azurerm_client_config" "current" {}

# Local values for consistent naming and tagging
locals {
  # Naming convention: <service>-<project>-<environment>-<unique>
  naming_prefix = "${var.project_name}-${var.environment}"
  unique_suffix = random_string.unique.result

  # Common tags applied to all resources
  common_tags = {
    Environment  = var.environment
    Project      = var.project_name
    CreatedBy    = "Terraform"
    Architecture = "event-driven-anomaly-detection"
    CostCenter   = "engineering"
    Backup       = "required"
  }

  # Resource naming
  resource_group_name = "rg-${local.naming_prefix}-${local.unique_suffix}"
  redis_name          = "redis-${local.naming_prefix}-${local.unique_suffix}"
  cosmos_name         = "cosmos-${local.naming_prefix}-${local.unique_suffix}"
  function_name       = "func-${local.naming_prefix}-${local.unique_suffix}"
  container_app_name  = "ca-${local.naming_prefix}-${local.unique_suffix}"
  app_service_name    = "app-${local.naming_prefix}-${local.unique_suffix}"
  openai_name         = "openai-${local.naming_prefix}-${local.unique_suffix}"
  keyvault_name       = "kv${substr(replace(var.project_name, "-", ""), 0, 13)}${substr(var.environment, 0, 1)}${local.unique_suffix}"
  insights_name       = "ai-${local.naming_prefix}-${local.unique_suffix}"
  vnet_name           = "vnet-${local.naming_prefix}-${local.unique_suffix}"
  storage_name        = "st${substr(replace(var.project_name, "-", ""), 0, 12)}${substr(var.environment, 0, 1)}${local.unique_suffix}"

  # Network Watcher configuration
  network_watcher_name = var.create_network_watcher ? azurerm_network_watcher.main[0].name : data.azurerm_network_watcher.existing[0].name
  network_watcher_rg   = var.create_network_watcher ? azurerm_resource_group.main.name : data.azurerm_network_watcher.existing[0].resource_group_name
}
