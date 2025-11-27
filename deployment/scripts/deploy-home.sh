#!/bin/bash

#############################################
# Larissa Frontend Home Directory Deployment
# Domain: larissaai.ca
# Author: Larissa Team
# Date: November 27, 2025
# This script deploys from ~/larissa-app to avoid permission issues
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="larissa-frontend"
DOMAIN="larissaai.ca"
DEPLOY_DIR="$HOME/larissa-app"
SOURCE_DIR="$HOME/Myissues-larissa-frontend"
NODE_VERSION="18"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Larissa Frontend Deployment v2.0    ║${NC}"
echo -e "${BLUE}║   (Home Directory - No Sudo Required)  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to print colored messages
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Step 1: Clean up old deployment
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE} Step 1/10: Cleaning previous deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "$DEPLOY_DIR" ]; then
    print_info "Removing old deployment directory..."
    rm -rf "$DEPLOY_DIR"
    print_status "Old deployment cleaned"
else
    print_info "No previous deployment found"
fi

# Clean npm cache in home directory
if [ -d "$HOME/.npm" ]; then
    print_info "Cleaning npm cache..."
    npm cache clean --force
    print_status "npm cache cleaned"
fi

# Step 2: Create fresh deployment directory
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE} Step 2/10: Creating deployment directory${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p "$DEPLOY_DIR"
print_status "Created: $DEPLOY_DIR"

# Step 3: Copy repository files
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE} Step 3/10: Copying application files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -d "$SOURCE_DIR" ]; then
    print_error "Source directory $SOURCE_DIR not found!"
    print_info "Please ensure the repository is cloned to $SOURCE_DIR"
    exit 1
fi

print_info "Copying files from $SOURCE_DIR..."
cp -r "$SOURCE_DIR"/* "$DEPLOY_DIR"/
print_status "Application files copied"

cd "$DEPLOY_DIR"

# Step 4: Verify Node.js and npm
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE} Step 4/10: Verifying Node.js environment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

NODE_CURRENT=$(node -v)
NPM_CURRENT=$(npm -v)
print_status "Node.js: $NODE_CURRENT"
print_status "npm: $NPM_CURRENT"

# Step 5: Install dependencies
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE} Step 5/10: Installing dependencies${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_info "Running npm ci with home cache..."
print_warning "This may take 3-5 minutes..."

# Use home directory cache and set proper ownership
npm ci --cache "$HOME/.npm" --prefer-offline

print_status "Dependencies installed successfully!"

# Step 6: Build the application
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE} Step 6/10: Building production bundle${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_info "Running Next.js build..."
print_warning "This may take 2-3 minutes..."

npm run build

print_status "Production build completed!"

# Step 7: Stop existing PM2 process
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE} Step 7/10: Managing PM2 process${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if pm2 list | grep -q "$APP_NAME"; then
    print_info "Stopping existing PM2 process..."
    pm2 stop "$APP_NAME"
    pm2 delete "$APP_NAME"
    print_status "Existing process stopped"
else
    print_info "No existing PM2 process found"
fi

# Step 8: Start application with PM2
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE} Step 8/10: Starting application${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_info "Starting with PM2..."
pm2 start npm --name "$APP_NAME" -- start

# Save PM2 process list
pm2 save

print_status "Application started successfully!"
print_info "PM2 process name: $APP_NAME"

# Step 9: Configure PM2 startup
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE} Step 9/10: Configuring PM2 startup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

print_info "Setting up PM2 to start on boot..."
PM2_STARTUP_CMD=$(pm2 startup | grep "sudo" || echo "")

if [ -n "$PM2_STARTUP_CMD" ]; then
    print_warning "Please run this command manually with sudo:"
    echo ""
    echo "$PM2_STARTUP_CMD"
    echo ""
else
    print_status "PM2 startup already configured"
fi

# Step 10: Configure Nginx
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE} Step 10/10: Configuring Nginx${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

if [ -f "deployment/nginx/larissaai.ca.conf" ]; then
    print_info "Nginx configuration found, installing..."
    
    # Create sites-available directory if it doesn't exist
    sudo mkdir -p /etc/nginx/sites-available
    sudo mkdir -p /etc/nginx/sites-enabled
    
    # Copy and enable Nginx config
    sudo cp deployment/nginx/larissaai.ca.conf "$NGINX_CONF"
    sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        sudo systemctl restart nginx
        print_status "Nginx configured and restarted"
    else
        print_warning "Nginx configuration test failed - please check manually"
    fi
else
    print_warning "Nginx config not found in deployment/nginx/"
    print_info "You'll need to configure Nginx manually"
fi

# Final summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Deployment Completed Successfully! ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 Deployment Summary:${NC}"
echo -e "   ${GREEN}✓${NC} Application: $APP_NAME"
echo -e "   ${GREEN}✓${NC} Directory: $DEPLOY_DIR"
echo -e "   ${GREEN}✓${NC} Node.js: $NODE_CURRENT"
echo -e "   ${GREEN}✓${NC} PM2 Status: Running"
echo ""
echo -e "${BLUE}🌐 Access Information:${NC}"
echo -e "   Local: http://localhost:3000"
echo -e "   Public: http://$(curl -s ifconfig.me):3000"
echo -e "   Domain: http://$DOMAIN (after DNS configured)"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "   1. Configure DNS: Point $DOMAIN A record to your server IP"
echo -e "   2. Setup SSL: sudo certbot --nginx -d $DOMAIN"
echo -e "   3. Configure environment: nano $DEPLOY_DIR/.env.local"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo -e "   View logs:     pm2 logs $APP_NAME"
echo -e "   Restart app:   pm2 restart $APP_NAME"
echo -e "   Stop app:      pm2 stop $APP_NAME"
echo -e "   PM2 status:    pm2 status"
echo -e "   Nginx status:  sudo systemctl status nginx"
echo ""
print_status "Deployment script completed!"
