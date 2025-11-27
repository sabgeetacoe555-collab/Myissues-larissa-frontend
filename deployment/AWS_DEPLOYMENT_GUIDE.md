# 🚀 AWS Deployment Guide for Larissa AI Frontend
## Domain: larissaai.ca

This guide will help you deploy the Larissa Frontend to AWS EC2 and configure it for production use at larissaai.ca.

---

## 📋 Prerequisites

### AWS Requirements
- AWS EC2 Instance (Ubuntu 20.04/22.04 LTS)
- Minimum: t3.medium (2 vCPU, 4GB RAM)
- Recommended: t3.large (2 vCPU, 8GB RAM)
- Storage: 20GB+ SSD
- Security Group: Ports 80, 443, 22 open

### Domain Requirements
- Domain: larissaai.ca registered
- DNS A Record pointing to EC2 public IP
- DNS AAAA Record (if using IPv6)

### API Requirements
- Volcano SDK API endpoint configured
- Gen Computer LLM deployed
- Mathematician LLM deployed
- Child Agent service running

---

## 🔧 Quick Deployment (Automated)

### Step 1: Connect to AWS EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 2: Download and Run Deployment Script

```bash
# Download deployment script
curl -O https://raw.githubusercontent.com/myissues247/Myissues-larissa-frontend/main/deployment/scripts/deploy.sh

# Make it executable
chmod +x deploy.sh

# Run as root/sudo
sudo ./deploy.sh
```

The script will:
- ✅ Install Node.js 18
- ✅ Install PM2 process manager
- ✅ Install and configure Nginx
- ✅ Install Certbot for SSL
- ✅ Clone the repository
- ✅ Install dependencies
- ✅ Build the application
- ✅ Configure SSL certificate
- ✅ Start the application

### Step 3: Configure Environment Variables

```bash
# Edit the environment file
sudo nano /var/www/larissaai.ca/.env.local
```

**Update with your production values:**

```env
# Volcano SDK Configuration - Production
VOLCANO_BASE_URL=https://api.larissaai.ca
VOLCANO_API_KEY=your_production_api_key_here

# Child Agent Endpoints
GEN_COMPUTER_API_URL=https://api.larissaai.ca/gen-computer
MATHEMATICIAN_API_URL=https://api.larissaai.ca/mathematician
CHILD_AGENT_API_URL=https://api.larissaai.ca/child-agent

# LLM Wrapper Endpoint
LLM_WRAPPER_URL=https://api.larissaai.ca/llm-wrapper

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Larissa AI
NEXT_PUBLIC_APP_URL=https://larissaai.ca

# API Configuration
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3

# Security
ALLOWED_ORIGINS=https://larissaai.ca,https://www.larissaai.ca
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### Step 4: Restart Application

```bash
cd /var/www/larissaai.ca
sudo -u www-data pm2 restart larissa-frontend
```

### Step 5: Verify Deployment

```bash
# Run health check
sudo bash /var/www/larissaai.ca/deployment/scripts/health-check.sh
```

Visit: **https://larissaai.ca**

---

## 🔧 Manual Deployment (Step-by-Step)

### 1. Initial Server Setup

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx
```

### 2. Create Deployment Directory

```bash
sudo mkdir -p /var/www/larissaai.ca
sudo chown -R www-data:www-data /var/www/larissaai.ca
```

### 3. Clone Repository

```bash
cd /var/www
sudo -u www-data git clone https://github.com/myissues247/Myissues-larissa-frontend.git larissaai.ca
cd larissaai.ca
```

### 4. Install Dependencies

```bash
sudo -u www-data npm ci --production=false
```

### 5. Configure Environment

```bash
sudo -u www-data cp .env.production.example .env.local
sudo -u www-data nano .env.local
```

Update with your production values (see above).

### 6. Build Application

```bash
sudo -u www-data NODE_ENV=production npm run build
```

### 7. Configure Nginx

```bash
# Copy Nginx configuration
sudo cp deployment/nginx/larissaai.ca.conf /etc/nginx/sites-available/larissaai.ca
sudo ln -s /etc/nginx/sites-available/larissaai.ca /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 8. Obtain SSL Certificate

```bash
sudo certbot --nginx -d larissaai.ca -d www.larissaai.ca
```

### 9. Start with PM2

```bash
cd /var/www/larissaai.ca
sudo -u www-data pm2 start deployment/pm2/ecosystem.config.js --env production
sudo -u www-data pm2 save
sudo pm2 startup systemd -u www-data --hp /var/www
```

### 10. Configure PM2 Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔄 Updating the Application

### Quick Update

```bash
cd /var/www/larissaai.ca
sudo bash deployment/scripts/update.sh
```

### Manual Update

```bash
cd /var/www/larissaai.ca
sudo -u www-data git pull origin main
sudo -u www-data npm ci --production=false
sudo -u www-data NODE_ENV=production npm run build
sudo -u www-data pm2 restart larissa-frontend
```

---

## 📊 Monitoring and Maintenance

### Check Application Status

```bash
sudo -u www-data pm2 status
sudo -u www-data pm2 logs larissa-frontend
```

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/larissaai.access.log
sudo tail -f /var/log/nginx/larissaai.error.log
```

### Run Health Check

```bash
cd /var/www/larissaai.ca
sudo bash deployment/scripts/health-check.sh
```

### Monitor System Resources

```bash
# CPU and Memory
htop

# Disk usage
df -h

# Check PM2 metrics
sudo -u www-data pm2 monit
```

---

## 🔒 Security Configuration

### Firewall Setup (UFW)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### SSL Certificate Auto-Renewal

