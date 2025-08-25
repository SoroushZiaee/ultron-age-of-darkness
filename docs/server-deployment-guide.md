# Server Deployment Guide - Intelligent Hub

This guide will walk you through deploying the Intelligent Hub application to your production server with nginx authentication.

## Server Information
- **Server IP**: 34.129.252.73
- **SSH Access**: `ssh -i ~/.ssh/my-gce-key soroushziaee@34.129.252.73`
- **Domain**: intelligent.myfastmedical.ca
- **Protection**: Nginx Basic Authentication (username/password)

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] SSH access to your server
- [ ] Domain DNS configured to point to server IP
- [ ] OpenAI API key for blog generator
- [ ] Local project files ready for deployment

## Step 1: Server Initial Setup

### 1.1 Connect to Server
```bash
ssh -i ~/.ssh/my-gce-key soroushziaee@34.129.252.73
```

### 1.2 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install Required Packages
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Install Apache utils for password generation
sudo apt install apache2-utils -y

# Logout and login again for docker group to take effect
exit
```

### 1.4 Reconnect and Verify Installation
```bash
ssh -i ~/.ssh/my-gce-key soroushziaee@34.129.252.73
docker --version
docker compose version
nginx -v
```

## Step 2: Current Server Analysis and Nginx Check

### 2.1 Analyze Current Nginx Configuration
Before making any changes, let's analyze the current state of nginx on the server:

```bash
# Check if nginx is already running
sudo systemctl status nginx

# Check current nginx configuration
sudo nginx -t

# List current enabled sites
ls -la /etc/nginx/sites-enabled/

# Check current nginx configuration files
ls -la /etc/nginx/sites-available/

# View default nginx configuration (if exists)
cat /etc/nginx/sites-available/default

# Check if nginx is listening on ports 80/443
sudo netstat -tulpn | grep nginx
sudo ss -tulpn | grep nginx

# Check current nginx processes
ps aux | grep nginx

# View nginx access and error logs
sudo tail -20 /var/log/nginx/access.log
sudo tail -20 /var/log/nginx/error.log
```

### 2.2 Backup Existing Nginx Configuration
```bash
# Create backup directory
sudo mkdir -p /opt/nginx-backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/nginx-backup/$(date +%Y%m%d_%H%M%S)"

# Backup current nginx configuration
sudo cp -r /etc/nginx/ $BACKUP_DIR/nginx-config/

