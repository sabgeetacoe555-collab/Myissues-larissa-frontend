# 🚀 Quick Launch Commands for larissaai.ca

## Current Status
✅ Application deployed to EC2: 3.98.96.136
✅ Running on PM2 at port 3000
✅ Nginx configured
⏳ DNS configuration needed
⏳ SSL certificate needed

---

## Step 1: Configure DNS in AWS Route 53

### Option A: AWS Console (5 minutes)
1. Go to: https://console.aws.amazon.com/route53/
2. Click "Hosted zones" → Select `larissaai.ca`
3. Click "Create record"
4. Create TWO records:
   
   **Record 1 (Root domain):**
   - Record name: (leave blank)
   - Record type: A
   - Value: 3.98.96.136
   - TTL: 300
   - Click "Create records"
   
   **Record 2 (WWW subdomain):**
   - Record name: www
   - Record type: A
   - Value: 3.98.96.136
   - TTL: 300
   - Click "Create records"

### Option B: AWS CLI (1 minute)
```powershell
# From your PowerShell terminal
aws route53 list-hosted-zones --query "HostedZones[?Name=='larissaai.ca.'].Id" --output text

# Get the ZONE_ID from above, then run:
aws route53 change-resource-record-sets ^
  --hosted-zone-id YOUR_ZONE_ID ^
  --change-batch file://deployment/aws/route53-config.json
```

---

## Step 2: Verify DNS (Wait 5-10 minutes after Step 1)

```powershell
# Check if DNS is propagated
nslookup larissaai.ca
nslookup www.larissaai.ca

# Should show: 3.98.96.136
```

---

## Step 3: Setup SSL Certificate

**SSH to EC2:**
```powershell
ssh -i "C:\Users\kamran ali shah\Downloads\larissa-interface-key.pem" ubuntu@3.98.96.136
```

**On EC2, run:**
```bash
# Quick SSL setup
sudo certbot --nginx -d larissaai.ca -d www.larissaai.ca \
  --email admin@larissaai.ca \
  --agree-tos --non-interactive --redirect
```

---

## Step 4: Configure Environment Variables (Optional but Recommended)

```bash
# Still on EC2
nano ~/larissa-app/.env.local

# Add your production API credentials (example):
# VOLCANO_BASE_URL=https://api.volcano.com
# VOLCANO_API_KEY=your_key_here

# Restart application
pm2 restart larissa-frontend
```

---

## Step 5: Verify Launch

**Check these URLs in your browser:**
1. https://larissaai.ca
2. https://www.larissaai.ca
3. http://3.98.96.136:3000 (backup access)

**On EC2, verify services:**
```bash
pm2 status                    # Should show "online"
sudo systemctl status nginx   # Should show "active (running)"
sudo certbot certificates     # Should show valid certificate
```

---

## 🎯 Success Criteria

✅ DNS resolves: larissaai.ca → 3.98.96.136
✅ HTTPS is active with valid certificate
✅ Website loads at https://larissaai.ca
✅ HTTP automatically redirects to HTTPS
✅ PM2 shows application running
✅ No errors in logs

---

## 📊 Monitoring Commands (On EC2)

```bash
# Application logs
pm2 logs larissa-frontend

# Real-time monitoring
pm2 monit

# Nginx logs
sudo tail -f /var/log/nginx/larissaai.access.log

# System resources
htop
```

---

## 🆘 Quick Troubleshooting

**DNS not resolving?**
- Wait 10 more minutes for propagation
- Check Route 53 records are correct
- Use: `nslookup larissaai.ca 8.8.8.8`

**SSL certificate failed?**
- Ensure DNS is fully propagated first
- Check: `sudo certbot certificates`
- Retry: `sudo certbot --nginx -d larissaai.ca -d www.larissaai.ca`

**Application not loading?**
- Check: `pm2 status`
- Restart: `pm2 restart larissa-frontend`
- Logs: `pm2 logs larissa-frontend --lines 100`

**Nginx errors?**
- Test: `sudo nginx -t`
- Restart: `sudo systemctl restart nginx`
- Logs: `sudo tail -f /var/log/nginx/error.log`

---

## 📞 Important Information

**EC2 Instance:** i-03d23863c0ea4dbc4
**Public IP:** 3.98.96.136
**Region:** ca-central-1 (Canada Central)
**Domain:** larissaai.ca
**SSH Key:** larissa-interface-key.pem
**Application Path:** ~/larissa-app

---

## 🎉 After Launch

Once everything is verified:

1. ✅ Test all features on https://larissaai.ca
2. ✅ Verify backend API connections
3. ✅ Monitor logs for 24 hours
4. ✅ Set up automated backups (if needed)
5. ✅ Announce the launch! 🚀

---

**Timeline Estimate:**
- DNS Configuration: 5 minutes
- DNS Propagation: 5-10 minutes  
- SSL Setup: 2 minutes
- Total: ~15-20 minutes

**Ready for production! 🚀**
