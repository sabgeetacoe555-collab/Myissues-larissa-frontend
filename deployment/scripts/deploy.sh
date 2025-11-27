#!/bin/bash

#############################################
# Larissa Frontend AWS Deployment Script
# Domain: larissaai.ca
# Author: Larissa Team
# Date: November 27, 2025
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
DEPLOY_DIR="/var/www/${DOMAIN}"
REPO_URL="https://github.com/myissues247/Myissues-larissa-frontend.git"
NODE_VERSION="18"
BRANCH="main"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Larissa Frontend Deployment v1.0    ║${NC}"
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

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root or with sudo"
   exit 1
fi

print_info "Starting deployment process for ${DOMAIN}..."
echo ""

# Step 1: Update system packages
print_info "Step 1/12: Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
print_status "System packages updated"
echo ""

# Step 2: Install Node.js
print_info "Step 2/12: Installing Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    print_status "Node.js installed: $(node -v)"
else
    print_status "Node.js already installed: $(node -v)"
fi
echo ""

# Step 3: Install PM2
print_info "Step 3/12: Installing PM2 process manager..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u www-data --hp /var/www
    print_status "PM2 installed"
else
    print_status "PM2 already installed: $(pm2 -v)"
fi
echo ""

# Step 4: Install Nginx
print_info "Step 4/12: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
    print_status "Nginx installed"
else
    print_status "Nginx already installed"
fi
echo ""

# Step 5: Install Certbot for SSL
print_info "Step 5/12: Installing Certbot for SSL certificates..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
    print_status "Certbot installed"
else
    print_status "Certbot already installed"
fi
echo ""

# Step 6: Create deployment directory
print_info "Step 6/12: Creating deployment directory..."
mkdir -p ${DEPLOY_DIR}
mkdir -p /var/log/pm2
chown -R www-data:www-data ${DEPLOY_DIR}
chown -R www-data:www-data /var/log/pm2
print_status "Deployment directory created: ${DEPLOY_DIR}"
echo ""

# Step 7: Clone or update repository
print_info "Step 7/12: Cloning/updating repository..."
if [ -d "${DEPLOY_DIR}/.git" ]; then
    print_info "Repository exists, pulling latest changes..."
    cd ${DEPLOY_DIR}
    sudo -u www-data git fetch origin
    sudo -u www-data git reset --hard origin/${BRANCH}
    sudo -u www-data git pull origin ${BRANCH}
else
    print_info "Cloning repository..."
    sudo -u www-data git clone -b ${BRANCH} ${REPO_URL} ${DEPLOY_DIR}
    cd ${DEPLOY_DIR}
fi
print_status "Repository updated"
echo ""

# Step 8: Install dependencies
print_info "Step 8/12: Installing dependencies..."
cd ${DEPLOY_DIR}
sudo -u www-data npm ci --production=false
print_status "Dependencies installed"
echo ""

# Step 9: Setup environment variables
print_info "Step 9/12: Setting up environment variables..."
if [ ! -f "${DEPLOY_DIR}/.env.local" ]; then
    if [ -f "${DEPLOY_DIR}/.env.production.example" ]; then
        sudo -u www-data cp ${DEPLOY_DIR}/.env.production.example ${DEPLOY_DIR}/.env.local
        print_warning "Created .env.local from example. Please update with actual values!"
    else
        print_error ".env.production.example not found!"
        exit 1
    fi
else
    print_status "Environment file exists"
fi
echo ""

# Step 10: Build Next.js application
print_info "Step 10/12: Building Next.js application..."
cd ${DEPLOY_DIR}
sudo -u www-data NODE_ENV=production npm run build
print_status "Application built successfully"
echo ""

# Step 11: Configure Nginx
print_info "Step 11/12: Configuring Nginx..."
if [ -f "${DEPLOY_DIR}/deployment/nginx/larissaai.ca.conf" ]; then
    cp ${DEPLOY_DIR}/deployment/nginx/larissaai.ca.conf /etc/nginx/sites-available/${DOMAIN}
    ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl reload nginx
    print_status "Nginx configured"
else
    print_error "Nginx configuration file not found!"
    exit 1
fi
echo ""

# Step 12: Setup SSL Certificate
print_info "Step 12/12: Setting up SSL certificate..."
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    print_info "Obtaining SSL certificate from Let's Encrypt..."
    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} --redirect
    print_status "SSL certificate obtained"
else
    print_status "SSL certificate already exists"
fi
echo ""

# Start/Restart PM2
print_info "Starting application with PM2..."
cd ${DEPLOY_DIR}
if [ -f "${DEPLOY_DIR}/deployment/pm2/ecosystem.config.js" ]; then
    sudo -u www-data pm2 delete ${APP_NAME} 2>/dev/null || true
    sudo -u www-data pm2 start deployment/pm2/ecosystem.config.js --env production
    sudo -u www-data pm2 save
    print_status "Application started with PM2"
else
    print_error "PM2 ecosystem config not found!"
    exit 1
fi
echo ""

# Setup PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
print_status "PM2 log rotation configured"
echo ""

# Final checks
print_info "Running final checks..."
sleep 3

# Check if app is running
if sudo -u www-data pm2 list | grep -q ${APP_NAME}; then
    print_status "Application is running"
else
    print_error "Application failed to start"
    sudo -u www-data pm2 logs ${APP_NAME} --lines 50
    exit 1
fi

# Check Nginx status
if systemctl is-active --quiet nginx; then
    print_status "Nginx is running"
else
    print_error "Nginx is not running"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Deployment Completed Successfully  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
print_info "Application URL: https://${DOMAIN}"
print_info "Application Status: sudo -u www-data pm2 status"
print_info "Application Logs: sudo -u www-data pm2 logs ${APP_NAME}"
print_info "Nginx Logs: tail -f /var/log/nginx/larissaai.access.log"
echo ""
print_warning "IMPORTANT: Update .env.local with production API credentials!"
print_warning "File location: ${DEPLOY_DIR}/.env.local"
echo ""
print_info "Next steps:"
echo "  1. Update environment variables in ${DEPLOY_DIR}/.env.local"
echo "  2. Run: cd ${DEPLOY_DIR} && sudo -u www-data pm2 restart ${APP_NAME}"
echo "  3. Visit: https://${DOMAIN}"
echo ""
