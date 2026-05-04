#!/bin/bash
# ========================================
# DEPLOY GLENKEOS TO VERCEL
# ========================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║     GLENKEOS VERCEL DEPLOYMENT        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we can run vercel
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm not found${NC}"
    exit 1
fi

echo -e "${BLUE}[1/4] 🔍 Testing build locally...${NC}"
echo ""

# Test build
if pnpm run build; then
    echo -e "${GREEN}✅ Local build succeeded!${NC}"
else
    echo -e "${RED}❌ Build failed. Fix errors before deploying.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}[2/4] 🚀 Deploying to Vercel...${NC}"
echo ""

# Deploy using pnpm dlx vercel
# This will prompt for authentication if needed
pnpm dlx vercel --prod

echo ""
echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo ""
echo -e "${BLUE}[3/4] 📊 Deployment details:${NC}"
echo ""

# Show recent deployments
pnpm dlx vercel ls 2>/dev/null || echo "Login to see deployments"

echo ""
echo -e "${BLUE}[4/4] ✅ Next steps:${NC}"
echo ""
echo "1. Check deployment status in Vercel dashboard"
echo "2. Visit your production URL once deployed"
echo "3. Verify app works correctly"
echo ""
echo -e "${YELLOW}Optional: Add environment variables for custom backend${NC}"
echo "   • VITE_SUPABASE_URL"
echo "   • VITE_SUPABASE_ANON_KEY"
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
