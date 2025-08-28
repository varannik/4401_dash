#!/bin/bash

# Quick Deploy Script for FastAPI Anomaly Detection
# This script automates the entire deployment process

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command -v az &> /dev/null; then
        missing_tools+=("Azure CLI")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_tools+=("Docker")
    fi
    
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("Terraform")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_status "Please install the missing tools and try again."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Check Azure login
check_azure_login() {
    print_status "Checking Azure login status..."
    
    if ! az account show &> /dev/null; then
        print_error "Not logged in to Azure. Please run 'az login' first."
        exit 1
    fi
    
    local subscription=$(az account show --query "name" -o tsv)
    print_success "Logged in to Azure subscription: $subscription"
}

# Setup Terraform variables
setup_terraform_vars() {
    print_status "Setting up Terraform variables..."
    
    cd infrastructure
    
    if [ ! -f "terraform.tfvars" ]; then
        print_warning "terraform.tfvars not found. Creating from example..."
        cp terraform.tfvars.example terraform.tfvars
        
        print_warning "Please update terraform.tfvars with your specific values:"
        echo "  - Update allowed_ip_ranges with your IP address"
        echo "  - Review other settings as needed"
        echo ""
        print_warning "Press Enter to continue after updating terraform.tfvars, or Ctrl+C to abort..."
        read -r
        
        if [ ! -f "terraform.tfvars" ]; then
            print_error "terraform.tfvars file not found. Please create it manually."
            exit 1
        fi
    fi
    
    cd ..
}

# Deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying Azure infrastructure..."
    
    cd infrastructure
    
    # Initialize Terraform
    if [ ! -d ".terraform" ]; then
        print_status "Initializing Terraform..."
        terraform init
    fi
    
    # Plan deployment
    print_status "Planning Terraform deployment..."
    terraform plan -out=tfplan
    
    # Confirm deployment
    print_warning "Review the plan above. Press Enter to apply, or Ctrl+C to abort..."
    read -r
    
    # Apply deployment
    print_status "Applying Terraform deployment..."
    terraform apply tfplan
    
    print_success "Infrastructure deployment completed"
    
    cd ..
}

# Deploy application
deploy_application() {
    print_status "Deploying FastAPI application..."
    
    if [ -f "deploy-anomaly-detection.sh" ]; then
        ./deploy-anomaly-detection.sh
    else
        print_error "deploy-anomaly-detection.sh not found"
        exit 1
    fi
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    if [ -f "test-anomaly-api.sh" ]; then
        ./test-anomaly-api.sh
    else
        print_warning "test-anomaly-api.sh not found. Skipping tests."
    fi
}

# Display final information
display_info() {
    print_success "Deployment completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Access your API at the URL shown above"
    echo "2. Review the API documentation at /docs"
    echo "3. Set up monitoring and alerts"
    echo "4. Configure your applications to use the API"
    echo ""
    print_status "Useful commands:"
    echo "- View logs: az containerapp logs show --name <app-name> --resource-group <rg-name>"
    echo "- Scale app: az containerapp revision set-mode --name <app-name> --resource-group <rg-name> --mode single"
    echo "- Update app: ./deploy-anomaly-detection.sh"
    echo ""
}

# Main function
main() {
    echo "=========================================="
    echo "FastAPI Anomaly Detection Quick Deploy"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    check_azure_login
    setup_terraform_vars
    deploy_infrastructure
    deploy_application
    test_deployment
    display_info
}

# Handle script interruption
trap 'print_error "Deployment interrupted. Please check the current state and try again."; exit 1' INT

# Run main function
main "$@"
