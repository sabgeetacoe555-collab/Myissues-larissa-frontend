#!/bin/bash

#############################################
# Health Check Script for Larissa Frontend
#############################################

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="larissaai.ca"
APP_NAME="larissa-frontend"

echo "Larissa Frontend Health Check"
echo "=============================="
echo ""

# Check Nginx
echo -n "Nginx Status: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}Running${NC}"
else
    echo -e "${RED}Not Running${NC}"
fi

# Check PM2 App
echo -n "Application Status: "
if sudo -u www-data pm2 list | grep -q ${APP_NAME}; then
    echo -e "${GREEN}Running${NC}"
else
    echo -e "${RED}Not Running${NC}"
fi

# Check URL Response
echo -n "Website Response: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN})
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}OK (${HTTP_CODE})${NC}"
else
    echo -e "${RED}Error (${HTTP_CODE})${NC}"
fi

# Check SSL Certificate
echo -n "SSL Certificate: "
if openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    echo -e "${GREEN}Valid${NC}"
else
    echo -e "${YELLOW}Warning${NC}"
fi

# Check API Endpoints
echo ""
echo "API Endpoints:"
for endpoint in "/api/chat" "/api/router" "/api/accountant" "/api/browser"; do
    echo -n "  ${endpoint}: "
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN}${endpoint})
    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 405 ]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}${HTTP_CODE}${NC}"
    fi
done

# Show PM2 status
echo ""
echo "PM2 Process Details:"
sudo -u www-data pm2 list

# Show memory usage
echo ""
echo "Memory Usage:"
free -h

# Show disk usage
echo ""
echo "Disk Usage:"
df -h | grep -E "Filesystem|/dev/"
