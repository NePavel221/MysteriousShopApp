#!/bin/bash
# Auto-deploy script for MysteriousShopApp

cd /home/nepav/MysteriousShopApp

echo "📥 Pulling latest changes..."
git pull origin master

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🔨 Building backend..."
npm run build

echo "📦 Installing frontend dependencies..."
cd ../frontend
rm -rf node_modules package-lock.json
npm install

echo "🔨 Building frontend..."
npm run build

echo "📦 Installing admin dependencies..."
cd ../admin
rm -rf node_modules package-lock.json
npm install

echo "🔨 Building admin..."
npm run build

echo "🔄 Restarting PM2..."
pm2 restart mysterious-backend

echo "✅ Deploy complete!"
