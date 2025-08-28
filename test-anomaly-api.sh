#!/bin/bash

# Test FastAPI Anomaly Detection API Endpoints
# This script tests the deployed API endpoints

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

# Get the API URL from Terraform output
get_api_url() {
    print_status "Getting API URL from Terraform output..."
    
    cd infrastructure
    
    if [ ! -d ".terraform" ]; then
        print_error "Terraform not initialized. Please run terraform init first."
        exit 1
    fi
    
    API_URL=$(terraform output -raw container_app_url 2>/dev/null || echo "")
    
    if [ -z "$API_URL" ]; then
        print_error "Could not get API URL from Terraform output"
        exit 1
    fi
    
    print_success "API URL: $API_URL"
    cd ..
}

# Test health endpoint
test_health() {
    print_status "Testing health endpoint..."
    
    response=$(curl -s -w "%{http_code}" "$API_URL/health" -o /tmp/health_response.json)
    http_code="${response: -3}"
    
    if [ "$http_code" -eq 200 ]; then
        print_success "Health endpoint is working"
        echo "Response:"
        cat /tmp/health_response.json | jq '.' 2>/dev/null || cat /tmp/health_response.json
    else
        print_error "Health endpoint failed with HTTP code: $http_code"
        cat /tmp/health_response.json
    fi
}

# Test stats endpoint
test_stats() {
    print_status "Testing stats endpoint..."
    
    response=$(curl -s -w "%{http_code}" "$API_URL/stats" -o /tmp/stats_response.json)
    http_code="${response: -3}"
    
    if [ "$http_code" -eq 200 ]; then
        print_success "Stats endpoint is working"
        echo "Response:"
        cat /tmp/stats_response.json | jq '.' 2>/dev/null || cat /tmp/stats_response.json
    else
        print_error "Stats endpoint failed with HTTP code: $http_code"
        cat /tmp/stats_response.json
    fi
}

# Test heuristic detection endpoint
test_heuristic_detection() {
    print_status "Testing heuristic detection endpoint..."
    
    # Sample sensor data
    cat > /tmp/sensor_data.json << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "sensor_id": "test-sensor-001",
    "temperature": 25.5,
    "pressure": 1013.25,
    "humidity": 60.0,
    "flow_rate": 100.0,
    "vibration": 0.5
}
EOF
    
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d @/tmp/sensor_data.json \
        "$API_URL/detect/heuristic" \
        -o /tmp/heuristic_response.json)
    http_code="${response: -3}"
    
    if [ "$http_code" -eq 200 ]; then
        print_success "Heuristic detection endpoint is working"
        echo "Response:"
        cat /tmp/heuristic_response.json | jq '.' 2>/dev/null || cat /tmp/heuristic_response.json
    else
        print_error "Heuristic detection endpoint failed with HTTP code: $http_code"
        cat /tmp/heuristic_response.json
    fi
}

# Test statistical detection endpoint
test_statistical_detection() {
    print_status "Testing statistical detection endpoint..."
    
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d @/tmp/sensor_data.json \
        "$API_URL/detect/statistical" \
        -o /tmp/statistical_response.json)
    http_code="${response: -3}"
    
    if [ "$http_code" -eq 200 ]; then
        print_success "Statistical detection endpoint is working"
        echo "Response:"
        cat /tmp/statistical_response.json | jq '.' 2>/dev/null || cat /tmp/statistical_response.json
    else
        print_error "Statistical detection endpoint failed with HTTP code: $http_code"
        cat /tmp/statistical_response.json
    fi
}

# Test ML detection endpoint
test_ml_detection() {
    print_status "Testing ML detection endpoint..."
    
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d @/tmp/sensor_data.json \
        "$API_URL/detect/ml" \
        -o /tmp/ml_response.json)
    http_code="${response: -3}"
    
    if [ "$http_code" -eq 200 ]; then
        print_success "ML detection endpoint is working"
        echo "Response:"
        cat /tmp/ml_response.json | jq '.' 2>/dev/null || cat /tmp/ml_response.json
    else
        print_error "ML detection endpoint failed with HTTP code: $http_code"
        cat /tmp/ml_response.json
    fi
}

# Test API documentation
test_docs() {
    print_status "Testing API documentation..."
    
    response=$(curl -s -w "%{http_code}" "$API_URL/docs" -o /tmp/docs_response.html)
    http_code="${response: -3}"
    
    if [ "$http_code" -eq 200 ]; then
        print_success "API documentation is accessible"
        echo "Documentation URL: $API_URL/docs"
    else
        print_warning "API documentation not accessible (HTTP code: $http_code)"
    fi
}

# Clean up temporary files
cleanup() {
    rm -f /tmp/health_response.json
    rm -f /tmp/stats_response.json
    rm -f /tmp/heuristic_response.json
    rm -f /tmp/statistical_response.json
    rm -f /tmp/ml_response.json
    rm -f /tmp/sensor_data.json
    rm -f /tmp/docs_response.html
}

# Main test function
main() {
    print_status "Starting FastAPI Anomaly Detection API tests..."
    
    get_api_url
    test_health
    test_stats
    test_heuristic_detection
    test_statistical_detection
    test_ml_detection
    test_docs
    cleanup
    
    print_success "All tests completed!"
    print_status "API is ready for use at: $API_URL"
}

# Run main function
main "$@"
