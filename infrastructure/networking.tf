# Azure Virtual Network and Security Configuration
# Creates secure networking infrastructure for the event-driven anomaly detection system

# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = local.vnet_name
  address_space       = var.vnet_address_space
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "networking"
    Purpose   = "secure-infrastructure"
  })
}

# Subnet for App Service (Next.js Dashboard)
resource "azurerm_subnet" "app_service" {
  name                 = "snet-app-service"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.subnet_app_service_address_prefix]

  # Enable delegation for App Service
  delegation {
    name = "app-service-delegation"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }

  # Service endpoints for secure access to Azure services
  service_endpoints = [
    "Microsoft.Storage",
    "Microsoft.KeyVault",
    "Microsoft.AzureCosmosDB",
    "Microsoft.CognitiveServices"
  ]
}

# Subnet for Container Apps (FastAPI)
resource "azurerm_subnet" "container_apps" {
  name                 = "snet-container-apps"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.subnet_container_apps_address_prefix]

  # NOTE: Container Apps environments manage subnet delegation automatically
  # Do not add manual delegation as it will cause deployment failures

  # Service endpoints for secure access to Azure services
  service_endpoints = [
    "Microsoft.Storage",
    "Microsoft.KeyVault",
    "Microsoft.AzureCosmosDB",
    "Microsoft.CognitiveServices"
  ]
}

# Subnet for Azure Functions
resource "azurerm_subnet" "functions" {
  name                 = "snet-functions"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.subnet_functions_address_prefix]

  # Enable delegation for Azure Functions
  delegation {
    name = "functions-delegation"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }

  # Service endpoints
  service_endpoints = [
    "Microsoft.Storage",
    "Microsoft.KeyVault",
    "Microsoft.AzureCosmosDB",
    "Microsoft.CognitiveServices"
  ]
}

# Subnet for Private Endpoints
resource "azurerm_subnet" "private_endpoints" {
  name                 = "snet-private-endpoints"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.subnet_private_endpoints_address_prefix]

  # Disable private endpoint network policies
  private_endpoint_network_policies = "Disabled"

  # Service endpoints
  service_endpoints = [
    "Microsoft.Storage",
    "Microsoft.KeyVault",
    "Microsoft.AzureCosmosDB"
  ]
}

# Network Security Group for App Service Subnet
resource "azurerm_network_security_group" "app_service" {
  name                = "nsg-app-service"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  # Allow HTTPS inbound
  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Allow HTTP inbound (for health checks)
  security_rule {
    name                       = "AllowHTTP"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Allow outbound to Redis
  security_rule {
    name                       = "AllowRedisOutbound"
    priority                   = 1001
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "6380"
    source_address_prefix      = var.subnet_app_service_address_prefix
    destination_address_prefix = "*"
  }

  # Allow outbound to Cosmos DB
  security_rule {
    name                       = "AllowCosmosDBOutbound"
    priority                   = 1002
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = var.subnet_app_service_address_prefix
    destination_address_prefix = "*"
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "network-security-group"
    Subnet    = "app-service"
  })
}

# Network Security Group for Container Apps Subnet
resource "azurerm_network_security_group" "container_apps" {
  name                = "nsg-container-apps"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  # Allow HTTP/HTTPS inbound from App Service
  security_rule {
    name                       = "AllowFromAppService"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["80", "443"]
    source_address_prefix      = var.subnet_app_service_address_prefix
    destination_address_prefix = var.subnet_container_apps_address_prefix
  }

  # Allow inbound from Functions
  security_rule {
    name                       = "AllowFromFunctions"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["80", "443"]
    source_address_prefix      = var.subnet_functions_address_prefix
    destination_address_prefix = var.subnet_container_apps_address_prefix
  }

  # Allow outbound to OpenAI
  security_rule {
    name                       = "AllowOpenAIOutbound"
    priority                   = 1001
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = var.subnet_container_apps_address_prefix
    destination_address_prefix = "*"
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "network-security-group"
    Subnet    = "container-apps"
  })
}

