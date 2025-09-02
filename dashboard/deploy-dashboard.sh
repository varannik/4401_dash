#!/bin/bash

# Next.js Dashboard Deployment Script for Azure App Service
# This script builds and deploys the Next.js dashboard to Azure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
ENVIRONMENT="prod"
RESOURCE_GROUP=""
APP_NAME=""
BUILD_DIR="out"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -g|--resource-group)
            RESOURCE_GROUP="$2"
            shift 2
            ;;
        -a|--app-name)
            APP_NAME="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -e, --environment    Environment (prod, staging, dev) [default: prod]"
            echo "  -g, --resource-group Azure Resource Group name"
            echo "  -a, --app-name       Azure App Service name"
            echo "  -h, --help           Show this help"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Get values from Terraform if not provided
if [[ -z "$RESOURCE_GROUP" || -z "$APP_NAME" ]]; then
    print_status "Getting deployment info from Terraform..."
    
    if [[ ! -d "../infrastructure" ]]; then
        print_error "Infrastructure directory not found. Run this script from the dashboard directory."
        exit 1
    fi
    
    cd ../infrastructure
    
    if [[ -z "$RESOURCE_GROUP" ]]; then
        RESOURCE_GROUP=$(terraform output -raw resource_group_name 2>/dev/null)
        if [[ $? -ne 0 || -z "$RESOURCE_GROUP" ]]; then
            print_error "Could not get resource group from Terraform. Please specify with -g"
            exit 1
        fi
    fi
    
    if [[ -z "$APP_NAME" ]]; then
        APP_NAME=$(terraform output -raw app_service_name 2>/dev/null)
        if [[ $? -ne 0 || -z "$APP_NAME" ]]; then
            print_error "Could not get app service name from Terraform. Please specify with -a"
            exit 1
        fi
    fi
    
    cd ../dashboard
fi

print_status "Deployment Configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  App Service: $APP_NAME"
echo ""

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v az &> /dev/null; then
    print_error "Azure CLI not found. Please install it first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install Node.js and npm first."
    exit 1
fi

if ! az account show &> /dev/null; then
    print_error "Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Create production environment file
print_status "Setting up environment configuration..."

# Get environment variables from Azure App Service
print_status "Fetching environment variables from Azure..."

NEXTAUTH_URL=$(az webapp config appsettings list \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "[?name=='NEXTAUTH_URL'].value | [0]" \
    --output tsv 2>/dev/null || echo "")

NEXT_PUBLIC_API_BASE_URL=$(az webapp config appsettings list \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "[?name=='NEXT_PUBLIC_API_BASE_URL'].value | [0]" \
    --output tsv 2>/dev/null || echo "")

# Create .env.production file
cat > .env.production << EOF
# Production environment variables
NEXTAUTH_URL=${NEXTAUTH_URL:-https://${APP_NAME}.azurewebsites.net}
NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
NEXT_PUBLIC_ENVIRONMENT=${ENVIRONMENT}
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
EOF

print_success "Environment configuration created"

# Build the application
print_status "Building Next.js application..."
npm run build

# Create deployment package
print_status "Creating deployment package..."

# Create a temporary directory for deployment
DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy necessary files for deployment
cp -r .next "$DEPLOY_DIR/"
cp -r public "$DEPLOY_DIR/" 2>/dev/null || true
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/" 2>/dev/null || true
cp next.config.* "$DEPLOY_DIR/" 2>/dev/null || true
cp .env.production "$DEPLOY_DIR/"

# Create web.config for Azure App Service
cat > "$DEPLOY_DIR/web.config" << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
EOF

# Create deployment zip
print_status "Creating deployment archive..."
cd "$DEPLOY_DIR"
zip -r "../${DEPLOY_DIR}.zip" . -q
cd ..

# Deploy to Azure App Service
print_status "Deploying to Azure App Service..."

az webapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --src "${DEPLOY_DIR}.zip"

# Restart the app service
print_status "Restarting App Service..."
az webapp restart \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP"

# Clean up
print_status "Cleaning up..."
rm -rf "$DEPLOY_DIR"
rm -f "${DEPLOY_DIR}.zip"
rm -f .env.production

# Get the URL
APP_URL="https://${APP_NAME}.azurewebsites.net"

print_success "Deployment completed successfully!"
echo ""
print_status "Dashboard URL: $APP_URL"
echo ""
print_status "Next steps:"
echo "1. Visit your dashboard at: $APP_URL"
echo "2. Check the logs: az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "3. Monitor performance in Azure portal"
echo ""

# Optional: Open in browser
if command -v open &> /dev/null; then
    read -p "Open dashboard in browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$APP_URL"
    fi
fi

