#!/bin/bash

# ================================================================
# GLENKEOS FULL DEPLOYMENT SCRIPT
# Deploy EVERYTHING to production RIGHT NOW
# ================================================================

set -e

echo "🚀 GLENKEOS FORTUNE 500 PLATFORM - FULL DEPLOYMENT"
echo "===================================================="
echo ""
echo "📍 Frontend: https://codebuild-default-webhook-source.vercel.app"
echo "📍 Backend:  https://beswluhdxaphtitaovly.supabase.co"
echo ""
echo "===================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo "${BLUE}[1/5] Installing dependencies...${NC}"
pnpm install
echo "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Build project
echo "${BLUE}[2/5] Building project...${NC}"
pnpm run build
echo "${GREEN}✅ Build complete${NC}"
echo ""

# Step 3: Check Vercel CLI
echo "${BLUE}[3/5] Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null
then
    echo "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi
echo "${GREEN}✅ Vercel CLI ready${NC}"
echo ""

# Step 4: Deploy to Vercel
echo "${BLUE}[4/5] Deploying to Vercel...${NC}"
echo ""
echo "Target: codebuild-default-webhook-source"
echo ""

# Use Vercel token from environment or hardcoded
VERCEL_TOKEN="${VERCEL_TOKEN:-vcp_5KpPkrFlT0XFIcNDPUpG56HAAJpyAynANphCKPhK9Gv59ktZi51VxPLz}"

vercel --prod --token "$VERCEL_TOKEN" --yes

echo ""
echo "${GREEN}✅ Frontend deployed${NC}"
echo ""

# Step 5: Deployment summary
echo "${BLUE}[5/5] Deployment Summary${NC}"
echo "===================================================="
echo ""
echo "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo ""
echo "🌐 Frontend:  https://codebuild-default-webhook-source.vercel.app"
echo "🔧 Backend:   https://beswluhdxaphtitaovly.supabase.co"
echo "📊 Dashboard: https://vercel.com/dashboard"
echo ""
echo "===================================================="
echo ""
echo "📋 Next Steps:"
echo "  1. Deploy RLS policies to Supabase (see PASTE_INTO_SUPABASE_SQL_EDITOR.sql)"
echo "  2. Test authentication flows"
echo "  3. Verify all 3 brands load correctly"
echo "  4. Check PayPal webhook configuration"
echo "  5. Test Edge Functions"
echo ""
echo "🎯 Test your live site now!"
echo "👉 https://codebuild-default-webhook-source.vercel.app"
echo ""
