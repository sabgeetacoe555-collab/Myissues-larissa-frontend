# Quick Deploy Commands for EC2: 3.98.96.136

## 🚀 Copy & Paste Deployment

### 1. Connect to EC2
```powershell
# Windows PowerShell - Set key permissions first
icacls "C:\path\to\larissa-interface-key.pem" /inheritance:r
icacls "C:\path\to\larissa-interface-key.pem" /grant:r "${env:USERNAME}:R"

# SSH into instance
ssh -i "C:\path\to\larissa-interface-key.pem" ubuntu@3.98.96.136
```

### 2. One-Line Deployment (on EC2)
```bash
# Clone, configure, and deploy in one command
cd ~ && git clone https://github.com/myissues247/Myissues-larissa-frontend.git larissa && cd larissa && sudo bash deployment/scripts/deploy.sh
```

### 3. Manual Step-by-Step (Alternative)

#### On EC2 Instance:
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
cd /var/www
sudo git clone https://github.com/myissues247/Myissues-larissa-frontend.git larissaai.ca
sudo chown -R ubuntu:ubuntu larissaai.ca
cd larissaai.ca

# Create environment file
cat > .env.local << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://larissaai.ca

# Replace these with your actual API endpoints
VOLCANO_BASE_URL=https://your-volcano-api.com
VOLCANO_API_KEY=your_api_key_here
GEN_COMPUTER_API_URL=https://your-gen-computer.com
MATHEMATICIAN_API_URL=https://your-mathematician.com
CHILD_AGENT_API_URL=https://your-child-agent.com
LLM_WRAPPER_URL=https://your-llm-wrapper.com
EOF

# Install dependencies and build
npm ci
npm run build

# Start with PM2
pm2 start npm --name "larissa-frontend" -- start
pm2 save
pm2 startup

# Install and configure Nginx
sudo apt-get install -y nginx
sudo cp deployment/nginx/larissaai.ca.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/larissaai.ca.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL (requires DNS to be configured first)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d larissaai.ca --non-interactive --agree-tos --email your@email.com
```

## 📋 Pre-Deployment Checklist

### Before You Deploy:
- [ ] **SSH Key**: You have `larissa-interface-key.pem` file
- [ ] **Security Group**: Ports 22, 80, 443 are open
- [ ] **DNS**: `larissaai.ca` A record points to `3.98.96.136`
- [ ] **API Services**: Backend services are running and accessible
- [ ] **API URLs**: You have all backend API endpoints ready

### Critical Environment Variables Needed:
```bash
VOLCANO_BASE_URL=         # Volcano SDK endpoint
VOLCANO_API_KEY=          # Volcano API key
GEN_COMPUTER_API_URL=     # Gen Computer service
MATHEMATICIAN_API_URL=    # Mathematician service
CHILD_AGENT_API_URL=      # Child Agent service
LLM_WRAPPER_URL=          # LLM Wrapper service
```

## 🔍 Verify Deployment

```bash
# Check services
sudo systemctl status nginx
pm2 status

# Test health endpoint
curl http://localhost:3000/health

# Test API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Larissa"}'

# Check logs
pm2 logs larissa-frontend
```

## 🌐 Access Your Application

- **Direct IP**: http://3.98.96.136
- **Domain** (after DNS): https://larissaai.ca

## 🔄 Quick Update

```bash
cd /var/www/larissaai.ca
git pull origin main
npm ci
npm run build
pm2 restart larissa-frontend
```

## 🛑 Emergency Stop

```bash
pm2 stop larissa-frontend
sudo systemctl stop nginx
```

## 📊 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs larissa-frontend --lines 100

# System resources
htop
df -h
free -h
```

## Instance Details Reference
- **Instance ID**: i-03d23863c0ea4dbc4
- **Public IP**: 3.98.96.136
- **Region**: ca-central-1
- **Type**: t3.medium (2 vCPUs, 4GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **SSH User**: ubuntu
