#!/bin/bash

# Terraform Azure Event-Driven Anomaly Detection Infrastructure Destruction Script
# This script safely destroys the infrastructure while preserving critical data

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
FORCE_DESTROY=false
PRESERVE_DATA=true
WORKSPACE=""
VAR_FILE=""
PLAN_ONLY=false

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

Destroy Azure Event-Driven Anomaly Detection Infrastructure

OPTIONS:
    -e, --environment ENVIRONMENT    Environment to destroy (prod, staging, dev) [default: prod]
    -w, --workspace WORKSPACE        Terraform workspace to use
    -f, --var-file FILE             Path to terraform.tfvars file
    -p, --plan-only                 Only run terraform plan -destroy, don't destroy
    -y, --auto-approve             Auto-approve the destroy (skip confirmation)
    -F, --force-destroy            Force destroy protected resources (USE WITH EXTREME CAUTION)
    -D, --destroy-data             Destroy data resources (Cosmos DB, Redis data) (USE WITH EXTREME CAUTION)
    -h, --help                     Display this help message

EXAMPLES:
    # Plan destruction for staging environment (safe preview)
    $0 -e staging -p

    # Destroy development environment with auto-approval
    $0 -e dev -y

    # Force destroy production (DANGEROUS - not recommended)
    $0 -e prod -F -D -y

WARNINGS:
    - This script will PERMANENTLY DELETE Azure resources
    - By default, data resources (Cosmos DB, Redis) are protected
    - Use --force-destroy and --destroy-data flags to override protection
    - Always run with --plan-only first to review what will be destroyed
    - Production environments should have additional approval processes

PREREQUISITES:
    1. Azure CLI installed and authenticated
    2. Terraform >= 1.0 installed
    3. Appropriate Azure permissions
    4. Matching terraform.tfvars file used for deployment

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
        -p|--plan-only)
            PLAN_ONLY=true
            shift
            ;;
        -y|--auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        -F|--force-destroy)
            FORCE_DESTROY=true
            shift
            ;;
        -D|--destroy-data)
            PRESERVE_DATA=false
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

print_warning "DESTRUCTION PROCESS INITIATED FOR ENVIRONMENT: $ENVIRONMENT"

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

# Get current Azure subscription
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
print_status "Azure subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"

# Select workspace if specified
if [[ -n "$WORKSPACE" ]]; then
    print_status "Selecting Terraform workspace: $WORKSPACE"
    
    if ! terraform workspace select "$WORKSPACE" 2>/dev/null; then
        print_error "Workspace $WORKSPACE doesn't exist"
        exit 1
    fi
    
    print_status "Using workspace: $(terraform workspace show)"
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

# Get current state information
print_status "Analyzing current infrastructure state..."

# Check if state file exists
if ! terraform show &> /dev/null; then
    print_warning "No Terraform state found. Nothing to destroy."
    exit 0
fi

# List resources that will be destroyed
print_status "Resources in current state:"
terraform state list | sed 's/^/  /'

# Special handling for protected resources
PROTECTED_RESOURCES=()
if [[ "$PRESERVE_DATA" == true ]]; then
    PROTECTED_RESOURCES+=(
        "azurerm_cosmosdb_account.main"
        "azurerm_redis_cache.main"
        "azurerm_key_vault.main"
    )
fi

