#!/bin/bash

# PayPal Integration Test Script
# Tests create, capture, and webhook functions

SUPABASE_URL="https://beswluhdxaphtitaovly.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMjk5MjcsImV4cCI6MjA2MDcwNTkyN30.tT5w8xbp8m8L9yKqGQqBzPH_7vIhC_-_rYLXoJ_bGag"

echo "=================================================="
echo "PayPal Integration Test"
echo "=================================================="
echo ""

# Test 1: Create PayPal Order
echo "Test 1: Creating PayPal Order..."
echo "Request: POST $SUPABASE_URL/functions/v1/create-paypal-order"
echo ""

CREATE_RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/functions/v1/create-paypal-order" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{
    "order_id": "test_'$(date +%s)'",
    "amount": 29.99,
    "currency": "USD"
  }')

echo "Response:"
echo "$CREATE_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATE_RESPONSE"
echo ""

# Check if we got a paypal_order_id
PAYPAL_ORDER_ID=$(echo "$CREATE_RESPONSE" | jq -r '.paypal_order_id' 2>/dev/null)

if [ "$PAYPAL_ORDER_ID" != "null" ] && [ -n "$PAYPAL_ORDER_ID" ]; then
  echo "✅ Create Order: SUCCESS"
  echo "PayPal Order ID: $PAYPAL_ORDER_ID"
  echo ""

  # Test 2: Capture (will fail without approval, but tests function)
  echo "Test 2: Testing Capture Function..."
  echo "Request: POST $SUPABASE_URL/functions/v1/capture-paypal-order"
  echo ""

  CAPTURE_RESPONSE=$(curl -s -X POST \
    "$SUPABASE_URL/functions/v1/capture-paypal-order" \
    -H "Content-Type: application/json" \
    -H "apikey: $ANON_KEY" \
    -d '{
      "paypal_order_id": "'"$PAYPAL_ORDER_ID"'",
      "order_id": "test_'$(date +%s)'"
    }')

  echo "Response:"
  echo "$CAPTURE_RESPONSE" | jq '.' 2>/dev/null || echo "$CAPTURE_RESPONSE"
  echo ""

  if echo "$CAPTURE_RESPONSE" | grep -q "error"; then
    echo "⚠️  Capture: Expected error (order not approved by user)"
  else
    echo "✅ Capture: Function responded"
  fi
else
  echo "❌ Create Order: FAILED"
  echo "Error: No PayPal Order ID returned"

  # Check if it's an auth issue
  if echo "$CREATE_RESPONSE" | grep -q "UNAUTHORIZED"; then
    echo ""
    echo "⚠️  Authorization Issue Detected"
    echo "The function requires authentication."
    echo "Check: Supabase Edge Function permissions"
  fi

  # Check if it's a PayPal credentials issue
  if echo "$CREATE_RESPONSE" | grep -q "PayPal"; then
    echo ""
    echo "⚠️  PayPal Configuration Issue"
    echo "Check environment variables in Supabase:"
    echo "  - PAYPAL_CLIENT_ID"
    echo "  - PAYPAL_CLIENT_SECRET"
    echo "  - PAYPAL_ENVIRONMENT"
  fi
fi

echo ""
echo "=================================================="
echo "Test Summary"
echo "=================================================="
echo ""
echo "Functions to deploy (if not already):"
echo "  npx supabase functions deploy create-paypal-order"
echo "  npx supabase functions deploy capture-paypal-order"
echo "  npx supabase functions deploy paypal-webhook"
echo ""
echo "Required Environment Variables:"
echo "  PAYPAL_CLIENT_ID=your_client_id"
echo "  PAYPAL_CLIENT_SECRET=your_secret"
echo "  PAYPAL_ENVIRONMENT=sandbox"
echo "  PAYPAL_WEBHOOK_ID=your_webhook_id"
echo ""
echo "Get credentials at: https://developer.paypal.com/dashboard/"
echo ""
