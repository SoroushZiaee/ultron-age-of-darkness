#!/bin/bash

# Integration Test Script for Blog Generator
echo "🧪 Testing Blog Generator Integration"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check if services are running
echo -e "\n${BLUE}Test 1: Checking if services are running...${NC}"

# Check API Gateway
echo -n "  API Gateway (port 8000): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health | grep -q "200"; then
    echo -e "${GREEN}✓ Online${NC}"
    API_ONLINE=true
else
    echo -e "${RED}✗ Offline${NC}"
    API_ONLINE=false
fi

# Check Frontend
echo -n "  Frontend (port 3000): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo -e "${GREEN}✓ Online${NC}"
    FRONTEND_ONLINE=true
else
    echo -e "${RED}✗ Offline${NC}"
    FRONTEND_ONLINE=false
fi

# Test 2: API Health Check
echo -e "\n${BLUE}Test 2: API Health Check...${NC}"
if [ "$API_ONLINE" = true ]; then
    HEALTH_RESPONSE=$(curl -s http://localhost:8000/health)
    echo "  Health Response: $HEALTH_RESPONSE"
    
    if echo "$HEALTH_RESPONSE" | grep -q "online"; then
        echo -e "  ${GREEN}✓ API Health Check Passed${NC}"
    else
        echo -e "  ${YELLOW}⚠ API Health Check Warning${NC}"
    fi
else
    echo -e "  ${RED}✗ Cannot test - API is offline${NC}"
fi

# Test 3: Test Blog Generation (Quick test)
echo -e "\n${BLUE}Test 3: Testing Blog Generation API...${NC}"
if [ "$API_ONLINE" = true ]; then
    echo "  Starting blog generation..."
    
    # Start generation
    GENERATE_RESPONSE=$(curl -s -X POST http://localhost:8000/generate \
        -H "Content-Type: application/json" \
        -d '{
            "topic": "AI Integration Test",
            "word_count": 500,
            "tone": "conversational",
            "paper_count": 3,
            "include_faq": false,
            "include_statistics": false,
            "include_examples": false
        }')
    
    if echo "$GENERATE_RESPONSE" | grep -q "session_id"; then
        SESSION_ID=$(echo "$GENERATE_RESPONSE" | grep -o '"session_id":"[^"]*"' | cut -d'"' -f4)
        echo -e "  ${GREEN}✓ Generation started${NC} (Session: $SESSION_ID)"
        
        # Check status a few times
        echo "  Checking generation status..."
        for i in {1..5}; do
            sleep 2
            STATUS_RESPONSE=$(curl -s "http://localhost:8000/status/$SESSION_ID")
            STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
            echo "    Status check $i: $STATUS"
            
            if [ "$STATUS" = "completed" ]; then
                echo -e "  ${GREEN}✓ Blog generation completed successfully!${NC}"
                break
            elif [ "$STATUS" = "error" ]; then
                echo -e "  ${RED}✗ Blog generation failed${NC}"
                echo "    Error response: $STATUS_RESPONSE"
                break
            fi
        done
        
        # Clean up session
        curl -s -X DELETE "http://localhost:8000/session/$SESSION_ID" > /dev/null
        
    else
        echo -e "  ${RED}✗ Failed to start generation${NC}"
        echo "    Response: $GENERATE_RESPONSE"
    fi
else
    echo -e "  ${RED}✗ Cannot test - API is offline${NC}"
fi

# Test 4: Check Docker containers (if running in Docker)
echo -e "\n${BLUE}Test 4: Docker Status...${NC}"
if command -v docker &> /dev/null; then
    CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep "blog-generator")
    if [ -n "$CONTAINERS" ]; then
        echo "  Docker containers:"
        echo "$CONTAINERS" | sed 's/^/    /'
    else
        echo -e "  ${YELLOW}⚠ No blog-generator Docker containers running${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠ Docker not available${NC}"
fi

# Summary
echo -e "\n${BLUE}Integration Test Summary:${NC}"
echo "========================"

if [ "$API_ONLINE" = true ] && [ "$FRONTEND_ONLINE" = true ]; then
    echo -e "${GREEN}✓ All services are running${NC}"
    echo -e "${GREEN}✓ Ready for blog generation${NC}"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 API Docs: http://localhost:8000/docs"
    echo "📊 API Health: http://localhost:8000/health"
elif [ "$API_ONLINE" = true ]; then
    echo -e "${YELLOW}⚠ API is running but frontend is offline${NC}"
    echo "  Start frontend with: cd frontend && npm run dev"
elif [ "$FRONTEND_ONLINE" = true ]; then
    echo -e "${YELLOW}⚠ Frontend is running but API is offline${NC}"
    echo "  Start API with: cd services && python api_gateway.py"
else
    echo -e "${RED}✗ Both services are offline${NC}"
    echo "  Start with Docker: docker-compose up -d"
    echo "  Or start manually:"
    echo "    API: cd services && python api_gateway.py"
    echo "    Frontend: cd frontend && npm run dev"
fi

echo ""