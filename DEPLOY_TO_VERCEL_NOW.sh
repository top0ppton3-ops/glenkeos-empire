#!/bin/bash

# ================================================================
# GLENKEOS VERCEL DEPLOYMENT SCRIPT
# Executive Mass Full Update Push
# ================================================================

set -e  # Exit on any error

echo "🚀 GLENKEOS - EXECUTIVE DEPLOYMENT INITIATED"
echo "=============================================="
echo ""

# Vercel Token
VERCEL_TOKEN="vcp_5KpPkrFlT0XFIcNDPUpG56HAAJpyAynANphCKPhK9Gv59ktZi51VxPLz"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""

# Set Vercel token
export VERCEL_TOKEN=$VERCEL_TOKEN

echo "📦 Building project..."
pnpm install
pnpm run build

echo ""
echo "🌐 Deploying to Vercel (Production)..."
echo ""

# Deploy to production
vercel --prod --token $VERCEL_TOKEN --yes

echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "🔗 Your app is live at: https://codebuild-default-webhook-source-lo.vercel.app"
echo ""
echo "Next steps:"
echo "  1. Verify deployment at the URL above"
echo "  2. Check Supabase RLS policies are active"
echo "  3. Test authentication flows"
echo "  4. Monitor Edge Functions"
echo ""