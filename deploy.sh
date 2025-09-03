#!/bin/bash

# Data Ingest API Deployment Script for Podman
# This script builds and runs the containerized application

set -e

echo "🐳 Data Ingest API - Podman Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="data-ingest-app"
CONTAINER_NAME="data-ingest-api"
PORT="3000"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Podman is installed
if ! command -v podman &> /dev/null; then
    print_error "Podman is not installed. Please install Podman first."
    exit 1
fi

print_status "Podman version: $(podman --version)"

# Stop and remove existing container if it exists
if podman ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    print_warning "Container '${CONTAINER_NAME}' already exists. Stopping and removing..."
    podman stop ${CONTAINER_NAME} 2>/dev/null || true
    podman rm ${CONTAINER_NAME} 2>/dev/null || true
fi

# Remove existing image if it exists
if podman images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${IMAGE_NAME}:latest$"; then
    print_warning "Image '${IMAGE_NAME}:latest' already exists. Removing..."
    podman rmi ${IMAGE_NAME}:latest 2>/dev/null || true
fi

# Build the image
print_status "Building Docker image..."
podman build -t ${IMAGE_NAME}:latest .

if [ $? -eq 0 ]; then
    print_status "Image built successfully!"
else
    print_error "Failed to build image"
    exit 1
fi

# Run the container
print_status "Starting container..."
podman run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:3000 \
    --restart unless-stopped \
    ${IMAGE_NAME}:latest

if [ $? -eq 0 ]; then
    print_status "Container started successfully!"
else
    print_error "Failed to start container"
    exit 1
fi

# Wait a moment for the application to start
print_status "Waiting for application to start..."
sleep 5

# Check if container is running
if podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    print_status "Container is running!"
    
    # Show container logs
    print_status "Container logs:"
    podman logs ${CONTAINER_NAME} --tail 10
    
    echo ""
    print_status "🎉 Deployment completed successfully!"
    echo ""
    echo "📊 API Endpoints:"
    echo "   - Main API: http://localhost:${PORT}"
    echo "   - Health check: http://localhost:${PORT}/health"
    echo "   - AMD Final: http://localhost:${PORT}/amd_final"
    echo "   - Data Final: http://localhost:${PORT}/data_final"
    echo "   - RU Final: http://localhost:${PORT}/ru_final"
    echo ""
    echo "🔧 Useful commands:"
    echo "   - View logs: podman logs ${CONTAINER_NAME}"
    echo "   - Stop container: podman stop ${CONTAINER_NAME}"
    echo "   - Remove container: podman rm ${CONTAINER_NAME}"
    echo "   - Shell into container: podman exec -it ${CONTAINER_NAME} sh"
    
else
    print_error "Container failed to start"
    print_status "Container logs:"
    podman logs ${CONTAINER_NAME}
    exit 1
fi 