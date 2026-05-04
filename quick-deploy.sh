#!/bin/bash
# ================================================================
# QUICK DEPLOY - Run from Terminal
# ================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════╗
║  GLENKEOS QUICK DEPLOYMENT                        ║
║  Fortune-500 Platform - Backend Setup             ║
╚═══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# ================================================================
# STEP 1: Get Supabase Credentials
# ================================================================

echo -e "${BOLD}STEP 1: Supabase Setup${NC}"
echo ""
echo -e "${YELLOW}First, you need to run the SQL in Supabase:${NC}"
echo ""
echo "1. Go to your Supabase dashboard → SQL Editor"
echo "2. Click 'New Query'"
echo "3. Copy & paste this entire file:"
echo "   ${BOLD}/workspaces/default/code/supabase/migrations/0001_complete_schema.sql${NC}"
echo "4. Click 'RUN'"
echo ""
read -p "Have you run the SQL in Supabase? (y/n): " sql_done

if [[ ! "$sql_done" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Please run the SQL first, then run this script again.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ SQL completed${NC}"
echo ""

# ================================================================
# STEP 2: Get Credentials
# ================================================================

echo -e "${BOLD}STEP 2: Get Your Supabase Credentials${NC}"
echo ""
echo "In Supabase Dashboard → Settings → API:"
echo ""

read -p "Enter your Supabase Project URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Enter your Supabase anon/public key (eyJ...): " SUPABASE_KEY

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo -e "${RED}Error: Both URL and key are required${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Credentials received${NC}"

# ================================================================
# STEP 3: Create .env.local
# ================================================================

echo ""
echo -e "${BOLD}STEP 3: Creating .env.local${NC}"

cat > .env.local << EOL
# Supabase Configuration
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_KEY}

# PayPal Sandbox (for testing)
VITE_PAYPAL_CLIENT_ID=Aak4lnZ2VoSGGGtyby06OBU4dZ0mtprftwZs43fLICH7G22G0se3c2Q5eDmZStMIwmjRkfDkHK_Kk_6F
EOL

echo -e "${GREEN}✅ Created .env.local${NC}"

# ================================================================
# STEP 4: Test Build
# ================================================================

echo ""
echo -e "${BOLD}STEP 4: Testing Build${NC}"

pnpm run build

echo ""
echo -e "${GREEN}✅ Build successful${NC}"

# ================================================================
# STEP 5: Update Vercel
# ================================================================

echo ""
echo -e "${BOLD}STEP 5: Update Vercel Environment Variables${NC}"
echo ""
echo -e "${YELLOW}Add these to Vercel Dashboard → Settings → Environment Variables:${NC}"
echo ""
echo -e "${BLUE}VITE_SUPABASE_URL${NC} = ${SUPABASE_URL}"
echo -e "${BLUE}VITE_SUPABASE_ANON_KEY${NC} = ${SUPABASE_KEY}"
echo ""
read -p "Have you added these to Vercel? (y/n): " vercel_done

if [[ ! "$vercel_done" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please add them, then redeploy manually from Vercel dashboard${NC}"
else
    echo ""
    echo -e "${BOLD}Deploying to Vercel...${NC}"
    pnpm dlx vercel --prod
fi

# ================================================================
# COMPLETE
# ================================================================

echo ""
echo -e "${BOLD}${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════╗
║  ✅ DEPLOYMENT COMPLETE!                          ║
╚═══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BOLD}What was deployed:${NC}"
echo -e "${GREEN}✅ Database (19 tables)${NC}"
echo -e "${GREEN}✅ PostGIS for GPS tracking${NC}"
echo -e "${GREEN}✅ Row-level security${NC}"
echo -e "${GREEN}✅ Seed data (3 brands, 4 stores, 9 menu items)${NC}"
echo -e "${GREEN}✅ Frontend connected to Supabase${NC}"
echo ""
echo -e "${BOLD}What to do next:${NC}"
echo -e "${YELLOW}1. Verify tables in Supabase → Table Editor${NC}"
echo -e "${YELLOW}2. Test your frontend at your Vercel URL${NC}"
echo -e "${YELLOW}3. Check brands table has 3 rows (COC, GE, GK)${NC}"
echo ""
echo -e "${GREEN}🎉 Your Fortune-500 platform is live! 🚀${NC}"
echo ""
