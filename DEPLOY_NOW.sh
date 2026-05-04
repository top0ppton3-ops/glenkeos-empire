#!/bin/bash

# GlenKeos Complete Deployment Script
# This script automates the entire deployment process

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════"
echo "🚀 GLENKEOS DEPLOYMENT SCRIPT"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Push to GitHub
echo -e "${BLUE}Step 1: Pushing to GitHub...${NC}"
git push origin master || {
    echo -e "${RED}❌ Git push failed. Check SSH key setup.${NC}"
    exit 1
}
echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
echo ""

# Step 2: Deploy Supabase Edge Functions
echo -e "${BLUE}Step 2: Deploying Supabase Edge Functions...${NC}"
echo "Run this command manually:"
echo "  supabase functions deploy --project-ref beswluhdxaphtitaovly"
echo ""

# Step 3: Set Supabase Secrets
echo -e "${BLUE}Step 3: Setting Supabase Secrets...${NC}"
echo "Run these commands manually:"
echo '  supabase secrets set SUPABASE_URL="https://beswluhdxaphtitaovly.supabase.co"'
echo '  supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY1NTM3MiwiZXhwIjoyMDUwMjMxMzcyfQ.BAAkPJbK4bCC9TZRop5lSAgwwdwR97nkTWrSYBs2FpX59LRla5FgyL4UXnKK5usDHZygROl0dmBH7KKgrE"'
echo '  supabase secrets set PAYPAL_CLIENT_ID="EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC"'
echo ""

# Step 4: Seed Database
echo -e "${BLUE}Step 4: Seeding Database...${NC}"
echo "Go to: https://supabase.com/dashboard/project/beswluhdxaphtitaovly"
echo "Navigate to: SQL Editor → New Query"
echo "Run the contents of: /supabase/seed.sql"
echo ""

# Step 5: Configure Vercel
echo -e "${BLUE}Step 5: Configuring Vercel...${NC}"
echo "Go to: https://vercel.com/dashboard"
echo "Project: codebuild-default-webhook-source-lo"
echo "Settings → Environment Variables"
echo "Add:"
echo "  VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co"
echo "  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic"
echo "  PAYPAL_CLIENT_ID=EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC"
echo ""

echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Step 1 Complete: Code pushed to GitHub${NC}"
echo "📋 Complete Steps 2-5 manually (see above)"
echo "════════════════════════════════════════════════════════════"