# Network Security Group for Functions Subnet
resource "azurerm_network_security_group" "functions" {
  name                = "nsg-functions"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  # Allow outbound to Redis
  security_rule {
    name                       = "AllowRedisOutbound"
    priority                   = 1001
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "6380"
    source_address_prefix      = var.subnet_functions_address_prefix
    destination_address_prefix = "*"
  }

  # Allow outbound to Container Apps
  security_rule {
    name                       = "AllowContainerAppsOutbound"
    priority                   = 1002
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["80", "443"]
    source_address_prefix      = var.subnet_functions_address_prefix
    destination_address_prefix = var.subnet_container_apps_address_prefix
  }

  # Allow outbound to Cosmos DB
  security_rule {
    name                       = "AllowCosmosDBOutbound"
    priority                   = 1003
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = var.subnet_functions_address_prefix
    destination_address_prefix = "*"
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "network-security-group"
    Subnet    = "functions"
  })
}

# Network Security Group for Private Endpoints Subnet
resource "azurerm_network_security_group" "private_endpoints" {
  name                = "nsg-private-endpoints"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  # Allow inbound from VNet
  security_rule {
    name                       = "AllowVNetInbound"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "VirtualNetwork"
    destination_address_prefix = "VirtualNetwork"
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "network-security-group"
    Subnet    = "private-endpoints"
  })
}

# Associate NSGs with Subnets
resource "azurerm_subnet_network_security_group_association" "app_service" {
  subnet_id                 = azurerm_subnet.app_service.id
  network_security_group_id = azurerm_network_security_group.app_service.id
}

resource "azurerm_subnet_network_security_group_association" "container_apps" {
  subnet_id                 = azurerm_subnet.container_apps.id
  network_security_group_id = azurerm_network_security_group.container_apps.id
}

resource "azurerm_subnet_network_security_group_association" "functions" {
  subnet_id                 = azurerm_subnet.functions.id
  network_security_group_id = azurerm_network_security_group.functions.id
}

resource "azurerm_subnet_network_security_group_association" "private_endpoints" {
  subnet_id                 = azurerm_subnet.private_endpoints.id
  network_security_group_id = azurerm_network_security_group.private_endpoints.id
}

# Route Table for custom routing (if needed)
resource "azurerm_route_table" "main" {
  name                = "rt-${local.naming_prefix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  # Route to ensure traffic to Azure services stays within Azure backbone
  route {
    name           = "RouteToAzureServices"
    address_prefix = "0.0.0.0/0"
    next_hop_type  = "Internet"
  }

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "route-table"
  })
}

# Public IP for NAT Gateway (if outbound internet access is needed)
resource "azurerm_public_ip" "nat_gateway" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "pip-nat-${local.naming_prefix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "public-ip"
    Purpose   = "nat-gateway"
  })
}

# NAT Gateway for secure outbound internet access
resource "azurerm_nat_gateway" "main" {
  count               = var.enable_private_endpoints ? 1 : 0
  name                = "ng-${local.naming_prefix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku_name            = "Standard"

  tags = merge(local.common_tags, var.additional_tags, {
    Component = "nat-gateway"
    Purpose   = "secure-outbound"
  })
}

# Associate Public IP with NAT Gateway
resource "azurerm_nat_gateway_public_ip_association" "main" {
  count                = var.enable_private_endpoints ? 1 : 0
  nat_gateway_id       = azurerm_nat_gateway.main[0].id
  public_ip_address_id = azurerm_public_ip.nat_gateway[0].id
}

# Associate NAT Gateway with Private Endpoints Subnet
resource "azurerm_subnet_nat_gateway_association" "private_endpoints" {
  count          = var.enable_private_endpoints ? 1 : 0
  subnet_id      = azurerm_subnet.private_endpoints.id
  nat_gateway_id = azurerm_nat_gateway.main[0].id
}
