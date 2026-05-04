#!/bin/bash
# Deploy GlenKeos Edge Functions to Supabase
# This script deploys all 32 Edge Functions and sets required secrets

set -e

export PATH="$HOME/.local/bin:$PATH"

PROJECT_REF="beswluhdxaphtitaovly"
SUPABASE_URL="https://beswluhdxaphtitaovly.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY1NTM3MiwiZXhwIjoyMDUwMjMxMzcyfQ.BAAkPJbK4bCC9TZRop5lSAgwwdwR97nkTWrSYBs2FpX59LRla5FgyL4UXnKK5usDHZygROl0dmBH7KKgrE"
PAYPAL_CLIENT_ID="EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC"
PAYPAL_SECRET="EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC"

echo "🚀 Deploying GlenKeos to Supabase"
echo "=================================="
echo ""

# Step 1: Link project
echo "📌 Linking to Supabase project: $PROJECT_REF"
supabase link --project-ref $PROJECT_REF

# Step 2: Set secrets
echo ""
echo "🔐 Setting Supabase secrets..."
supabase secrets set SUPABASE_URL="$SUPABASE_URL"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
supabase secrets set PAYPAL_CLIENT_ID="$PAYPAL_CLIENT_ID"
supabase secrets set PAYPAL_SECRET="$PAYPAL_SECRET"

echo ""
echo "✅ Verifying secrets..."
supabase secrets list

# Step 3: Deploy all Edge Functions
echo ""
echo "📦 Deploying Edge Functions (32 functions)..."
echo ""

cd supabase/functions

FUNCTIONS=(
  "assign-driver"
  "cancel-order"
  "capture-paypal-order"
  "compliance-report"
  "create-goldkey-booking"
  "create-order"
  "create-paypal-order"
  "get-analytics"
  "get-driver"
  "get-driver-location"
  "get-drivers"
  "get-goldkey-booking"
  "get-goldkey-bookings"
  "get-loyalty-account"
  "get-loyalty-transactions"
  "get-metrics"
  "get-order"
  "get-orders"
  "get-payment"
  "list-menu-items"
  "loyalty-add-points"
  "loyalty-redeem"
  "place-order"
  "process-payment"
  "submit-compliance-report"
  "track-driver"
  "track-order"
  "update-driver-location"
  "update-driver-status"
  "update-goldkey-booking"
  "update-order-status"
  "validate-order"
)

for func in "${FUNCTIONS[@]}"; do
  echo "  Deploying: $func"
  supabase functions deploy $func --project-ref $PROJECT_REF
done

cd ../..

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "=================================="
echo ""
echo "🌐 Edge Functions deployed to:"
echo "   https://beswluhdxaphtitaovly.supabase.co/functions/v1/"
echo ""
echo "📋 Next Steps:"
echo "   1. Configure Vercel environment variables"
echo "   2. Seed database with test data"
echo "   3. Test all portals"
echo ""
