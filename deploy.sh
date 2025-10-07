#!/bin/bash

# 🚀 Cricket Team App - Quick Deploy Script

echo "🏏 Deploying Cricket Team Management App to Vercel..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit with timestamp
echo "💾 Committing changes..."
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No git remote found!"
    echo "Please add your GitHub repository:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/cricket-team-tracker.git"
    exit 1
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

# Deploy to Vercel (if CLI is installed)
if command -v vercel &> /dev/null; then
    echo "🌐 Deploying to Vercel..."
    vercel --prod
else
    echo "⚠️  Vercel CLI not found. Install with: npm i -g vercel"
    echo "📱 Your code is pushed to GitHub. Deploy manually at vercel.com"
fi

echo "✅ Deployment process complete!"
echo "🎉 Your cricket app should be live soon!"