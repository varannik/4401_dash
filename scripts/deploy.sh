#!/bin/bash

# Real-Time Monitoring Dashboard Deployment Script
# Supports both Azure and AWS deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="realtime-monitoring"
ENVIRONMENT="${ENVIRONMENT:-dev}"
CLOUD_PROVIDER="${CLOUD_PROVIDER:-azure}"  # azure or aws

echo -e "${BLUE}🚀 Real-Time Monitoring Dashboard Deployment${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo -e "Project: ${GREEN}${PROJECT_NAME}${NC}"
echo -e "Environment: ${GREEN}${ENVIRONMENT}${NC}"
echo -e "Cloud Provider: ${GREEN}${CLOUD_PROVIDER}${NC}"
echo ""

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is required but not installed"
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is required but not installed"
    fi
    
    # Check if Python is installed
    if ! command -v python3 &> /dev/null; then
        error "Python 3 is required but not installed"
    fi
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        error "Terraform is required but not installed"
    fi
    
    # Check cloud provider specific tools
    if [ "$CLOUD_PROVIDER" = "azure" ]; then
        if ! command -v az &> /dev/null; then
            error "Azure CLI is required but not installed"
        fi
    elif [ "$CLOUD_PROVIDER" = "aws" ]; then
        if ! command -v aws &> /dev/null; then
            error "AWS CLI is required but not installed"
        fi
    fi
    
    log "✅ Prerequisites check passed"
}

# Setup environment
setup_environment() {
    log "Setting up environment..."
    
    # Copy environment template
    if [ ! -f .env ]; then
        cp env.template .env
        warn "Created .env file from template. Please update with your actual values."
    fi
    
    # Install root dependencies
    log "Installing root dependencies..."
    npm install
    
    # Install Python dependencies
    log "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Setup dashboard
    log "Setting up dashboard..."
    cd dashboard
    npm install
    cd ..
    
    log "✅ Environment setup completed"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build data ingestion service
    log "Building data-ingestion service..."
    cd data-ingestion
    docker build -t ${PROJECT_NAME}/data-ingestion:latest .
    cd ..
    
    # Build anomaly detection service
    log "Building anomaly-detection service..."
    cd anomaly-detection
    docker build -t ${PROJECT_NAME}/anomaly-detection:latest .
    cd ..
    
    # Build RAG system
    log "Building rag-system service..."
    cd rag-system
    docker build -t ${PROJECT_NAME}/rag-system:latest .
    cd ..
    
    log "✅ Docker images built successfully"
}

# Deploy to cloud
deploy_cloud() {
    log "Deploying to ${CLOUD_PROVIDER}..."
    
    cd infrastructure/${CLOUD_PROVIDER}
    
    # Initialize Terraform
    log "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    log "Planning deployment..."
    terraform plan -var="project_name=${PROJECT_NAME}" -var="environment=${ENVIRONMENT}"
    
    # Apply deployment
    log "Applying deployment..."
    terraform apply -var="project_name=${PROJECT_NAME}" -var="environment=${ENVIRONMENT}" -auto-approve
    
    cd ../..
    
    log "✅ Cloud infrastructure deployed"
}

# Push images to cloud registry
push_images() {
    log "Pushing images to cloud registry..."
    
    if [ "$CLOUD_PROVIDER" = "azure" ]; then
        # Get ACR login server from Terraform output
        ACR_LOGIN_SERVER=$(cd infrastructure/azure && terraform output -raw container_registry_login_server)
        
        # Login to ACR
        az acr login --name ${ACR_LOGIN_SERVER}
        
        # Tag and push images
        docker tag ${PROJECT_NAME}/data-ingestion:latest ${ACR_LOGIN_SERVER}/data-ingestion:latest
        docker push ${ACR_LOGIN_SERVER}/data-ingestion:latest
        
        docker tag ${PROJECT_NAME}/anomaly-detection:latest ${ACR_LOGIN_SERVER}/anomaly-detection:latest
        docker push ${ACR_LOGIN_SERVER}/anomaly-detection:latest
        
        docker tag ${PROJECT_NAME}/rag-system:latest ${ACR_LOGIN_SERVER}/rag-system:latest
        docker push ${ACR_LOGIN_SERVER}/rag-system:latest
        
    elif [ "$CLOUD_PROVIDER" = "aws" ]; then
        # Get ECR repository URLs from Terraform output
        ECR_DATA_INGESTION=$(cd infrastructure/aws && terraform output -raw ecr_data_ingestion_url)
        
        # Login to ECR
        aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ECR_DATA_INGESTION}
        
        # Tag and push images
        docker tag ${PROJECT_NAME}/data-ingestion:latest ${ECR_DATA_INGESTION}:latest
        docker push ${ECR_DATA_INGESTION}:latest
    fi
    
    log "✅ Images pushed to cloud registry"
}

# Deploy dashboard
deploy_dashboard() {
    log "Deploying dashboard..."
    
    cd dashboard
    
    # Build dashboard
    npm run build
    
    if [ "$CLOUD_PROVIDER" = "azure" ]; then
        # Deploy to Azure Static Web Apps
        # This would typically be done through GitHub Actions or Azure DevOps
        warn "Dashboard deployment to Azure Static Web Apps requires GitHub integration"
        
    elif [ "$CLOUD_PROVIDER" = "aws" ]; then
        # Deploy to AWS Amplify
        # This would typically be done through GitHub integration
        warn "Dashboard deployment to AWS Amplify requires GitHub integration"
    fi
    
    cd ..
    
    log "✅ Dashboard build completed"
}

# Start local development
start_local() {
    log "Starting local development environment..."
    
    # Start Docker Compose services
    docker-compose up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Start dashboard in development mode
    cd dashboard
    npm run dev &
    cd ..
    
    log "✅ Local development environment started"
    log "Dashboard: http://localhost:3000"
    log "Kafka UI: http://localhost:8080"
    log "Grafana: http://localhost:3001 (admin/admin)"
    log "Prometheus: http://localhost:9090"
}

# Show usage
usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  check         Check prerequisites"
    echo "  setup         Setup environment and install dependencies"
    echo "  build         Build Docker images"
    echo "  deploy        Deploy to cloud (set CLOUD_PROVIDER=azure|aws)"
    echo "  local         Start local development environment"
    echo "  full          Run full deployment (setup + build + deploy)"
    echo ""
    echo "Environment Variables:"
    echo "  CLOUD_PROVIDER    Target cloud provider (azure|aws) [default: azure]"
    echo "  ENVIRONMENT       Environment name (dev|staging|prod) [default: dev]"
    echo ""
    echo "Examples:"
    echo "  $0 local                                   # Start local development"
    echo "  CLOUD_PROVIDER=aws $0 deploy             # Deploy to AWS"
    echo "  CLOUD_PROVIDER=azure $0 full             # Full Azure deployment"
}

# Main execution
case "$1" in
    check)
        check_prerequisites
        ;;
    setup)
        check_prerequisites
        setup_environment
        ;;
    build)
        build_images
        ;;
    deploy)
        check_prerequisites
        deploy_cloud
        push_images
        deploy_dashboard
        ;;
    local)
        check_prerequisites
        setup_environment
        start_local
        ;;
    full)
        check_prerequisites
        setup_environment
        build_images
        deploy_cloud
        push_images
        deploy_dashboard
        ;;
    *)
        usage
        exit 1
        ;;
esac

log "🎉 Deployment completed successfully!" 