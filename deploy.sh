#!/bin/bash
set -e

# Memesis Production Deployment Script
# This script should be run on the EC2 instance

echo "=== Memesis Deployment Script ==="

# Configuration
ECR_REGISTRY="271882567315.dkr.ecr.eu-west-1.amazonaws.com"
BACKEND_REPOSITORY="memesis-app"
FRONTEND_REPOSITORY="memesis-web"
AWS_REGION="eu-west-1"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create .env file from .env.prod.example"
    exit 1
fi

echo "1. Authenticating with AWS ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin ${ECR_REGISTRY}

echo "2. Pulling latest images from ECR..."
docker pull ${ECR_REGISTRY}/${BACKEND_REPOSITORY}:latest
docker pull ${ECR_REGISTRY}/${FRONTEND_REPOSITORY}:latest

echo "3. Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

echo "4. Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "5. Waiting for services to be healthy..."
sleep 10

echo "6. Checking service status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=== Deployment Complete ==="
echo "Application should be available on port 80"
echo ""
echo "View logs with:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Check health:"
echo "  curl http://localhost/health      # Frontend"
echo "  curl http://localhost/api/ping    # Backend API"
