# 🖥️ Self-Hosted Deployment Guide - NutriSnap App

## Overview: Deploy to Your Own Server

### Why Self-Host?
- ✅ **Full control** over your infrastructure
- ✅ **Cost-effective** for high traffic
- ✅ **Custom domain** and SSL setup
- ✅ **No vendor lock-in**
- ✅ **Better for enterprise/privacy requirements**

---

## Option 1: VPS Deployment (Digital Ocean, Linode, etc.)

### Prerequisites
- VPS with Ubuntu 20.04+ (2GB RAM minimum)
- Domain name (optional but recommended)
- SSH access to your server

### Step 1: Server Setup

```bash
# Connect to your server
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (web server)
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Deploy Your App

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/nutrisnap-app.git
cd nutrisnap-app

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

**Add to `.env.production`:**
```env
VITE_SUPABASE_URL=[YOUR_SUPABASE_URL_HERE]
VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY_HERE]
VITE_GOOGLE_GEMINI_API_KEY=[YOUR_GEMINI_API_KEY_HERE]
FATSECRET_API_KEY=[YOUR_FATSECRET_API_KEY_HERE]
FATSECRET_SHARED_SECRET=[YOUR_FATSECRET_SHARED_SECRET_HERE]
```

```bash
# Build the application
npm run build

# Start the FatSecret proxy with PM2
pm2 start fatsecret-proxy.js --name "nutrisnap-proxy"

# Serve the built files
pm2 serve dist 3000 --name "nutrisnap-app"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 3: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/nutrisnap
```

**Add to Nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Serve React app
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
    }

    # Proxy FatSecret API
    location /api/fatsecret {
        proxy_pass http://localhost:3001/api/fatsecret;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/nutrisnap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: SSL Certificate (Free with Let's Encrypt)

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Option 2: Docker Deployment

### Create Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Create docker-compose.yml

```yaml
version: '3.8'
services:
  nutrisnap-app:
    build: .
    ports:
      - "80:80"
    environment:      - VITE_SUPABASE_URL=[YOUR_SUPABASE_URL_HERE]
      - VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY_HERE]
      - VITE_GOOGLE_GEMINI_API_KEY=[YOUR_GEMINI_API_KEY_HERE]
    restart: unless-stopped

  nutrisnap-api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "3001:3001"
    environment:      - FATSECRET_API_KEY=[YOUR_FATSECRET_API_KEY_HERE]
      - FATSECRET_SHARED_SECRET=[YOUR_FATSECRET_SHARED_SECRET_HERE]
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f

# Update deployment
git pull
docker-compose down
docker-compose up -d --build
```

---

## Option 3: Static Hosting + Serverless API

### For Static Files (Nginx/Apache)
```bash
# Build locally
npm run build

# Upload dist/ folder to your web server
rsync -avz dist/ user@your-server:/var/www/html/

# Or use FTP/SFTP to upload the dist folder
```

### For API (Node.js Process)
```bash
# Only run the proxy server
pm2 start fatsecret-proxy.js --name "nutrisnap-api"
```

---

## Option 4: Cloud VPS Providers

### Recommended Providers:
1. **DigitalOcean** - $5/month droplet
2. **Linode** - $5/month VPS
3. **Vultr** - $2.50/month VPS
4. **AWS Lightsail** - $3.50/month
5. **Hetzner** - €3.29/month

### Quick Deploy Script for VPS:

```bash
#!/bin/bash
# save as deploy-to-vps.sh

echo "🚀 NutriSnap VPS Deployment Script"

# Update system
sudo apt update -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx pm2

# Clone and setup
git clone https://github.com/YOUR_USERNAME/nutrisnap-app.git
cd nutrisnap-app
npm install
npm run build

# Start services
pm2 start fatsecret-proxy.js
pm2 serve dist 3000 --name "nutrisnap"
pm2 save
pm2 startup

echo "✅ Deployment complete! Configure Nginx and SSL next."
```

---

## Updating Your Self-Hosted App

### Automated Update Script:
```bash
#!/bin/bash
# save as update-app.sh

cd /path/to/nutrisnap-app
git pull origin main
npm install
npm run build
pm2 restart all

echo "✅ App updated successfully!"
```

---

## Monitoring & Maintenance

### Essential Monitoring:
```bash
# Check PM2 processes
pm2 status
pm2 logs

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check disk space
df -h

# Check memory usage
free -h

# Check server load
htop
```

### Backup Strategy:
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/nutrisnap_$DATE.tar.gz /path/to/nutrisnap-app
```

---

## Cost Comparison

| Option | Monthly Cost | Pros | Cons |
|--------|-------------|------|------|
| **VPS (DigitalOcean)** | $5-20 | Full control, scalable | Requires maintenance |
| **Shared Hosting** | $3-10 | Very cheap | Limited control |
| **Dedicated Server** | $50+ | Maximum performance | Expensive, complex |
| **Cloud (AWS/GCP)** | $10-50 | Auto-scaling | Can get expensive |

---

## Security Checklist

- ✅ **Firewall**: Only open ports 22, 80, 443
- ✅ **SSL Certificate**: Use Let's Encrypt
- ✅ **Regular Updates**: Keep OS and packages updated
- ✅ **Backup Strategy**: Daily automated backups
- ✅ **Monitoring**: Set up alerts for downtime
- ✅ **Environment Variables**: Never expose API keys in code

---

**🎯 Your NutriSnap app will be running on your own server with full control!**

Choose the option that best fits your technical expertise and requirements. VPS deployment is most popular for startups and small businesses.
