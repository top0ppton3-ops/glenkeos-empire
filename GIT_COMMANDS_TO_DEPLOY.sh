#!/bin/bash

# ================================================================
# PUSH TO GIT → TRIGGERS VERCEL DEPLOYMENT
# This will show as PENDING in Vercel dashboard
# ================================================================

echo "🚀 GLENKEOS - TRIGGERING DEPLOYMENT TO CODEBUILD"
echo "=================================================="
echo ""

# Check git status
echo "📊 Checking git status..."
git status

echo ""
echo "📦 Adding all files..."
git add .

echo ""
echo "💬 Creating commit..."
git commit -m "🚀 Deploy: All files moved to codebuild project - $(date '+%Y-%m-%d %H:%M:%S')"

echo ""
echo "⬆️  Pushing to main branch..."
git push origin main

echo ""
echo "=================================================="
echo "✅ PUSH COMPLETE!"
echo "=================================================="
echo ""
echo "🎯 NEXT: Check Vercel Dashboard"
echo "👉 https://vercel.com/dashboard"
echo ""
echo "You should see:"
echo "  - Status: PENDING (building...)"
echo "  - Then: BUILDING"
echo "  - Then: READY"
echo ""
echo "🔗 Live at: https://codebuild-default-webhook-source-lo.vercel.app"
echo ""
echo "⏱️  Build time: ~2-3 minutes"
echo ""
