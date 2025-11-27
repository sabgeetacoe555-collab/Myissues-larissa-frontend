# 🚀 IMMEDIATE DEPLOYMENT INSTRUCTIONS
## Larissa AI Frontend - Production Launch

**Domain**: https://larissaai.ca  
**Repository**: https://github.com/myissues247/Myissues-larissa-frontend  
**Date**: November 27, 2025

---

## ⚡ QUICK START (5 Minutes to Production)

### Prerequisites
- AWS EC2 instance running Ubuntu
- SSH access to server
- Domain `larissaai.ca` DNS pointing to server IP
- API endpoints ready:
  - Volcano SDK base URL
  - Gen Computer LLM
  - Mathematician LLM
  - Child Agent service

---

## 🎯 DEPLOYMENT STEPS

### 1. Connect to AWS Server

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. Run Automated Deployment

```bash
# Download and execute deployment script
curl -O https://raw.githubusercontent.com/myissues247/Myissues-larissa-frontend/main/deployment/scripts/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

**What this does:**
- ✅ Installs Node.js, PM2, Nginx, Certbot
- ✅ Clones repository to `/var/www/larissaai.ca`
- ✅ Installs dependencies and builds app
- ✅ Configures SSL with Let's Encrypt
- ✅ Starts application with PM2
- ✅ Sets up auto-restart and monitoring

**Estimated time**: 3-5 minutes

### 3. Configure API Endpoints

```bash
# Edit environment file
sudo nano /var/www/larissaai.ca/.env.local
```

**Update these critical values:**

```env
# Required - Replace with your actual values
VOLCANO_BASE_URL=https://api.larissaai.ca
VOLCANO_API_KEY=your_actual_production_key

# Child Agent Endpoints
GEN_COMPUTER_API_URL=https://api.larissaai.ca/gen-computer
MATHEMATICIAN_API_URL=https://api.larissaai.ca/mathematician
CHILD_AGENT_API_URL=https://api.larissaai.ca/child-agent
LLM_WRAPPER_URL=https://api.larissaai.ca/llm-wrapper

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Larissa AI
NEXT_PUBLIC_APP_URL=https://larissaai.ca
```

**Save and exit**: `Ctrl+X`, then `Y`, then `Enter`

### 4. Restart Application

```bash
cd /var/www/larissaai.ca
sudo -u www-data pm2 restart larissa-frontend
```

### 5. Verify Deployment

```bash
# Run health check
sudo bash /var/www/larissaai.ca/deployment/scripts/health-check.sh
```

**Expected output:**
```
✓ Nginx Status: Running
✓ Application Status: Running
✓ Website Response: OK (200)
✓ SSL Certificate: Valid
✓ API Endpoints: All OK
```

### 6. Test in Browser

Open: **https://larissaai.ca**

You should see:
- ✅ Larissa AI interface
- ✅ 7 agent buttons (Chat, Router, Accountant, Browser, Gen Computer, Mathematician, Child Agent)
- ✅ Green padlock (SSL)
- ✅ No console errors

---

## 🧪 POST-DEPLOYMENT TESTING

### Test Each Agent

```bash
# Test Chat
curl -X POST https://larissaai.ca/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Test Gen Computer
curl -X POST https://larissaai.ca/api/gen-computer \
  -H "Content-Type: application/json" \
  -d '{"task":"Write a hello world function"}'

# Test Mathematician
curl -X POST https://larissaai.ca/api/mathematician \
  -H "Content-Type: application/json" \
  -d '{"task":"Solve 2x + 5 = 15"}'

# Test Child Agent (auto-routing)
curl -X POST https://larissaai.ca/api/child-agent \
  -H "Content-Type: application/json" \
  -d '{"task":"Calculate the factorial of 10"}'
```

**All should return `{"success":true,...}`**

---

## 📊 MONITORING

### Check Application Status

```bash
# PM2 status
sudo -u www-data pm2 status

# View logs
sudo -u www-data pm2 logs larissa-frontend

# Monitor in real-time
sudo -u www-data pm2 monit
```

### Check Nginx

```bash
# Status
sudo systemctl status nginx

# Access logs
sudo tail -f /var/log/nginx/larissaai.access.log

# Error logs
sudo tail -f /var/log/nginx/larissaai.error.log
```

---

## 🔄 UPDATES

### Quick Update (Without Downtime)

```bash
cd /var/www/larissaai.ca
sudo bash deployment/scripts/update.sh
```

This will:
1. Pull latest code
2. Install dependencies
3. Rebuild application
4. Restart with zero downtime

---

## 🐛 TROUBLESHOOTING

### Problem: Application won't start

```bash
# Check logs
sudo -u www-data pm2 logs larissa-frontend --lines 50

