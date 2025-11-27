#!/bin/bash

#############################################
# Quick Update Script for Larissa Frontend
# Use this for fast updates without full redeployment
#############################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="larissa-frontend"
DEPLOY_DIR="/var/www/larissaai.ca"

echo -e "${BLUE}Updating Larissa Frontend...${NC}"

cd ${DEPLOY_DIR}

# Pull latest changes
echo "Pulling latest changes..."
sudo -u www-data git pull origin main

# Install any new dependencies
echo "Installing dependencies..."
sudo -u www-data npm ci --production=false

# Rebuild application
echo "Building application..."
sudo -u www-data NODE_ENV=production npm run build

# Restart PM2
echo "Restarting application..."
sudo -u www-data pm2 restart ${APP_NAME}

echo -e "${GREEN}✓ Update completed successfully!${NC}"
sudo -u www-data pm2 status
