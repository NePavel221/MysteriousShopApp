#!/bin/bash
cd ~/VapeCityApp

echo "[$(date)] Starting deploy..."

# Pull latest code
git pull origin master

# Build backend
cd backend
npm install --production=false
npm run build
pm2 restart vapecity-backend

# Build frontend
cd ../frontend
npm install
npm run build

# Build admin
cd ../admin
npm install
npm run build

# Fix permissions
chmod -R 755 ~/VapeCityApp/frontend/dist ~/VapeCityApp/admin/dist

echo "[$(date)] Deploy completed!"
