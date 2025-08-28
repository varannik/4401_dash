# Terraform Variables for Azure Event-Driven Anomaly Detection Architecture
# All variables with descriptions, types, and default values

# Location and Environment Configuration
variable "location" {
  description = "The Azure region where resources will be deployed"
  type        = string
  default     = "UAE North"

  validation {
    condition = contains([
      "East US", "East US 2", "West US", "West US 2", "West US 3",
      "Central US", "North Central US", "South Central US",
      "West Central US", "Canada Central", "Canada East",
      "North Europe", "West Europe", "UK South", "UK West",
      "Germany West Central", "France Central", "Switzerland North",
      "Norway East", "Sweden Central", "UAE North", "UAE Central"
    ], var.location)
    error_message = "Location must be a valid Azure region."
  }
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  description = "Name of the project for resource naming"
  type        = string
  default     = "anomaly-detection"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

# Redis Configuration
variable "redis_sku_name" {
  description = "The SKU of Redis to use (Basic, Standard, Premium)"
  type        = string
  default     = "Standard" # Standard has better regional availability than Premium

  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.redis_sku_name)
    error_message = "Redis SKU must be Basic, Standard, or Premium."
  }
}

variable "redis_family" {
  description = "The SKU family to use (C for Basic/Standard, P for Premium)"
  type        = string
  default     = "C" # C family for Standard SKU

  validation {
    condition     = contains(["C", "P"], var.redis_family)
    error_message = "Redis family must be C (Basic/Standard) or P (Premium)."
  }
}

variable "redis_capacity" {
  description = "The size of the Redis cache (0-6 for Basic/Standard, 1-5 for Premium)"
  type        = number
  default     = 2 # C2 (2.5GB) - good balance for UAE North availability

  validation {
    condition     = var.redis_capacity >= 0 && var.redis_capacity <= 6
    error_message = "Redis capacity must be between 0 and 6."
  }
}

variable "redis_enable_persistence" {
  description = "Enable Redis data persistence (only available for Premium SKU)"
  type        = bool
  default     = true
}

variable "redis_ttl_hours" {
  description = "TTL for Redis data in hours"
  type        = number
  default     = 24

  validation {
    condition     = var.redis_ttl_hours > 0 && var.redis_ttl_hours <= 168
    error_message = "Redis TTL must be between 1 and 168 hours (1 week)."
  }
}

# Cosmos DB Configuration
variable "cosmosdb_offer_type" {
  description = "The performance tier for Cosmos DB"
  type        = string
  default     = "Standard"

  validation {
    condition     = contains(["Standard"], var.cosmosdb_offer_type)
    error_message = "CosmosDB offer type must be Standard."
  }
}

variable "cosmosdb_consistency_level" {
  description = "The consistency level for Cosmos DB"
  type        = string
  default     = "Session"

  validation {
    condition = contains([
      "BoundedStaleness", "Eventual", "Session", "Strong", "ConsistentPrefix"
    ], var.cosmosdb_consistency_level)
    error_message = "CosmosDB consistency level must be valid."
  }
}

variable "cosmosdb_enable_serverless" {
  description = "Enable serverless mode for Cosmos DB (recommended for variable workloads)"
  type        = bool
  default     = true
}

variable "cosmosdb_enable_backup" {
  description = "Enable point-in-time backup for Cosmos DB"
  type        = bool
  default     = true
}

# App Service Configuration
variable "app_service_sku_tier" {
  description = "The pricing tier for App Service Plan"
  type        = string
  default     = "Basic"

  validation {
    condition     = contains(["Free", "Shared", "Basic", "Standard", "Premium", "PremiumV2", "PremiumV3"], var.app_service_sku_tier)
    error_message = "App Service SKU tier must be valid."
  }
}

variable "app_service_sku_size" {
  description = "The instance size for App Service Plan"
  type        = string
  default     = "B1"

  validation {
    condition     = can(regex("^(F1|D1|B[1-3]|S[1-3]|P[1-3]V?[2-3]?)$", var.app_service_sku_size))
    error_message = "App Service SKU size must be valid (e.g., B1, S1, P1V2)."
  }
}

variable "app_service_enable_vnet_integration" {
  description = "Enable VNet integration for App Service"
  type        = bool
  default     = true
}

# Azure Functions Configuration
variable "functions_storage_account_type" {
  description = "Storage account replication type for Functions"
  type        = string
  default     = "LRS"

  validation {
    condition     = contains(["LRS", "GRS", "RAGRS", "ZRS"], var.functions_storage_account_type)
    error_message = "Storage account type must be LRS, GRS, RAGRS, or ZRS."
  }
}

variable "functions_consumption_plan" {
  description = "Use consumption plan for Azure Functions (recommended for cost optimization)"
  type        = bool
  default     = true
}

# Container Apps Configuration
variable "container_apps_cpu" {
  description = "CPU allocation for Container Apps (0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0)"
  type        = number
  default     = 0.5

  validation {
    condition     = contains([0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0], var.container_apps_cpu)
    error_message = "Container Apps CPU must be one of the allowed values."
  }
}

