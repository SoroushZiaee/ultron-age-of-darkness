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

## Step 2: Domain and DNS Configuration

### 2.1 Verify DNS Configuration
```bash
# Check if domain points to your server
nslookup intelligent.myfastmedical.ca
dig intelligent.myfastmedical.ca

# Should return your server IP: 34.129.252.73
```

### 2.2 Test Domain Resolution
```bash
ping intelligent.myfastmedical.ca
```

**Note**: If DNS is not configured, update your DNS provider settings:
- **Type**: A Record
- **Name**: intelligent (or @ for root domain)
- **Value**: 34.129.252.73
- **TTL**: 300 (5 minutes)

## Step 3: Prepare Application Files

### 3.1 Create Application Directory
```bash
sudo mkdir -p /opt/intelligent-hub
sudo chown $USER:$USER /opt/intelligent-hub
cd /opt/intelligent-hub
```

### 3.2 Transfer Files from Local Machine

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

## Step 4: Environment Configuration

### 4.1 Create Production Environment File
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

### 4.2 Create Production Docker Compose Override
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

## Step 5: SSL Certificate Setup

### 5.1 Obtain SSL Certificate
```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Get certificate using certbot
sudo certbot certonly --standalone -d intelligent.myfastmedical.ca

# Start nginx again
sudo systemctl start nginx
```

### 5.2 Verify Certificate
```bash
sudo certbot certificates
```

## Step 6: Nginx Configuration with Authentication

### 6.1 Create Password File
```bash
# Create htpasswd file with username/password
sudo htpasswd -c /etc/nginx/.htpasswd admin

# You'll be prompted to enter a password
# Remember this username and password for accessing the site
```

### 6.2 Create Nginx Configuration
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

### 6.3 Enable Site Configuration
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

## Step 7: Deploy Application

### 7.1 Build and Start Services
```bash
cd /opt/intelligent-hub/main-hub

# Build and start all services
docker compose up -d --build

# Check if services are running
docker compose ps
```

### 7.2 View Logs (if needed)
```bash
# View all service logs
docker compose logs -f

# View specific service logs
docker compose logs -f hub-frontend
docker compose logs -f blog-generator-api
```

## Step 8: Firewall Configuration

### 8.1 Configure UFW Firewall
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

### 8.2 Verify Ports are Not Directly Accessible
```bash
# These should be blocked from external access
sudo ufw deny 3000/tcp
sudo ufw deny 3001/tcp
sudo ufw deny 8000/tcp
```

## Step 9: SSL Certificate Auto-Renewal

### 9.1 Setup Automatic Renewal
```bash
# Test renewal process
sudo certbot renew --dry-run

# Create renewal cron job
sudo crontab -e

# Add this line to renew certificates twice daily
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 10: Monitoring and Maintenance

### 10.1 Create System Service for Application
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

### 10.2 Enable and Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable intelligent-hub.service
sudo systemctl start intelligent-hub.service
```

### 10.3 Create Backup Script
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

## Step 11: Testing and Verification

### 11.1 Test Domain Access
```bash
# Test HTTP redirect to HTTPS
curl -I http://intelligent.myfastmedical.ca

# Test HTTPS access (should prompt for authentication)
curl -I https://intelligent.myfastmedical.ca
```

### 11.2 Browser Testing Checklist
- [ ] Visit https://intelligent.myfastmedical.ca
- [ ] Verify SSL certificate is valid (green lock)
- [ ] Confirm authentication prompt appears
- [ ] Login with created username/password
- [ ] Verify main hub loads correctly
- [ ] Test service navigation and functionality
- [ ] Check blog generator access
- [ ] Verify health monitoring works

## Step 12: Security Hardening

### 12.1 Additional Security Measures
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

### 12.2 Monitor Application
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