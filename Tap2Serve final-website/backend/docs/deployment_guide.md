# Deployment Guide - Tap2Serve Backend

This guide covers the deployment of the Tap2Serve backend to a Linux VPS (Ubuntu recommended) using NGINX and PM2.

## 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB
- NGINX
- PM2 (`npm install -g pm2`)

## 2. Server Setup
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd backend
npm install
```

## 3. Environment Configuration
Create a `.env` file based on `.env.production`:
```bash
cp .env.production .env
nano .env # Fill in your production values
```

## 4. PM2 Process Management
Start the application with PM2:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 5. NGINX Reverse Proxy
Create an NGINX configuration file:
`/etc/nginx/sites-available/tap2serve`

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the site and restart NGINX:
```bash
sudo ln -s /etc/nginx/sites-available/tap2serve /etc/nginx/sites-enabled/
sudo nginx -t
sudo system_service nginx restart
```

## 6. SSL with Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```