# Backup current sites
sudo cp /etc/nginx/sites-available/* $BACKUP_DIR/ 2>/dev/null || echo "No sites to backup"
sudo cp /etc/nginx/sites-enabled/* $BACKUP_DIR/ 2>/dev/null || echo "No enabled sites to backup"

# List backed up files
ls -la $BACKUP_DIR/
echo "Nginx configuration backed up to: $BACKUP_DIR"
```

### 2.3 Analyze Current Web Services
```bash
# Check what's currently running on web ports
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :8000

# Check if any web servers are running
sudo systemctl status apache2 2>/dev/null || echo "Apache2 not installed/running"
sudo systemctl status nginx 2>/dev/null || echo "Nginx not running"

# Check current firewall rules
sudo ufw status verbose
```

### 2.4 Document Current Configuration
```bash
# Create analysis report
echo "=== Current Server Web Configuration Analysis ===" > /tmp/server-analysis.txt
echo "Date: $(date)" >> /tmp/server-analysis.txt
echo "" >> /tmp/server-analysis.txt

echo "--- Nginx Status ---" >> /tmp/server-analysis.txt
sudo systemctl status nginx >> /tmp/server-analysis.txt 2>&1
echo "" >> /tmp/server-analysis.txt

echo "--- Current Sites Enabled ---" >> /tmp/server-analysis.txt
ls -la /etc/nginx/sites-enabled/ >> /tmp/server-analysis.txt 2>&1
echo "" >> /tmp/server-analysis.txt

echo "--- Port Usage ---" >> /tmp/server-analysis.txt
sudo netstat -tulpn | grep -E ':(80|443|3000|3001|8000) ' >> /tmp/server-analysis.txt 2>&1
echo "" >> /tmp/server-analysis.txt

echo "--- Firewall Status ---" >> /tmp/server-analysis.txt
sudo ufw status verbose >> /tmp/server-analysis.txt 2>&1

# Display the analysis
cat /tmp/server-analysis.txt
echo ""
echo "Analysis saved to: /tmp/server-analysis.txt"
```

### 2.5 Plan Configuration Changes
Based on the analysis above, determine the approach:

**If nginx is running with existing sites:**
- ✅ Backup configurations (already done in step 2.2)
- ✅ Plan to disable/modify conflicting configurations
- ✅ Ensure our domain doesn't conflict with existing setups

**If nginx is fresh/default:**
- ✅ Proceed with standard configuration
- ✅ Remove default site if present

**If ports are in use by other services:**
- ⚠️ Identify conflicting services
- ⚠️ Plan port resolution or service migration

**Decision Point**: Review the analysis output and proceed accordingly. If there are conflicts, document them before proceeding.

## Step 3: Domain and DNS Configuration

### 3.1 Verify DNS Configuration
```bash
# Check if domain points to your server
nslookup intelligent.myfastmedical.ca
dig intelligent.myfastmedical.ca

# Should return your server IP: 34.129.252.73
```

### 3.2 Test Domain Resolution
```bash
ping intelligent.myfastmedical.ca
```

**Note**: If DNS is not configured, update your DNS provider settings:
- **Type**: A Record
- **Name**: intelligent (or @ for root domain)
- **Value**: 34.129.252.73
- **TTL**: 300 (5 minutes)

## Step 4: Prepare Application Files

### 4.1 Create Application Directory
```bash
sudo mkdir -p /opt/intelligent-hub
sudo chown $USER:$USER /opt/intelligent-hub
cd /opt/intelligent-hub
```

### 4.2 Transfer Files from Local Machine

**On your local machine:**
```bash
# Navigate to your project directory
cd /Users/soroush/Documents/Code/freelance-project/farhad/intelligent

# Create deployment package (exclude unnecessary files)
tar -czf intelligent-hub-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  main-hub/ blog-generator/ docs/

# Transfer to server
scp -i ~/.ssh/my-gce-key intelligent-hub-deploy.tar.gz soroushziaee@34.129.252.73:/opt/intelligent-hub/
```

**On the server:**
```bash
cd /opt/intelligent-hub
tar -xzf intelligent-hub-deploy.tar.gz
ls -la  # Verify files are extracted
```

## Step 5: Environment Configuration

### 5.1 Create Production Environment File
```bash
cd /opt/intelligent-hub/main-hub
cp .env.example .env

# Edit the environment file
nano .env
```

**Update the .env file with:**
```env
# OpenAI API Key for blog generator service
OPENAI_API_KEY=your-actual-openai-key-here

# Hub Configuration
HUB_PORT=3000
HUB_HOST=0.0.0.0

# Blog Generator Configuration
BLOG_GENERATOR_FRONTEND_PORT=3001
BLOG_GENERATOR_API_PORT=8000

# Production Mode
NODE_ENV=production
```

### 5.2 Create Production Docker Compose Override
```bash
nano docker-compose.override.yml
```

**Add the following content:**
```yaml
services:
  hub-frontend:
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    
  blog-generator-frontend:
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    
  blog-generator-api:
    restart: unless-stopped
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

## Step 6: SSL Certificate Setup

### 6.1 Obtain SSL Certificate
```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Get certificate using certbot
sudo certbot certonly --standalone -d intelligent.myfastmedical.ca

# Start nginx again
sudo systemctl start nginx
```

### 6.2 Verify Certificate
```bash
sudo certbot certificates
```

## Step 7: Nginx Configuration with Authentication

### 7.1 Create Password File
```bash
# Create htpasswd file with username/password
sudo htpasswd -c /etc/nginx/.htpasswd admin

# You'll be prompted to enter a password
# Remember this username and password for accessing the site
```

### 7.2 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/intelligent.myfastmedical.ca
```

**Add the following configuration:**
```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    server_name intelligent.myfastmedical.ca;
    return 301 https://$host$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name intelligent.myfastmedical.ca;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/intelligent.myfastmedical.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/intelligent.myfastmedical.ca/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Basic Authentication
    auth_basic "Intelligent Hub - Authorized Access Only";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req zone=login burst=5 nodelay;

    # Main Hub (Default)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Blog Generator Frontend
    location /blog-generator {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Blog Generator API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 75;
        proxy_send_timeout 300;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7.3 Enable Site Configuration
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/intelligent.myfastmedical.ca /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

## Step 8: Deploy Application

### 8.1 Build and Start Services
```bash
cd /opt/intelligent-hub/main-hub

# Build and start all services
docker compose up -d --build

# Check if services are running
docker compose ps
```

### 8.2 View Logs (if needed)
```bash
# View all service logs
docker compose logs -f

# View specific service logs
docker compose logs -f hub-frontend
docker compose logs -f blog-generator-api
```

## Step 9: Firewall Configuration

### 9.1 Configure UFW Firewall
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 9.2 Verify Ports are Not Directly Accessible
```bash
# These should be blocked from external access
sudo ufw deny 3000/tcp
sudo ufw deny 3001/tcp
sudo ufw deny 8000/tcp
```

## Step 10: SSL Certificate Auto-Renewal

### 10.1 Setup Automatic Renewal
```bash
# Test renewal process
sudo certbot renew --dry-run

# Create renewal cron job
sudo crontab -e

# Add this line to renew certificates twice daily
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 11: Monitoring and Maintenance

### 11.1 Create System Service for Application
```bash
sudo nano /etc/systemd/system/intelligent-hub.service
```

**Add the following:**
```ini
[Unit]
Description=Intelligent Hub Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/intelligent-hub/main-hub
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

### 11.2 Enable and Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable intelligent-hub.service
sudo systemctl start intelligent-hub.service
```

### 11.3 Create Backup Script
```bash
sudo nano /opt/backup-intelligent-hub.sh
```

**Add the following:**
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/intelligent-hub-$DATE.tar.gz /opt/intelligent-hub

# Backup nginx configuration
cp /etc/nginx/sites-available/intelligent.myfastmedical.ca $BACKUP_DIR/nginx-config-$DATE.conf

# Backup password file
cp /etc/nginx/.htpasswd $BACKUP_DIR/htpasswd-$DATE

# Keep only last 7 backups
cd $BACKUP_DIR && ls -t | tail -n +8 | xargs rm -f

echo "Backup completed: $DATE"
```

```bash
sudo chmod +x /opt/backup-intelligent-hub.sh

# Test backup
sudo /opt/backup-intelligent-hub.sh
```

## Step 12: Testing and Verification

### 12.1 Test Domain Access
```bash
# Test HTTP redirect to HTTPS
curl -I http://intelligent.myfastmedical.ca

# Test HTTPS access (should prompt for authentication)
curl -I https://intelligent.myfastmedical.ca
```

### 12.2 Browser Testing Checklist
- [ ] Visit https://intelligent.myfastmedical.ca
- [ ] Verify SSL certificate is valid (green lock)
- [ ] Confirm authentication prompt appears
- [ ] Login with created username/password
- [ ] Verify main hub loads correctly
- [ ] Test service navigation and functionality
- [ ] Check blog generator access
- [ ] Verify health monitoring works

## Step 13: Security Hardening

### 13.1 Additional Security Measures
```bash
# Disable SSH password authentication (key-only)
sudo nano /etc/ssh/sshd_config

# Ensure these settings:
# PasswordAuthentication no
# ChallengeResponseAuthentication no
# UsePAM no

sudo systemctl reload sshd

# Install fail2ban for additional protection
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

### 13.2 Monitor Application
```bash
# Check service status
sudo systemctl status intelligent-hub.service

# Check docker containers
docker compose ps

# Check nginx status
sudo systemctl status nginx

# Check SSL certificate expiry
sudo certbot certificates
```

## Troubleshooting Common Issues

### Issue 1: Services Not Starting
```bash
# Check docker logs
docker compose logs

# Restart services
docker compose down
docker compose up -d --build
```

### Issue 2: SSL Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate files
sudo ls -la /etc/letsencrypt/live/intelligent.myfastmedical.ca/
```

### Issue 3: Authentication Not Working
```bash
# Recreate password file
sudo htpasswd -c /etc/nginx/.htpasswd admin

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Issue 4: Port Access Issues
```bash
# Check if ports are in use
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :8000

# Check docker port mapping
docker compose port hub-frontend 3000
```

## Maintenance Commands

### Regular Maintenance
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update docker images
cd /opt/intelligent-hub/main-hub
docker compose pull
docker compose up -d --build

# Clean up unused docker resources
docker system prune -af

# Check disk space
df -h

# Check application logs
docker compose logs --tail=100
```

### Emergency Commands
```bash
# Stop all services
docker compose down

# Start all services
docker compose up -d

# Restart nginx
sudo systemctl restart nginx

# View nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Conclusion

Your Intelligent Hub application is now deployed and secured with:

✅ **HTTPS encryption** with automatic certificate renewal  
✅ **Basic authentication** protecting access  
✅ **Reverse proxy** configuration for all services  
✅ **Firewall protection** blocking direct access to service ports  
✅ **System service** for automatic startup  
✅ **Backup system** for data protection  

**Access URL**: https://intelligent.myfastmedical.ca

**Default Login**: Username and password you set in Step 6.1

The application will automatically start on server reboot and renew SSL certificates automatically.

## Support and Updates

For updates and maintenance, SSH to your server and navigate to `/opt/intelligent-hub/main-hub`, then use docker compose commands to manage the application.

Remember to keep your OpenAI API key secure and monitor your application logs regularly for any issues.