#!/bin/bash

# Terraform Azure Event-Driven Anomaly Detection Infrastructure Deployment Script
# This script deploys the complete infrastructure for the anomaly detection system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="prod"
AUTO_APPROVE=false
PLAN_ONLY=false
WORKSPACE=""
VAR_FILE=""
BACKEND_CONFIG=""
SKIP_INIT=false

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

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy Azure Event-Driven Anomaly Detection Infrastructure

OPTIONS:
    -e, --environment ENVIRONMENT    Environment to deploy (prod, staging, dev) [default: prod]
    -w, --workspace WORKSPACE        Terraform workspace to use
    -f, --var-file FILE             Path to terraform.tfvars file
    -b, --backend-config FILE       Path to backend configuration file
    -p, --plan-only                 Only run terraform plan, don't apply
    -y, --auto-approve             Auto-approve the apply (skip confirmation)
    -s, --skip-init                Skip terraform init
    -h, --help                     Display this help message

EXAMPLES:
    # Deploy to production with auto-approval
    $0 -e prod -y

    # Plan deployment for staging environment
    $0 -e staging -p

    # Deploy with custom variables file
    $0 -f custom.tfvars

    # Deploy with specific workspace
    $0 -w production-workspace

    # Deploy with backend configuration
    $0 -b backend.conf

PREREQUISITES:
    1. Azure CLI installed and authenticated
    2. Terraform >= 1.0 installed
    3. Appropriate Azure permissions
    4. terraform.tfvars file configured

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -w|--workspace)
            WORKSPACE="$2"
            shift 2
            ;;
        -f|--var-file)
            VAR_FILE="$2"
            shift 2
            ;;
        -b|--backend-config)
            BACKEND_CONFIG="$2"
            shift 2
            ;;
        -p|--plan-only)
            PLAN_ONLY=true
            shift
            ;;
        -y|--auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        -s|--skip-init)
            SKIP_INIT=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(prod|staging|dev)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be prod, staging, or dev"
    exit 1
fi

print_status "Starting deployment for environment: $ENVIRONMENT"

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Azure CLI is installed and user is logged in
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

if ! az account show &> /dev/null; then
    print_error "Not logged into Azure CLI. Please run 'az login' first."
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed. Please install it first."
    exit 1
fi

# Check Terraform version
TERRAFORM_VERSION=$(terraform version -json | jq -r '.terraform_version')
print_status "Terraform version: $TERRAFORM_VERSION"

# Get current Azure subscription
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
print_status "Azure subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"

# Confirm deployment
if [[ "$AUTO_APPROVE" != true && "$PLAN_ONLY" != true ]]; then
    echo
    print_warning "You are about to deploy infrastructure to Azure subscription:"
    echo "  Subscription: $SUBSCRIPTION_NAME"
    echo "  Environment: $ENVIRONMENT"
    echo
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled."
        exit 0
    fi
fi

# Set Terraform variables
TF_VARS="-var environment=$ENVIRONMENT"

# Add var file if specified
if [[ -n "$VAR_FILE" ]]; then
    if [[ ! -f "$VAR_FILE" ]]; then
        print_error "Variables file not found: $VAR_FILE"
        exit 1
    fi
    TF_VARS="$TF_VARS -var-file=$VAR_FILE"
fi

# Initialize Terraform if not skipped
if [[ "$SKIP_INIT" != true ]]; then
    print_status "Initializing Terraform..."
    
    INIT_COMMAND="terraform init"
    
    # Add backend config if specified
    if [[ -n "$BACKEND_CONFIG" ]]; then
        if [[ ! -f "$BACKEND_CONFIG" ]]; then
            print_error "Backend config file not found: $BACKEND_CONFIG"
            exit 1
        fi
        INIT_COMMAND="$INIT_COMMAND -backend-config=$BACKEND_CONFIG"
    fi
    
    if ! $INIT_COMMAND; then
        print_error "Terraform initialization failed"
        exit 1
    fi
    
    print_success "Terraform initialized successfully"
fi

# Select or create workspace if specified
if [[ -n "$WORKSPACE" ]]; then
    print_status "Selecting Terraform workspace: $WORKSPACE"
    
    # Try to select workspace, create if it doesn't exist
    if ! terraform workspace select "$WORKSPACE" 2>/dev/null; then
        print_status "Workspace $WORKSPACE doesn't exist, creating it..."
        terraform workspace new "$WORKSPACE"
    fi
    
    print_success "Using workspace: $(terraform workspace show)"
fi

# Validate Terraform configuration
print_status "Validating Terraform configuration..."
if ! terraform validate; then
    print_error "Terraform validation failed"
    exit 1
fi
print_success "Terraform configuration is valid"

# Format Terraform files
print_status "Formatting Terraform files..."
terraform fmt -recursive

# Generate and show plan
print_status "Generating Terraform plan..."
PLAN_FILE="tfplan-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)"

if ! terraform plan $TF_VARS -out="$PLAN_FILE"; then
    print_error "Terraform plan failed"
    exit 1
fi

print_success "Terraform plan generated: $PLAN_FILE"

# If plan-only mode, exit here
if [[ "$PLAN_ONLY" == true ]]; then
    print_success "Plan-only mode: Review the plan above"
    echo
    print_status "To apply this plan later, run:"
    echo "  terraform apply $PLAN_FILE"
    exit 0
fi

# Apply the plan
print_status "Applying Terraform plan..."

APPLY_COMMAND="terraform apply"
if [[ "$AUTO_APPROVE" == true ]]; then
    APPLY_COMMAND="$APPLY_COMMAND -auto-approve"
fi
APPLY_COMMAND="$APPLY_COMMAND $PLAN_FILE"

if ! $APPLY_COMMAND; then
    print_error "Terraform apply failed"
    exit 1
fi

print_success "Infrastructure deployed successfully!"

# Clean up plan file
rm -f "$PLAN_FILE"

# Show outputs
print_status "Deployment outputs:"
terraform output

# Show important URLs and information
echo
print_success "Deployment Summary:"
echo "=================="

# Get key outputs
RESOURCE_GROUP=$(terraform output -raw resource_group_name 2>/dev/null || echo "N/A")
APP_SERVICE_URL=$(terraform output -raw app_service_url 2>/dev/null || echo "N/A")
CONTAINER_APP_URL=$(terraform output -raw container_app_url 2>/dev/null || echo "N/A")
REDIS_HOSTNAME=$(terraform output -raw redis_hostname 2>/dev/null || echo "N/A")
COSMOS_DB_ENDPOINT=$(terraform output -raw cosmos_db_endpoint 2>/dev/null || echo "N/A")

echo "Environment: $ENVIRONMENT"
echo "Resource Group: $RESOURCE_GROUP"
echo "Dashboard URL: $APP_SERVICE_URL"
echo "FastAPI URL: $CONTAINER_APP_URL"
echo "Redis Hostname: $REDIS_HOSTNAME"
echo "Cosmos DB Endpoint: $COSMOS_DB_ENDPOINT"

echo
print_warning "Next Steps:"
echo "1. Configure your FastAPI application with the container app"
echo "2. Deploy your Next.js dashboard to the app service"
echo "3. Deploy your Azure Functions code"
echo "4. Configure monitoring alerts and dashboards"
echo "5. Set up CI/CD pipelines for automated deployments"

echo
print_warning "Security Reminders:"
echo "1. Update Key Vault secrets with production values"
echo "2. Configure custom domains and SSL certificates"
echo "3. Review and restrict IP access rules"
echo "4. Set up backup and disaster recovery procedures"
echo "5. Configure Azure Policy for compliance"

print_success "Deployment completed successfully!"
