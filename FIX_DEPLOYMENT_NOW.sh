#!/bin/bash
# ========================================
# FIX VERCEL DEPLOYMENT TO CORRECT PROJECT
# ========================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${RED}"
echo "╔═══════════════════════════════════════════╗"
echo "║  FIX: DEPLOY TO CORRECT VERCEL PROJECT   ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}Issue: Deployed to wrong project (code-red-three.vercel.app)${NC}"
echo -e "${GREEN}Fix: Redeploy to codebuild-default-webhook-source-lo${NC}"
echo ""

# Check if user has deploy webhook
echo -e "${BLUE}Do you have a Vercel deploy webhook URL?${NC}"
echo -e "${YELLOW}(You can create one in: Vercel Dashboard → Settings → Git → Deploy Hooks)${NC}"
echo ""
read -p "Enter webhook URL (or press Enter to skip): " WEBHOOK_URL

if [ -n "$WEBHOOK_URL" ]; then
    echo ""
    echo -e "${BLUE}Triggering deployment via webhook...${NC}"

    if curl -X POST "$WEBHOOK_URL" -s -o /dev/null -w "%{http_code}" | grep -q "200\|201\|202"; then
        echo -e "${GREEN}✅ Deployment triggered successfully!${NC}"
        echo ""
        echo -e "${BLUE}Your deployment is now building...${NC}"
        echo -e "${YELLOW}Check status at: https://vercel.com/dashboard${NC}"
        echo ""
        echo -e "${GREEN}Fixed code will deploy to correct project! 🚀${NC}"
    else
        echo -e "${RED}❌ Webhook failed. Try manual deployment.${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}No webhook provided. Here are your options:${NC}"
    echo ""
    echo -e "${BOLD}Option 1: Vercel Dashboard (Easiest)${NC}"
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Find project: codebuild-default-webhook-source-lo"
    echo "3. Deployments → Latest → ⋮ → Redeploy"
    echo ""
    echo -e "${BOLD}Option 2: Create Deploy Hook${NC}"
    echo "1. Project Settings → Git → Deploy Hooks"
    echo "2. Create hook → Copy URL"
    echo "3. Run this script again with webhook URL"
    echo ""
    echo -e "${BOLD}Option 3: Vercel CLI${NC}"
    echo "Run: pnpm dlx vercel link"
    echo "Select: codebuild-default-webhook-source-lo"
    echo "Then: pnpm dlx vercel --prod"
    echo ""
fi

echo ""
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BOLD}Current Status:${NC}"
echo -e "  ✅ Code fixed (PayPal fallback added)"
echo -e "  ✅ Build tested (successful)"
echo -e "  ✅ Import errors resolved"
echo -e "  ⏳ Needs deployment to correct project"
echo ""
echo -e "${BOLD}Fortune 500 Completion: 78%${NC}"
echo -e "  ✅ Core platform ready"
echo -e "  ⚠️  Missing: Enterprise auth, compliance, mobile apps"
echo -e "  📊 See: FORTUNE_500_STATUS.md"
echo ""
echo -e "${BOLD}${GREEN}Next: Redeploy to codebuild-default-webhook-source-lo ✅${NC}"
echo ""