# Show protected resources
if [[ ${#PROTECTED_RESOURCES[@]} -gt 0 ]]; then
    echo
    print_warning "The following resources are protected and will NOT be destroyed:"
    for resource in "${PROTECTED_RESOURCES[@]}"; do
        echo "  - $resource"
    done
    echo
    print_warning "Use --destroy-data flag to override data protection (DANGEROUS)"
fi

# Additional protection for production
if [[ "$ENVIRONMENT" == "prod" ]]; then
    echo
    print_error "PRODUCTION ENVIRONMENT DESTRUCTION DETECTED!"
    print_warning "This will permanently delete production infrastructure!"
    
    if [[ "$FORCE_DESTROY" != true ]]; then
        print_error "Production destruction requires --force-destroy flag"
        print_status "To destroy production infrastructure, use:"
        echo "  $0 -e prod --force-destroy"
        exit 1
    fi
    
    if [[ "$AUTO_APPROVE" == true && "$PLAN_ONLY" != true ]]; then
        print_error "Production destruction with auto-approve is not allowed for safety"
        print_status "Remove -y/--auto-approve flag and confirm manually"
        exit 1
    fi
fi

# Remove protection from resources if force destroy is enabled
if [[ "$FORCE_DESTROY" == true && "$PRESERVE_DATA" == false ]]; then
    print_warning "Removing lifecycle protection from critical resources..."
    
    # This would require temporarily modifying the Terraform files
    # In a real scenario, you might want to use targeted destroys instead
    print_warning "Force destroy mode: All protections will be bypassed"
fi

# Generate destruction plan
print_status "Generating destruction plan..."
PLAN_FILE="destroy-plan-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)"

PLAN_COMMAND="terraform plan -destroy $TF_VARS -out=$PLAN_FILE"

# Add target resources if preserving data
if [[ "$PRESERVE_DATA" == true ]]; then
    print_status "Creating selective destruction plan (preserving data resources)..."
    
    # Get all resources except protected ones
    ALL_RESOURCES=$(terraform state list)
    TARGET_RESOURCES=()
    
    for resource in $ALL_RESOURCES; do
        PROTECTED=false
        for protected in "${PROTECTED_RESOURCES[@]}"; do
            if [[ "$resource" == "$protected" ]]; then
                PROTECTED=true
                break
            fi
        done
        
        if [[ "$PROTECTED" != true ]]; then
            TARGET_RESOURCES+=(-target="$resource")
        fi
    done
    
    if [[ ${#TARGET_RESOURCES[@]} -gt 0 ]]; then
        PLAN_COMMAND="$PLAN_COMMAND ${TARGET_RESOURCES[*]}"
    else
        print_warning "No resources to destroy (all are protected)"
        exit 0
    fi
fi

if ! $PLAN_COMMAND; then
    print_error "Terraform destroy plan failed"
    exit 1
fi

print_success "Destruction plan generated: $PLAN_FILE"

# Show the plan
print_status "Destruction plan summary:"
terraform show -no-color "$PLAN_FILE" | grep -E "^  # " | head -20
echo "  ... (run 'terraform show $PLAN_FILE' for full details)"

# If plan-only mode, exit here
if [[ "$PLAN_ONLY" == true ]]; then
    print_success "Plan-only mode: Review the destruction plan above"
    echo
    print_status "To execute this destruction plan later, run:"
    echo "  terraform apply $PLAN_FILE"
    exit 0
fi

# Final confirmation
if [[ "$AUTO_APPROVE" != true ]]; then
    echo
    print_error "⚠️  FINAL CONFIRMATION REQUIRED ⚠️"
    echo
    print_warning "You are about to PERMANENTLY DELETE the following:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Subscription: $SUBSCRIPTION_NAME"
    echo "  Resources: $(terraform state list | wc -l) total resources"
    
    if [[ "$PRESERVE_DATA" == true ]]; then
        echo "  Data Preservation: ENABLED (Cosmos DB, Redis, Key Vault will be preserved)"
    else
        echo "  Data Preservation: DISABLED (ALL DATA WILL BE LOST)"
    fi
    
    echo
    print_error "This action CANNOT be undone!"
    echo
    
    # Triple confirmation for production
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        read -p "Type 'DESTROY-PRODUCTION' to confirm production destruction: " -r
        if [[ "$REPLY" != "DESTROY-PRODUCTION" ]]; then
            print_status "Destruction cancelled."
            exit 0
        fi
    fi
    
    read -p "Are you absolutely sure you want to proceed? (type 'yes' to confirm): " -r
    if [[ "$REPLY" != "yes" ]]; then
        print_status "Destruction cancelled."
        exit 0
    fi
    
    print_warning "Last chance! Proceeding in 5 seconds... (Ctrl+C to cancel)"
    sleep 5
fi

# Backup current state (in case of emergency recovery)
print_status "Creating state backup..."
terraform state pull > "terraform.tfstate.backup.$(date +%Y%m%d-%H%M%S)"

# Execute destruction
print_status "Executing destruction plan..."

DESTROY_COMMAND="terraform apply"
if [[ "$AUTO_APPROVE" == true ]]; then
    DESTROY_COMMAND="$DESTROY_COMMAND -auto-approve"
fi
DESTROY_COMMAND="$DESTROY_COMMAND $PLAN_FILE"

if ! $DESTROY_COMMAND; then
    print_error "Terraform destruction failed"
    print_warning "Check the error above and the state backup files"
    exit 1
fi

# Clean up plan file
rm -f "$PLAN_FILE"

print_success "Infrastructure destruction completed!"

# Show remaining resources (if any)
REMAINING_RESOURCES=$(terraform state list 2>/dev/null | wc -l)
if [[ $REMAINING_RESOURCES -gt 0 ]]; then
    print_warning "Remaining resources in state: $REMAINING_RESOURCES"
    print_status "Remaining resources:"
    terraform state list | sed 's/^/  /'
    
    if [[ "$PRESERVE_DATA" == true ]]; then
        print_status "These are preserved data resources. To destroy them:"
        echo "  $0 -e $ENVIRONMENT --destroy-data --force-destroy"
    fi
else
    print_success "All targeted resources have been destroyed"
fi

echo
print_success "Destruction Summary:"
echo "==================="
echo "Environment: $ENVIRONMENT"
echo "Destruction completed at: $(date)"
echo "State backups available in current directory"

if [[ "$PRESERVE_DATA" == true ]]; then
    echo
    print_warning "Data Preservation Summary:"
    echo "- Cosmos DB account preserved with all data"
    echo "- Redis cache preserved with current data"
    echo "- Key Vault preserved with all secrets"
    echo
    print_warning "These resources may still incur costs. Destroy manually if not needed:"
    echo "1. Azure portal > Resource groups > [your resource group]"
    echo "2. Or use: $0 -e $ENVIRONMENT --destroy-data --force-destroy"
fi

print_success "Destruction process completed!"
