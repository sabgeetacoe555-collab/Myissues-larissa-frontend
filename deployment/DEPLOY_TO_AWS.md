# Deploy to AWS EC2 Instance

## Instance Details
- **Instance ID**: i-03d23863c0ea4dbc4
- **Public IP**: 3.98.96.136
- **Instance Type**: t3.medium (2 vCPUs)
- **Region**: ca-central-1 (Canada Central)
- **OS**: Ubuntu 22.04 LTS
- **Key Pair**: larissa-interface-key
- **Target Domain**: larissaai.ca

## Prerequisites Checklist

### 1. SSH Key Access
```powershell
# Verify you have the key file
Test-Path "path\to\larissa-interface-key.pem"
```

### 2. Security Group Configuration
Ensure the following ports are open in your AWS Security Group:
- **22** (SSH) - Your IP only
- **80** (HTTP) - 0.0.0.0/0
- **443** (HTTPS) - 0.0.0.0/0

### 3. DNS Configuration
Point your domain to the EC2 instance:
```
Type: A Record
Name: @ (root) or larissaai
Value: 3.98.96.136
TTL: 300
```

### 4. Backend API Services
Ensure these services are running and accessible:
- **Volcano SDK**: VOLCANO_BASE_URL
- **Gen Computer**: GEN_COMPUTER_API_URL
- **Mathematician**: MATHEMATICIAN_API_URL
- **Child Agent**: CHILD_AGENT_API_URL
- **LLM Wrapper**: LLM_WRAPPER_URL

## Deployment Steps

### Step 1: Connect to EC2
```powershell
# Set correct permissions (Windows)
icacls "path\to\larissa-interface-key.pem" /inheritance:r
icacls "path\to\larissa-interface-key.pem" /grant:r "${env:USERNAME}:R"

# Connect via SSH
ssh -i "path\to\larissa-interface-key.pem" ubuntu@3.98.96.136
```

### Step 2: Transfer Deployment Package
```powershell
# From your local machine (PowerShell)
scp -i "path\to\larissa-interface-key.pem" -r deployment ubuntu@3.98.96.136:~/
```

### Step 3: Create Environment File
```bash
# On EC2 instance
cd ~
nano .env.production

# Add the following (replace with actual values):
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://larissaai.ca

# Volcano SDK Configuration
VOLCANO_BASE_URL=your_volcano_api_url
VOLCANO_API_KEY=your_volcano_api_key

# Child Agent APIs
GEN_COMPUTER_API_URL=your_gen_computer_url
MATHEMATICIAN_API_URL=your_mathematician_url
CHILD_AGENT_API_URL=your_child_agent_url
LLM_WRAPPER_URL=your_llm_wrapper_url

# Optional: Request timeout (default 30000ms)
VOLCANO_TIMEOUT=30000
```

### Step 4: Run Automated Deployment
```bash
# Make script executable
chmod +x ~/deployment/scripts/deploy.sh

# Run deployment (will take 5-10 minutes)
sudo bash ~/deployment/scripts/deploy.sh

# Follow the prompts and enter your email for SSL certificate
```

### Step 5: Verify Deployment
```bash
# Run health check
bash ~/deployment/scripts/health-check.sh

# Test API connections
bash ~/deployment/scripts/test-connections.sh
```

## Post-Deployment Verification

### Check Services
```bash
# Nginx status
sudo systemctl status nginx

# PM2 status
pm2 status

# View application logs
pm2 logs larissa-frontend
```

### Test Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Frontend
curl http://localhost:3000/

# API endpoints
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Larissa"}'
```

### Access Your Application
- **Local**: http://3.98.96.136 (if DNS not configured yet)
- **Production**: https://larissaai.ca (after DNS propagation)

## Troubleshooting

### Nginx Not Starting
```bash
# Check config syntax
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### PM2 Application Errors
```bash
# Restart application
pm2 restart larissa-frontend

# View detailed logs
pm2 logs larissa-frontend --lines 100
```

### SSL Certificate Issues
```bash
# Test Certbot in dry-run mode
sudo certbot certonly --nginx --dry-run -d larissaai.ca

# Manual certificate generation
sudo certbot --nginx -d larissaai.ca --non-interactive --agree-tos --email your@email.com
```

### DNS Not Resolving
```bash
# Check DNS propagation
nslookup larissaai.ca
dig larissaai.ca

# Wait 5-60 minutes for DNS propagation
```

## Quick Update (After Initial Deployment)
```bash
# On EC2 instance
cd /var/www/larissaai.ca
sudo bash ~/deployment/scripts/update.sh
```

## Rollback
```bash
# Stop application
pm2 stop larissa-frontend

# Restore from git
cd /var/www/larissaai.ca
git reset --hard <previous-commit-hash>
npm ci
npm run build
pm2 restart larissa-frontend
```

## Monitoring

### View Real-Time Logs
```bash
# Application logs
pm2 logs larissa-frontend --lines 50

# Nginx access logs
sudo tail -f /var/log/nginx/larissaai.ca.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/larissaai.ca.error.log
```

### Resource Usage
```bash
# PM2 monitoring dashboard
pm2 monit

# System resources
htop
df -h
free -h
```

## Security Checklist
- [ ] SSH key permissions set correctly
- [ ] Security Group restricts SSH to your IP only
- [ ] Firewall configured (UFW)
- [ ] SSL certificate installed and auto-renewal enabled
- [ ] Environment variables secured (not committed to git)
- [ ] Nginx security headers enabled
- [ ] Rate limiting configured
- [ ] Regular security updates scheduled

## Support
- Deployment logs: `/var/log/larissa-deployment.log`
- PM2 logs: `/var/log/pm2/larissa-frontend-*.log`
- Nginx logs: `/var/log/nginx/larissaai.ca.*.log`

## Emergency Contacts
If deployment fails, check:
1. Internet connectivity on EC2
2. GitHub repository access
3. Backend API service availability
4. DNS configuration
5. AWS Security Group rules
