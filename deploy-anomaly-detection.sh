#!/bin/bash

# Deploy FastAPI Anomaly Detection App to Azure Container Apps
# This script builds the Docker image and deploys it to the provisioned infrastructure

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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Get Azure Container Registry details from Terraform output
get_acr_details() {
    print_status "Getting Azure Container Registry details..."
    
    cd infrastructure
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        print_warning "terraform.tfvars not found. Creating from example..."
        cp terraform.tfvars.example terraform.tfvars
        print_warning "Please update terraform.tfvars with your specific values before continuing"
        exit 1
    fi
    
    # Initialize Terraform if needed
    if [ ! -d ".terraform" ]; then
        print_status "Initializing Terraform..."
        terraform init
    fi
    
    # Get ACR details
    ACR_LOGIN_SERVER=$(terraform output -raw container_registry_login_server 2>/dev/null || echo "")
    ACR_NAME=$(terraform output -raw container_registry_name 2>/dev/null || echo "")
    
    if [ -z "$ACR_LOGIN_SERVER" ] || [ -z "$ACR_NAME" ]; then
        print_error "Could not get ACR details from Terraform. Please ensure infrastructure is deployed."
        exit 1
    fi
    
    print_success "ACR Login Server: $ACR_LOGIN_SERVER"
    print_success "ACR Name: $ACR_NAME"
    
    cd ..
}

# Login to Azure Container Registry
login_to_acr() {
    print_status "Logging in to Azure Container Registry..."
    
    az acr login --name "$ACR_NAME"
    
    if [ $? -eq 0 ]; then
        print_success "Successfully logged in to ACR"
    else
        print_error "Failed to login to ACR"
        exit 1
    fi
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    
    cd anomaly-detection
    
    # Build the image
    docker build -t "$ACR_LOGIN_SERVER/anomaly-detection:latest" .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
    
    cd ..
}

# Push image to ACR
push_image() {
    print_status "Pushing image to Azure Container Registry..."
    
    docker push "$ACR_LOGIN_SERVER/anomaly-detection:latest"
    
    if [ $? -eq 0 ]; then
        print_success "Image pushed successfully to ACR"
    else
        print_error "Failed to push image to ACR"
        exit 1
    fi
}

# Deploy to Container Apps
deploy_to_container_apps() {
    print_status "Deploying to Azure Container Apps..."
    
    cd infrastructure
    
    # Get Container App name
    CONTAINER_APP_NAME=$(terraform output -raw container_app_name 2>/dev/null || echo "")
    
    if [ -z "$CONTAINER_APP_NAME" ]; then
        print_error "Could not get Container App name from Terraform"
        exit 1
    fi
    
    # Get resource group name
    RESOURCE_GROUP=$(terraform output -raw resource_group_name 2>/dev/null || echo "")
    
    if [ -z "$RESOURCE_GROUP" ]; then
        print_error "Could not get resource group name from Terraform"
        exit 1
    fi
    
    # Update the container app with the new image
    az containerapp update \
        --name "$CONTAINER_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --image "$ACR_LOGIN_SERVER/anomaly-detection:latest"
    
    if [ $? -eq 0 ]; then
        print_success "Container App updated successfully"
    else
        print_error "Failed to update Container App"
        exit 1
    fi
    
    cd ..
}

# Get the application URL
get_app_url() {
    print_status "Getting application URL..."
    
    cd infrastructure
    
    CONTAINER_APP_NAME=$(terraform output -raw container_app_name 2>/dev/null || echo "")
    RESOURCE_GROUP=$(terraform output -raw resource_group_name 2>/dev/null || echo "")
    
    if [ -n "$CONTAINER_APP_NAME" ] && [ -n "$RESOURCE_GROUP" ]; then
        APP_URL=$(az containerapp show \
            --name "$CONTAINER_APP_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --query "properties.configuration.ingress.fqdn" \
            --output tsv)
        
        if [ -n "$APP_URL" ]; then
            print_success "Application URL: https://$APP_URL"
            print_success "API Documentation: https://$APP_URL/docs"
            print_success "Health Check: https://$APP_URL/health"
        else
            print_warning "Could not retrieve application URL"
        fi
    fi
    
    cd ..
}

# Main deployment function
main() {
    print_status "Starting FastAPI Anomaly Detection deployment..."
    
    check_prerequisites
    get_acr_details
    login_to_acr
    build_image
    push_image
    deploy_to_container_apps
    get_app_url
    
    print_success "Deployment completed successfully!"
    print_status "Your FastAPI anomaly detection app is now running on Azure Container Apps"
}

# Run main function
main "$@"
