#!/bin/bash

# UI Service Deployment Script
set -e

echo "🚀 Deploying UI Service (Frontend)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${YELLOW}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Change to deployment directory
cd "$(dirname "$0")"

# Load environment variables (skip comments and empty lines)
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

print_status "Building UI Service Docker image..."
docker build -t memetomoney/ui-service:latest -f Dockerfile ..

print_status "Starting UI Service..."
docker-compose up -d

print_status "Waiting for service to be ready..."
timeout 60 bash -c 'until curl -f http://localhost:3000; do sleep 2; done'

print_success "UI Service deployed successfully!"
echo "🌐 Frontend available at: http://localhost:3000"

# Show service status
docker-compose ps