#!/bin/bash

# Docker Debug Script for Blog Generator Services
echo "🐳 Docker Debug Script for Blog Generator"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Docker installation
echo -e "\n${BLUE}1. Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    echo -e "  ${GREEN}✓ Docker is installed${NC}"
    docker --version
else
    echo -e "  ${RED}✗ Docker is not installed${NC}"
    exit 1
fi

# Check Docker daemon
echo -e "\n${BLUE}2. Checking Docker daemon...${NC}"
if docker info &> /dev/null; then
    echo -e "  ${GREEN}✓ Docker daemon is running${NC}"
else
    echo -e "  ${RED}✗ Docker daemon is not running${NC}"
    echo "  Start Docker Desktop or Docker daemon"
    exit 1
fi

# Check if we're in the right directory
echo -e "\n${BLUE}3. Checking project structure...${NC}"
if [ -f "services/Dockerfile" ] && [ -f "services/requirements.txt" ]; then
    echo -e "  ${GREEN}✓ Project structure looks correct${NC}"
else
    echo -e "  ${RED}✗ Missing services/Dockerfile or services/requirements.txt${NC}"
    echo "  Make sure you're in the blog-generator directory"
    ls -la services/
    exit 1
fi

# Check environment file
echo -e "\n${BLUE}4. Checking environment configuration...${NC}"
if [ -f "services/.env" ]; then
    echo -e "  ${GREEN}✓ .env file exists${NC}"
    if grep -q "OPENAI_API_KEY" services/.env; then
        echo -e "  ${GREEN}✓ OpenAI API key is configured${NC}"
    else
        echo -e "  ${YELLOW}⚠ OpenAI API key not found in .env${NC}"
    fi
elif [ -f ".env" ]; then
    echo -e "  ${GREEN}✓ .env file exists in root${NC}"
    if grep -q "OPENAI_API_KEY" .env; then
        echo -e "  ${GREEN}✓ OpenAI API key is configured${NC}"
    else
        echo -e "  ${YELLOW}⚠ OpenAI API key not found in .env${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠ No .env file found${NC}"
    echo "  Create .env file with: OPENAI_API_KEY=your_key_here"
fi

# Try building the services image
echo -e "\n${BLUE}5. Building services Docker image...${NC}"
echo "  This may take a few minutes..."

if docker build -t blog-generator-services ./services; then
    echo -e "  ${GREEN}✓ Services image built successfully${NC}"
else
    echo -e "  ${RED}✗ Failed to build services image${NC}"
    echo "  Check the error messages above"
    exit 1
fi

# Try running the container
echo -e "\n${BLUE}6. Testing container startup...${NC}"
echo "  Starting container in detached mode..."

# Stop any existing container
docker stop blog-generator-api-test &> /dev/null
docker rm blog-generator-api-test &> /dev/null

# Start container
if [ -f ".env" ]; then
    ENV_FILE="--env-file .env"
elif [ -f "services/.env" ]; then
    ENV_FILE="--env-file services/.env"
else
    ENV_FILE=""
fi

CONTAINER_ID=$(docker run -d --name blog-generator-api-test -p 8001:8000 $ENV_FILE blog-generator-services)

if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓ Container started successfully${NC}"
    echo "  Container ID: $CONTAINER_ID"
    
    # Wait for startup
    echo "  Waiting for service to start..."
    sleep 10
    
    # Check if container is still running
    if docker ps -q -f name=blog-generator-api-test | grep -q .; then
        echo -e "  ${GREEN}✓ Container is running${NC}"
        
        # Test health endpoint
        echo "  Testing health endpoint..."
        if curl -s http://localhost:8001/health > /dev/null; then
            echo -e "  ${GREEN}✓ Health endpoint is responding${NC}"
        else
            echo -e "  ${YELLOW}⚠ Health endpoint not responding yet${NC}"
        fi
        
        # Show logs
        echo "  Container logs:"
        docker logs blog-generator-api-test | tail -10
        
    else
        echo -e "  ${RED}✗ Container stopped unexpectedly${NC}"
        echo "  Container logs:"
        docker logs blog-generator-api-test
    fi
    
    # Cleanup
    echo -e "\n${BLUE}7. Cleaning up test container...${NC}"
    docker stop blog-generator-api-test
    docker rm blog-generator-api-test
    
else
    echo -e "  ${RED}✗ Failed to start container${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Docker services debug completed successfully!${NC}"
echo ""
echo "To run the services:"
echo "  docker-compose up -d                    # Production"
echo "  docker-compose -f docker-compose.dev.yml up  # Development"
echo ""
echo "To check logs:"
echo "  docker-compose logs -f"
echo ""