variable "container_apps_memory" {
  description = "Memory allocation for Container Apps (0.5Gi, 1Gi, 1.5Gi, 2Gi, 3Gi, 4Gi)"
  type        = string
  default     = "1Gi"

  validation {
    condition     = contains(["0.5Gi", "1Gi", "1.5Gi", "2Gi", "3Gi", "4Gi"], var.container_apps_memory)
    error_message = "Container Apps memory must be one of the allowed values."
  }
}

variable "container_apps_min_replicas" {
  description = "Minimum number of replicas for Container Apps"
  type        = number
  default     = 1

  validation {
    condition     = var.container_apps_min_replicas >= 0 && var.container_apps_min_replicas <= 30
    error_message = "Container Apps min replicas must be between 0 and 30."
  }
}

variable "container_apps_max_replicas" {
  description = "Maximum number of replicas for Container Apps"
  type        = number
  default     = 10

  validation {
    condition     = var.container_apps_max_replicas >= 1 && var.container_apps_max_replicas <= 30
    error_message = "Container Apps max replicas must be between 1 and 30."
  }
}

# Azure OpenAI Configuration
variable "openai_model_deployment_name" {
  description = "The deployment name for OpenAI model"
  type        = string
  default     = "gpt-4o-mini"
}

variable "openai_model_name" {
  description = "The OpenAI model name"
  type        = string
  default     = "gpt-4o-mini"
}

variable "openai_model_version" {
  description = "The OpenAI model version"
  type        = string
  default     = "2024-07-18"
}

variable "openai_sku_name" {
  description = "The SKU name for Azure OpenAI"
  type        = string
  default     = "S0"

  validation {
    condition = contains([
      "F0", "F1", "S0", "S", "S1", "S2", "S3", "S4", "S5", "S6",
      "P0", "P1", "P2", "E0", "DC0"
    ], var.openai_sku_name)
    error_message = "OpenAI SKU must be one of the valid Azure OpenAI SKUs: F0, F1, S0, S, S1, S2, S3, S4, S5, S6, P0, P1, P2, E0, DC0."
  }
}

variable "openai_capacity" {
  description = "The capacity for OpenAI deployment (tokens per minute in thousands)"
  type        = number
  default     = 10

  validation {
    condition     = var.openai_capacity >= 1 && var.openai_capacity <= 240
    error_message = "OpenAI capacity must be between 1 and 240."
  }
}

# Networking Configuration
variable "vnet_address_space" {
  description = "Address space for the virtual network"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnet_app_service_address_prefix" {
  description = "Address prefix for App Service subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "subnet_container_apps_address_prefix" {
  description = "Address prefix for Container Apps subnet (requires /23 minimum)"
  type        = string
  default     = "10.0.2.0/23"
}

variable "subnet_functions_address_prefix" {
  description = "Address prefix for Azure Functions subnet"
  type        = string
  default     = "10.0.4.0/24"
}

variable "subnet_private_endpoints_address_prefix" {
  description = "Address prefix for private endpoints subnet"
  type        = string
  default     = "10.0.5.0/24"
}

# Security Configuration
variable "enable_private_endpoints" {
  description = "Enable private endpoints for supported services"
  type        = bool
  default     = true
}

variable "enable_rbac_assignments" {
  description = "Enable RBAC role assignments (requires User Access Administrator or Owner role)"
  type        = bool
  default     = false
}

variable "create_network_watcher" {
  description = "Create a new Network Watcher (set to false if one already exists in the region)"
  type        = bool
  default     = false
}

variable "enable_management_locks" {
  description = "Enable management locks on critical resources (requires Contributor role or higher)"
  type        = bool
  default     = false
}

variable "create_current_user_access_policy" {
  description = "Create access policy for current user (set to false if policy already exists)"
  type        = bool
  default     = false
}

variable "allowed_ip_ranges" {
  description = "List of IP ranges allowed to access resources (CIDR notation)"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Restrict this in production
}

# Monitoring Configuration
variable "log_retention_days" {
  description = "Number of days to retain logs in Log Analytics"
  type        = number
  default     = 30

  validation {
    condition     = var.log_retention_days >= 30 && var.log_retention_days <= 730
    error_message = "Log retention must be between 30 and 730 days."
  }
}

variable "enable_diagnostic_logs" {
  description = "Enable diagnostic logs for all resources"
  type        = bool
  default     = false # Safe default to avoid conflicts with existing diagnostic settings
}

# Cost Optimization
variable "enable_autoscaling" {
  description = "Enable autoscaling for applicable services"
  type        = bool
  default     = true
}

variable "schedule_shutdown" {
  description = "Enable scheduled shutdown for non-production environments"
  type        = bool
  default     = false
}

# Custom Domain and SSL
variable "custom_domain" {
  description = "Custom domain for the application (optional)"
  type        = string
  default     = ""
}

variable "enable_https_only" {
  description = "Enforce HTTPS only for all web services"
  type        = bool
  default     = true
}

# Backup and Disaster Recovery
variable "enable_geo_redundancy" {
  description = "Enable geo-redundant storage and backup"
  type        = bool
  default     = false
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7

  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 35
    error_message = "Backup retention must be between 1 and 35 days."
  }
}

# Additional Tags
variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
