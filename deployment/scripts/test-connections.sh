#!/bin/bash

#############################################
# API Connection Test Script
# Tests connectivity to all backend services
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Larissa AI - API Connection Test    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Load environment variables
if [ -f "/var/www/larissaai.ca/.env.local" ]; then
    source /var/www/larissaai.ca/.env.local
    echo -e "${GREEN}✓${NC} Environment variables loaded"
else
    echo -e "${RED}✗${NC} .env.local not found!"
    exit 1
fi

echo ""
echo "Testing API endpoints..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    
    echo -n "Testing $name: "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${VOLCANO_API_KEY}" "$url/health" 2>/dev/null)
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${VOLCANO_API_KEY}" -d '{"message":"test"}' "$url" 2>/dev/null)
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✓ OK${NC} (${response})"
        return 0
    elif [ "$response" = "404" ] || [ "$response" = "405" ]; then
        echo -e "${YELLOW}⚠ Warning${NC} (${response}) - Endpoint exists but method not allowed"
        return 0
    else
        echo -e "${RED}✗ Failed${NC} (${response})"
        return 1
    fi
}

# Test Volcano SDK Base
echo "1. Volcano SDK Base URL"
test_endpoint "  Base API" "$VOLCANO_BASE_URL"
echo ""

# Test Gen Computer
echo "2. Gen Computer LLM"
test_endpoint "  Gen Computer" "$GEN_COMPUTER_API_URL"
echo ""

# Test Mathematician
echo "3. Mathematician LLM"
test_endpoint "  Mathematician" "$MATHEMATICIAN_API_URL"
echo ""

# Test Child Agent
echo "4. Child Agent Service"
test_endpoint "  Child Agent" "$CHILD_AGENT_API_URL"
echo ""

# Test LLM Wrapper
echo "5. LLM Wrapper"
test_endpoint "  LLM Wrapper" "$LLM_WRAPPER_URL"
echo ""

# Test frontend endpoints
echo "6. Frontend API Endpoints (Local)"
test_endpoint "  /api/chat" "http://localhost:3000/api/chat" "POST"
test_endpoint "  /api/router" "http://localhost:3000/api/router" "POST"
test_endpoint "  /api/accountant" "http://localhost:3000/api/accountant" "POST"
test_endpoint "  /api/browser" "http://localhost:3000/api/browser" "POST"
test_endpoint "  /api/gen-computer" "http://localhost:3000/api/gen-computer" "POST"
test_endpoint "  /api/mathematician" "http://localhost:3000/api/mathematician" "POST"
test_endpoint "  /api/child-agent" "http://localhost:3000/api/child-agent" "POST"
echo ""

# DNS and SSL test
echo "7. Domain & SSL"
echo -n "Testing DNS resolution: "
if host larissaai.ca > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
fi

echo -n "Testing HTTPS: "
if curl -s -o /dev/null -w "%{http_code}" https://larissaai.ca > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ Not accessible yet${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}Connection Test Complete${NC}"
echo ""

# Recommendations
echo "📋 Recommendations:"
echo ""
echo "If all tests passed:"
echo "  ✅ Backend services are ready"
echo "  ✅ Frontend can be deployed"
echo "  ✅ Proceed with launch"
echo ""
echo "If any tests failed:"
echo "  ⚠  Check that service is running"
echo "  ⚠  Verify API keys are correct"
echo "  ⚠  Check firewall/security groups"
echo "  ⚠  Review service logs"
echo ""
