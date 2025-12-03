#!/bin/bash

#############################################
# AWS Route 53 DNS Configuration Script
# Domain: larissaai.ca
# Target: EC2 Instance 3.98.96.136
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Route 53 DNS Configuration Setup    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Configuration
DOMAIN="larissaai.ca"
EC2_IP="3.98.96.136"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗${NC} AWS CLI is not installed"
    echo -e "${YELLOW}Install it with: pip install awscli${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} AWS CLI found"
echo ""

# Get Hosted Zone ID
echo -e "${BLUE}ℹ${NC} Finding hosted zone for ${DOMAIN}..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='${DOMAIN}.'].Id" --output text | cut -d'/' -f3)

if [ -z "$HOSTED_ZONE_ID" ]; then
    echo -e "${RED}✗${NC} Hosted zone for ${DOMAIN} not found"
    echo -e "${YELLOW}Please create a hosted zone in Route 53 first${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Hosted Zone ID: ${HOSTED_ZONE_ID}"
echo ""

# Create change batch
CHANGE_BATCH=$(cat <<EOF
{
  "Comment": "Production deployment DNS records for larissaai.ca",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${DOMAIN}",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "${EC2_IP}"}]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.${DOMAIN}",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "${EC2_IP}"}]
      }
    }
  ]
}
EOF
)

# Apply DNS changes
echo -e "${BLUE}ℹ${NC} Creating DNS records..."
CHANGE_ID=$(aws route53 change-resource-record-sets \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --change-batch "$CHANGE_BATCH" \
    --query "ChangeInfo.Id" \
    --output text)

if [ -z "$CHANGE_ID" ]; then
    echo -e "${RED}✗${NC} Failed to create DNS records"
    exit 1
fi

echo -e "${GREEN}✓${NC} DNS records created successfully"
echo -e "${BLUE}ℹ${NC} Change ID: ${CHANGE_ID}"
echo ""

# Wait for DNS propagation
echo -e "${BLUE}ℹ${NC} Waiting for DNS propagation (this may take 1-5 minutes)..."
aws route53 wait resource-record-sets-changed --id "$CHANGE_ID"

echo -e "${GREEN}✓${NC} DNS changes propagated"
echo ""

# Verify DNS records
echo -e "${BLUE}ℹ${NC} Verifying DNS configuration..."
sleep 10

ROOT_DNS=$(dig +short ${DOMAIN} @8.8.8.8 | tail -n1)
WWW_DNS=$(dig +short www.${DOMAIN} @8.8.8.8 | tail -n1)

echo ""
echo -e "${BLUE}DNS Verification Results:${NC}"
echo -e "  ${DOMAIN} → ${ROOT_DNS}"
echo -e "  www.${DOMAIN} → ${WWW_DNS}"
echo ""

if [ "$ROOT_DNS" == "$EC2_IP" ] && [ "$WWW_DNS" == "$EC2_IP" ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   DNS Configuration Successful!        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "  1. SSH to EC2: ssh -i your-key.pem ubuntu@${EC2_IP}"
    echo -e "  2. Setup SSL: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
    echo -e "  3. Access: https://${DOMAIN}"
else
    echo -e "${YELLOW}⚠${NC} DNS propagation may still be in progress"
    echo -e "${YELLOW}Please wait 5-10 minutes and verify manually${NC}"
fi
echo ""
