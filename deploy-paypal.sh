#!/bin/bash

echo "=================================================="
echo "Deploying PayPal Integration to Supabase"
echo "=================================================="
echo ""

# Set environment variables
export PAYPAL_CLIENT_ID="Aak4lnZ2VoSGGGtyby06OBU4dZ0mtprftwZs43fLICH7G22G0se3c2Q5eDmZStMIwmjRkfDkHK_Kk_6F"
export PAYPAL_CLIENT_SECRET="EAay-EpxvbnpzooEJIP7dfvNIDWdtCtelD2_-3BKUcNFJVBerv-X2aQRNH1EO1Yy0wG501KIDqmJHgH6"
export PAYPAL_ENVIRONMENT="sandbox"

echo "Step 1: Setting Supabase secrets..."
echo ""

npx supabase secrets set PAYPAL_CLIENT_ID="$PAYPAL_CLIENT_ID" --project-ref beswluhdxaphtitaovly
npx supabase secrets set PAYPAL_CLIENT_SECRET="$PAYPAL_CLIENT_SECRET" --project-ref beswluhdxaphtitaovly
npx supabase secrets set PAYPAL_ENVIRONMENT="$PAYPAL_ENVIRONMENT" --project-ref beswluhdxaphtitaovly

echo ""
echo "Step 2: Deploying PayPal functions..."
echo ""

npx supabase functions deploy create-paypal-order --project-ref beswluhdxaphtitaovly
npx supabase functions deploy capture-paypal-order --project-ref beswluhdxaphtitaovly
npx supabase functions deploy paypal-webhook --project-ref beswluhdxaphtitaovly

echo ""
echo "Step 3: Testing PayPal integration..."
echo ""

sleep 2

# Test create order
TEST_ORDER_ID="test_$(date +%s)"
echo "Creating test order: $TEST_ORDER_ID"

CREATE_RESPONSE=$(curl -s -X POST \
  "https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-paypal-order" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "'"$TEST_ORDER_ID"'",
    "amount": 29.99,
    "currency": "USD"
  }')

echo "$CREATE_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATE_RESPONSE"

PAYPAL_ORDER_ID=$(echo "$CREATE_RESPONSE" | jq -r '.paypal_order_id' 2>/dev/null)

if [ "$PAYPAL_ORDER_ID" != "null" ] && [ -n "$PAYPAL_ORDER_ID" ]; then
  echo ""
  echo "✅ PayPal Integration WORKING!"
  echo "PayPal Order ID: $PAYPAL_ORDER_ID"
  echo ""
  echo "Approve URL:"
  echo "$CREATE_RESPONSE" | jq -r '.links[] | select(.rel=="approve") | .href' 2>/dev/null
else
  echo ""
  echo "❌ Integration test failed"
  echo "Check response above for errors"
fi

echo ""
echo "=================================================="
echo "Deployment Complete"
echo "=================================================="