Certbot automatically sets up a cron job. Verify:

```bash
sudo systemctl status certbot.timer
```

Test renewal:

```bash
sudo certbot renew --dry-run
```

### Fail2Ban (Optional)

```bash
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🧪 Testing the Deployment

### 1. Test Website Accessibility

```bash
curl -I https://larissaai.ca
```

Expected: `HTTP/2 200`

### 2. Test API Endpoints

```bash
# Chat endpoint
curl -X POST https://larissaai.ca/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Gen Computer endpoint
curl -X POST https://larissaai.ca/api/gen-computer \
  -H "Content-Type: application/json" \
  -d '{"task":"Generate a Python function"}'

# Mathematician endpoint
curl -X POST https://larissaai.ca/api/mathematician \
  -H "Content-Type: application/json" \
  -d '{"task":"Solve x^2 + 5x + 6 = 0"}'
```

### 3. Test SSL

```bash
# Check SSL grade
curl -I https://larissaai.ca | grep -i ssl

# Full SSL test
openssl s_client -connect larissaai.ca:443 -servername larissaai.ca
```

### 4. Performance Test

```bash
# Install Apache Bench
sudo apt-get install -y apache2-utils

# Run load test
ab -n 100 -c 10 https://larissaai.ca/
```

---

## 🐛 Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
sudo -u www-data pm2 logs larissa-frontend --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart application
sudo -u www-data pm2 restart larissa-frontend
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
sudo -u www-data pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/larissaai.error.log

# Test Nginx config
sudo nginx -t
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Restart Nginx
sudo systemctl restart nginx
```

### Environment Variables Not Loading

```bash
# Check if .env.local exists
ls -la /var/www/larissaai.ca/.env.local

# Check file permissions
sudo chown www-data:www-data /var/www/larissaai.ca/.env.local

# Restart application
sudo -u www-data pm2 restart larissa-frontend
```

### High Memory Usage

```bash
# Check memory
free -h

# Restart PM2 with memory limit
sudo -u www-data pm2 restart larissa-frontend --max-memory-restart 800M

# Enable PM2 cluster mode for better resource usage
# (already configured in ecosystem.config.js)
```

---

## 📈 Performance Optimization

### Enable Gzip in Nginx

Already configured in `deployment/nginx/larissaai.ca.conf`

### Enable Caching

Configured for static files. To customize:

```bash
sudo nano /etc/nginx/sites-available/larissaai.ca
```

### PM2 Cluster Mode

Already enabled in `deployment/pm2/ecosystem.config.js`

```javascript
instances: 'max',  // Uses all CPU cores
exec_mode: 'cluster'
```

---

## 🔗 API Integration Checklist

### Before Going Live

- [ ] Volcano SDK API is accessible from EC2
- [ ] Gen Computer LLM is deployed and responding
- [ ] Mathematician LLM is deployed and responding
- [ ] Child Agent router is configured
- [ ] API keys are set in .env.local
- [ ] All endpoints return successful responses
- [ ] CORS is configured for larissaai.ca
- [ ] Rate limiting is working
- [ ] SSL certificate is valid

### Test Commands

```bash
# Test from EC2 instance
curl -X POST https://api.larissaai.ca/gen-computer \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"task":"test"}'

curl -X POST https://api.larissaai.ca/mathematician \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"task":"test"}'
```

---

## 📞 Post-Deployment Checklist

- [ ] Application is running (https://larissaai.ca)
- [ ] All 7 agents are accessible via UI
- [ ] SSL certificate is valid
- [ ] Health check passes
- [ ] API endpoints respond correctly
- [ ] PM2 is managing the process
- [ ] Nginx is serving requests
- [ ] Logs are being written
- [ ] Monitoring is active
- [ ] Backups are configured
- [ ] DNS is resolving correctly
- [ ] Firewall rules are set

---

## 📝 Maintenance Commands Reference

```bash
# Application Management
sudo -u www-data pm2 status                    # Check status
sudo -u www-data pm2 restart larissa-frontend  # Restart app
sudo -u www-data pm2 logs larissa-frontend     # View logs
sudo -u www-data pm2 monit                     # Monitor resources

# Nginx Management
sudo systemctl status nginx                    # Check status
sudo systemctl restart nginx                   # Restart Nginx
sudo nginx -t                                  # Test config

# SSL Management
sudo certbot certificates                      # List certificates
sudo certbot renew                             # Renew certificates

# System Management
df -h                                          # Disk usage
free -h                                        # Memory usage
top                                            # Process monitor

# Update Application
cd /var/www/larissaai.ca && sudo bash deployment/scripts/update.sh
```

---

## 🎉 Launch Checklist

### Final Steps Before Going Live

1. **Verify all environment variables are set correctly**
2. **Test all 7 agent endpoints**
3. **Run full health check**
4. **Test from external network**
5. **Check SSL certificate**
6. **Monitor logs for 10 minutes**
7. **Test under load**
8. **Verify HTTPS redirect works**
9. **Check error handling**
10. **Document any custom configurations**

### Launch Command

```bash
# Run final health check
sudo bash /var/www/larissaai.ca/deployment/scripts/health-check.sh

# If all green, announce:
echo "🎉 Larissa AI is LIVE at https://larissaai.ca"
```

---

## 📧 Support

For deployment issues:
- Check logs: `/var/log/nginx/` and PM2 logs
- Review this guide's troubleshooting section
- Check GitHub issues: https://github.com/myissues247/Myissues-larissa-frontend/issues

---

**Deployment Date**: November 27, 2025  
**Version**: 1.0.0  
**Domain**: https://larissaai.ca  
**Status**: Production Ready ✅
