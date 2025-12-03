# Larissa Interface (P1) - Production Launch Guide
## Official Domain: larissaai.ca

### 🎯 Deployment Status
- **EC2 Instance**: i-03d23863c0ea4dbc4 (3.98.96.136)
- **Region**: ca-central-1 (Canada Central)
- **Application**: Deployed to ~/larissa-app
- **Status**: ✅ Running on PM2, port 3000
- **Nginx**: ✅ Configured as reverse proxy

---

## 📋 Final Launch Steps

### Step 1: Configure AWS Route 53 DNS

**Option A: AWS Console (Manual)**
1. Go to AWS Console → Route 53 → Hosted Zones
2. Select `larissaai.ca` hosted zone
3. Create A Record:
   - Name: (blank)
   - Type: A
   - Value: 3.98.96.136
   - TTL: 300
4. Create WWW Record:
   - Name: www
   - Type: A
   - Value: 3.98.96.136
   - TTL: 300

**Option B: AWS CLI (Automated)**
```bash
# From your local machine with AWS CLI configured
cd deployment/aws
chmod +x configure-route53.sh
./configure-route53.sh
```

Or use the JSON configuration:
```bash
# Get your hosted zone ID
ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='larissaai.ca.'].Id" --output text | cut -d'/' -f3)

# Apply DNS configuration
aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch file://route53-config.json
```

### Step 2: Wait for DNS Propagation
```bash
# Check DNS propagation (wait 5-10 minutes)
dig larissaai.ca
dig www.larissaai.ca

# Verify it returns: 3.98.96.136
```

### Step 3: Configure SSL/HTTPS

**SSH to EC2 and run:**
```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@3.98.96.136

# Install SSL certificate
sudo certbot --nginx -d larissaai.ca -d www.larissaai.ca \
  --email admin@larissaai.ca \
  --agree-tos \
  --non-interactive \
  --redirect
```

Or use the automated script:
```bash
cd ~/larissa-app
chmod +x deployment/scripts/setup-ssl.sh
bash deployment/scripts/setup-ssl.sh
```

### Step 4: Configure Environment Variables

```bash
# Edit production environment
nano ~/larissa-app/.env.local
```

Add your production credentials:
```env
# Volcano SDK Configuration
VOLCANO_BASE_URL=https://your-volcano-api.com
VOLCANO_API_KEY=your_production_api_key

# Backend Agent APIs
GEN_COMPUTER_API_URL=https://gen-computer.larissaai.ca
MATHEMATICIAN_API_URL=https://mathematician.larissaai.ca
CHILD_AGENT_API_URL=https://child-agent.larissaai.ca
LLM_WRAPPER_URL=https://llm-wrapper.larissaai.ca

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://larissaai.ca
```

Restart the application:
```bash
pm2 restart larissa-frontend
pm2 save
```

### Step 5: Verify Deployment

**Security Check:**
```bash
# Test HTTPS
curl -I https://larissaai.ca

# Should return: HTTP/2 200
# Should include: Strict-Transport-Security header
```

**Application Check:**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs larissa-frontend --lines 50

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

**Access Points:**
- Primary: https://larissaai.ca
- WWW: https://www.larissaai.ca
- Direct IP: http://3.98.96.136:3000 (dev only)

---

## 🔒 Security Checklist

- [x] Application running on non-root user (ubuntu)
- [x] PM2 process manager with auto-restart
- [x] Nginx reverse proxy configured
- [ ] SSL/TLS certificate from Let's Encrypt
- [ ] HTTPS redirect enabled
- [ ] Security headers configured
- [ ] Environment variables secured

---

## 📊 AWS Resources

### EC2 Instance Details
```
Instance ID: i-03d23863c0ea4dbc4
Instance Type: t3.medium (2 vCPU, 4GB RAM)
AMI: Ubuntu 22.04 LTS
Public IP: 3.98.96.136
Region: ca-central-1
Availability Zone: ca-central-1a
```

### Required Security Group Rules
```
Inbound:
- Port 22 (SSH): Your IP only
- Port 80 (HTTP): 0.0.0.0/0
- Port 443 (HTTPS): 0.0.0.0/0

Outbound:
- All traffic: 0.0.0.0/0
```

### Route 53 Configuration
```
Hosted Zone: larissaai.ca
Records:
  - A: larissaai.ca → 3.98.96.136 (TTL: 300)
  - A: www.larissaai.ca → 3.98.96.136 (TTL: 300)
```

---

## 🚀 Post-Launch Monitoring

### PM2 Monitoring
```bash
pm2 monit                    # Real-time monitoring
pm2 logs larissa-frontend    # Application logs
pm2 status                   # Process status
```

### System Monitoring
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Network connections
sudo netstat -tulpn | grep LISTEN
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/larissaai.access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📝 Maintenance Commands

### Application Updates
```bash
cd ~/larissa-app
git pull origin main
npm ci --cache ~/.npm
npm run build
pm2 restart larissa-frontend
```

### SSL Certificate Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal (if needed)
sudo certbot renew --force-renewal
```

### Backup Configuration
```bash
# Backup environment
cp ~/.larissa-app/.env.local ~/backups/.env.local.$(date +%Y%m%d)

# Backup Nginx config
sudo cp /etc/nginx/sites-available/larissaai.ca ~/backups/nginx.conf.$(date +%Y%m%d)
```

---

## 🆘 Troubleshooting

### Application Not Starting
```bash
pm2 logs larissa-frontend --err --lines 100
pm2 restart larissa-frontend
```

### DNS Not Resolving
```bash
# Check DNS
dig larissaai.ca @8.8.8.8

# Flush DNS cache (if needed)
sudo systemd-resolve --flush-caches
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check Nginx SSL config
sudo nginx -t
```

### Port Already in Use
```bash
# Find process on port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

---

## 📞 Support Information

**AWS Account**: Your AWS account for larissaai.ca
**Domain Registrar**: Route 53 / Your domain registrar
**SSL Provider**: Let's Encrypt (auto-renewal enabled)
**Deployment**: EC2 Instance i-03d23863c0ea4dbc4

---

## ✅ Launch Verification Checklist

Before announcing the launch, verify:

- [ ] DNS resolves to 3.98.96.136
- [ ] HTTPS is active and valid
- [ ] Application loads at https://larissaai.ca
- [ ] All API endpoints are accessible
- [ ] Environment variables are configured
- [ ] PM2 is running and auto-restart enabled
- [ ] Nginx is serving requests correctly
- [ ] SSL certificate auto-renewal is configured
- [ ] Monitoring and logging are active
- [ ] Backup procedures are in place

---

**Last Updated**: December 3, 2025
**Version**: Production v1.0
**Status**: Ready for Launch 🚀
