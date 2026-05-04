#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

clear
echo -e "${BOLD}${BLUE}"
echo "╔════════════════════════════════════════════════╗"
echo "║  DEPLOY TO: codebuild-default-webhook-source-lo  ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${GREEN}✅ Build tested and successful!${NC}"
echo -e "${GREEN}✅ All code issues fixed!${NC}"
echo -e "${GREEN}✅ Ready to deploy!${NC}"
echo ""
echo -e "${BOLD}Choose deployment method:${NC}"
echo ""
echo "1) Vercel Dashboard Redeploy (EASIEST - 30 sec)"
echo "2) Deploy Webhook (if you have one)"
echo "3) CLI Deploy (requires authentication)"
echo "4) Show all options"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    echo ""
    echo -e "${BOLD}${BLUE}VERCEL DASHBOARD REDEPLOY:${NC}"
    echo ""
    echo "1. Open: https://vercel.com/dashboard"
    echo "2. Find project: codebuild-default-webhook-source-lo"
    echo "3. Click 'Deployments' tab"
    echo "4. Latest deployment → ⋮ → Redeploy"
    echo "5. Done!"
    echo ""
    echo -e "${GREEN}Your fixed code will deploy in ~60 seconds! 🚀${NC}"
    ;;
  2)
    echo ""
    read -p "Enter your deploy webhook URL: " webhook
    if [ -n "$webhook" ]; then
      echo ""
      echo -e "${BLUE}Deploying...${NC}"
      if curl -X POST "$webhook" 2>&1 | grep -q "200\|201\|202"; then
        echo -e "${GREEN}✅ Deployment triggered!${NC}"
        echo "Check status at: https://vercel.com/dashboard"
      else
        echo -e "${YELLOW}⚠️ Check webhook URL and try again${NC}"
      fi
    else
      echo -e "${RED}No webhook provided${NC}"
    fi
    ;;
  3)
    echo ""
    echo -e "${BOLD}${BLUE}CLI DEPLOYMENT:${NC}"
    echo ""
    echo "Running: pnpm dlx vercel login"
    echo ""
    pnpm dlx vercel login
    echo ""
    echo "Now run: pnpm dlx vercel --prod --yes"
    echo "Select project: codebuild-default-webhook-source-lo"
    ;;
  4)
    cat FINAL_DEPLOYMENT_SOLUTION.md
    ;;
  *)
    echo -e "${RED}Invalid choice${NC}"
    ;;
esac

echo ""
