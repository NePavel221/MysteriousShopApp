#!/bin/bash
set -e

APP_DIR=~/MysteriousShopApp
DOMAIN="mysteriousshop.duckdns.org"

echo "[$(date)] 🚀 Starting MysteriousShop deploy..."

cd $APP_DIR

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin master || git pull origin main || true

# Backend
echo "🔧 Building backend..."
cd backend
npm install --production=false
npm run build
pm2 restart mysterious-backend 2>/dev/null || pm2 start dist/index.js --name mysterious-backend

# Frontend
echo "🎨 Building frontend..."
cd ../frontend
npm install
VITE_API_URL=https://$DOMAIN npm run build

# Admin
echo "👑 Building admin..."
cd ../admin
npm install
VITE_API_URL=https://$DOMAIN npm run build

# Fix permissions
chmod -R 755 $APP_DIR/frontend/dist $APP_DIR/admin/dist

echo "[$(date)] ✅ Deploy completed!"
echo "🌐 Site: https://$DOMAIN"
echo "👑 Admin: https://$DOMAIN/admin"
