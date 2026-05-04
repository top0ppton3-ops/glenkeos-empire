#!/bin/bash

# Test PayPal credentials directly
CLIENT_ID="Aak4lnZ2VoSGGGtyby06OBU4dZ0mtprftwZs43fLICH7G22G0se3c2Q5eDmZStMIwmjRkfDkHK_Kk_6F"
CLIENT_SECRET="EAay-EpxvbnpzooEJIP7dfvNIDWdtCtelD2_-3BKUcNFJVBerv-X2aQRNH1EO1Yy0wG501KIDqmJHgH6"

echo "Testing PayPal credentials..."
echo ""

# Get OAuth token
AUTH=$(echo -n "$CLIENT_ID:$CLIENT_SECRET" | base64)

TOKEN_RESPONSE=$(curl -s -X POST \
  "https://api-m.sandbox.paypal.com/v1/oauth2/token" \
  -H "Authorization: Basic $AUTH" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials")

echo "Token Response:"
echo "$TOKEN_RESPONSE" | jq '.' 2>/dev/null || echo "$TOKEN_RESPONSE"

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token' 2>/dev/null)

if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
  echo ""
  echo "✅ PayPal credentials VALID!"
  echo "Access token obtained successfully"
  echo ""

  # Create a test order
  echo "Creating test PayPal order..."

  ORDER_RESPONSE=$(curl -s -X POST \
    "https://api-m.sandbox.paypal.com/v2/checkout/orders" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "intent": "CAPTURE",
      "purchase_units": [{
        "reference_id": "test_direct_001",
        "amount": {
          "currency_code": "USD",
          "value": "29.99"
        }
      }]
    }')

  echo "$ORDER_RESPONSE" | jq '.' 2>/dev/null || echo "$ORDER_RESPONSE"

  ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id' 2>/dev/null)

  if [ "$ORDER_ID" != "null" ] && [ -n "$ORDER_ID" ]; then
    echo ""
    echo "✅ Test order created successfully!"
    echo "Order ID: $ORDER_ID"
    echo ""
    echo "Approve URL:"
    echo "$ORDER_RESPONSE" | jq -r '.links[] | select(.rel=="approve") | .href' 2>/dev/null
  else
    echo ""
    echo "❌ Failed to create test order"
  fi
else
  echo ""
  echo "❌ Invalid PayPal credentials"
  echo "Check Client ID and Secret"
fi
