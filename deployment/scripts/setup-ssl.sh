#!/bin/bash

#############################################
# Complete SSL/HTTPS Setup for larissaai.ca
# Configures Let's Encrypt SSL Certificate
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SSL/HTTPS Certificate Setup          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

DOMAIN="larissaai.ca"
EMAIL="admin@larissaai.ca"

# Verify DNS is configured
echo -e "${BLUE}ℹ${NC} Verifying DNS configuration..."
ROOT_IP=$(dig +short ${DOMAIN} @8.8.8.8 | tail -n1)
WWW_IP=$(dig +short www.${DOMAIN} @8.8.8.8 | tail -n1)

echo -e "  ${DOMAIN} → ${ROOT_IP}"
echo -e "  www.${DOMAIN} → ${WWW_IP}"
echo ""

if [ -z "$ROOT_IP" ]; then
    echo -e "${RED}✗${NC} DNS not configured for ${DOMAIN}"
    echo -e "${YELLOW}Please configure DNS first and wait for propagation${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} DNS configuration verified"
echo ""

# Install Certbot if needed
if ! command -v certbot &> /dev/null; then
    echo -e "${BLUE}ℹ${NC} Installing Certbot..."
    sudo apt-get update -qq
    sudo apt-get install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✓${NC} Certbot installed"
else
    echo -e "${GREEN}✓${NC} Certbot already installed"
fi
echo ""

# Obtain SSL certificate
echo -e "${BLUE}ℹ${NC} Obtaining SSL certificate from Let's Encrypt..."
echo -e "${YELLOW}⚠${NC} This will configure HTTPS for ${DOMAIN} and www.${DOMAIN}"
echo ""

sudo certbot --nginx \
    -d ${DOMAIN} \
    -d www.${DOMAIN} \
    --email ${EMAIL} \
    --agree-tos \
    --non-interactive \
    --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   SSL Certificate Installed!           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Certificate Details:${NC}"
    sudo certbot certificates -d ${DOMAIN}
    echo ""
    echo -e "${GREEN}✓${NC} HTTPS is now active"
    echo -e "${GREEN}✓${NC} Auto-renewal configured"
    echo ""
    echo -e "${BLUE}Access your site:${NC}"
    echo -e "  https://${DOMAIN}"
    echo -e "  https://www.${DOMAIN}"
else
    echo -e "${RED}✗${NC} SSL certificate installation failed"
    echo -e "${YELLOW}Please check DNS propagation and try again${NC}"
    exit 1
fi
echo ""

# Test certificate renewal
echo -e "${BLUE}ℹ${NC} Testing certificate auto-renewal..."
sudo certbot renew --dry-run

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   HTTPS Setup Complete!                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