# Restart
sudo -u www-data pm2 restart larissa-frontend
```

### Problem: 502 Bad Gateway

```bash
# Check if app is running
sudo -u www-data pm2 status

# Check port 3000
sudo lsof -i :3000

# Restart Nginx
sudo systemctl restart nginx
```

### Problem: SSL certificate error

```bash
# Check certificate
sudo certbot certificates

# Renew
sudo certbot renew --force-renewal
```

### Problem: API endpoints not working

```bash
# Verify environment variables
cat /var/www/larissaai.ca/.env.local

# Test API connectivity from server
curl -v https://api.larissaai.ca/health
```

---

## ✅ PRODUCTION CHECKLIST

Before announcing launch:

- [ ] Website loads at https://larissaai.ca
- [ ] SSL certificate is valid (green padlock)
- [ ] All 7 agents visible in UI
- [ ] Test message sends successfully
- [ ] Each agent endpoint returns 200 OK
- [ ] Logs show no errors
- [ ] PM2 shows app running
- [ ] Health check passes
- [ ] DNS resolves correctly
- [ ] Firewall allows ports 80, 443

---

## 🎉 LAUNCH ANNOUNCEMENT

Once all checks pass:

```bash
# Final verification
sudo bash /var/www/larissaai.ca/deployment/scripts/health-check.sh

# If all green:
echo "✅ Larissa AI is LIVE at https://larissaai.ca"
```

**Announce to team:**
> 🚀 **Larissa AI is now LIVE!**
> 
> **URL**: https://larissaai.ca
> 
> **Features**:
> - 7 specialized AI agents
> - Real-time chat interface
> - Production-grade infrastructure
> - SSL secured
> - Auto-scaling with PM2
> 
> **Agents Available**:
> 1. 💬 Chat - General conversation
> 2. 🔀 Router - Intelligent routing
> 3. 💼 Accountant - Finance & tax
> 4. 🔍 Browser - Web search
> 5. 💻 Gen Computer - Code generation
> 6. 📐 Mathematician - Math solving
> 7. 🤖 Child Agent - Auto-routing

---

## 📞 SUPPORT

### If deployment fails:

1. Check deployment logs: `/var/log/larissa-deployment.log`
2. Review AWS deployment guide: `deployment/AWS_DEPLOYMENT_GUIDE.md`
3. Contact DevOps team
4. Check GitHub issues: https://github.com/myissues247/Myissues-larissa-frontend/issues

### Key Files

- **Deployment Script**: `deployment/scripts/deploy.sh`
- **Update Script**: `deployment/scripts/update.sh`
- **Health Check**: `deployment/scripts/health-check.sh`
- **Nginx Config**: `deployment/nginx/larissaai.ca.conf`
- **PM2 Config**: `deployment/pm2/ecosystem.config.js`
- **Full Guide**: `deployment/AWS_DEPLOYMENT_GUIDE.md`

---

## 🔐 SECURITY NOTES

### Immediately After Deployment:

1. **Change default SSH port** (optional but recommended)
2. **Set up Fail2Ban** for brute force protection
3. **Enable firewall** (UFW)
4. **Rotate API keys** regularly
5. **Set up monitoring** (CloudWatch, DataDog, etc.)
6. **Configure backups** for `/var/www/larissaai.ca`

### Firewall Setup:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📈 NEXT STEPS

After successful launch:

1. **Monitor for 24 hours** - Watch logs and metrics
2. **Set up automated backups** - Daily snapshots
3. **Configure CDN** (CloudFlare) - For better performance
4. **Enable monitoring** - Uptime checks, error tracking
5. **Load testing** - Verify can handle traffic
6. **Document any issues** - Update troubleshooting guide
7. **Train team** - On deployment and maintenance

---

**Deployment Prepared**: November 27, 2025  
**Ready for**: Immediate Production Launch  
**Estimated Deployment Time**: 5-10 minutes  
**Status**: ✅ Ready to Deploy

---

## 🚨 EMERGENCY ROLLBACK

If critical issues occur after deployment:

```bash
cd /var/www/larissaai.ca
sudo -u www-data git log --oneline -5  # View recent commits
sudo -u www-data git reset --hard COMMIT_HASH  # Rollback to previous version
sudo -u www-data npm ci
sudo -u www-data npm run build
sudo -u www-data pm2 restart larissa-frontend
```

---

**GO/NO-GO Decision Point**

✅ **GO**: If all prerequisites met and API endpoints ready  
❌ **NO-GO**: If API endpoints not responding or DNS not configured

**When ready, execute Step 1 above to begin deployment.**

🎯 **Target Launch**: Within next 10 minutes of receiving GO signal
