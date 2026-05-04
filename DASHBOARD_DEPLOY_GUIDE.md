# 🚀 PayPal Integration - Dashboard Deployment Guide

## Overview
Deploy your PayPal integration directly from Supabase Dashboard (NO CLI needed!).

**Project:** `beswluhdxaphtitaovly`
**Dashboard:** https://supabase.com/dashboard/project/beswluhdxaphtitaovly

---

## STEP 1: Set Environment Secrets (2 minutes)

1. Go to: https://supabase.com/dashboard/project/beswluhdxaphtitaovly/settings/functions
2. Scroll to **"Edge Function Secrets"** section
3. Click **"Add new secret"** and add these THREE secrets:

```
Name: PAYPAL_CLIENT_ID
Value: Aak4lnZ2VoSGGGtyby06OBU4dZ0mtprftwZs43fLICH7G22G0se3c2Q5eDmZStMIwmjRkfDkHK_Kk_6F

Name: PAYPAL_CLIENT_SECRET
Value: EAay-EpxvbnpzooEJIP7dfvNIDWdtCtelD2_-3BKUcNFJVBerv-X2aQRNH1EO1Yy0wG501KIDqmJHgH6

Name: PAYPAL_ENVIRONMENT
Value: sandbox
```

✅ Click **"Save"** after each secret

---

## STEP 2: Deploy Three Functions

Go to: https://supabase.com/dashboard/project/beswluhdxaphtitaovly/functions

### Function 1: create-paypal-order

1. Click **"Deploy a new function"**
2. **Function name:** `create-paypal-order`
3. **Copy & paste** the code from `FUNCTION_1_CREATE_ORDER.ts`
4. Click **"Deploy function"**

### Function 2: capture-paypal-order

1. Click **"Deploy a new function"**
2. **Function name:** `capture-paypal-order`
3. **Copy & paste** the code from `FUNCTION_2_CAPTURE_ORDER.ts`
4. Click **"Deploy function"**

### Function 3: paypal-webhook

1. Click **"Deploy a new function"**
2. **Function name:** `paypal-webhook`
3. **Copy & paste** the code from `FUNCTION_3_WEBHOOK.ts`
4. Click **"Deploy function"**

---

## STEP 3: Test the Integration (2 minutes)

Run this from your terminal (or any REST client):

```bash
curl -X POST \
  "https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-paypal-order" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test_12345",
    "amount": 29.99,
    "currency": "USD"
  }'
```

**Expected response:**
```json
{
  "paypal_order_id": "8AB12345CDEFG",
  "status": "CREATED",
  "links": [...]
}
```

---

## Function URLs (After Deployment)

Once deployed, your functions will be available at:

- **Create Order:** `https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-paypal-order`
- **Capture Order:** `https://beswluhdxaphtitaovly.supabase.co/functions/v1/capture-paypal-order`
- **Webhook:** `https://beswluhdxaphtitaovly.supabase.co/functions/v1/paypal-webhook`

---

## Next Steps

✅ Test the create-order endpoint
✅ Configure PayPal webhook in PayPal Developer Dashboard
✅ Test full payment flow from your frontend

---

## Troubleshooting

**"Function not found"** → Wait 30 seconds after deployment, then retry

**"Invalid credentials"** → Check that secrets were saved correctly in Step 1

**"CORS error"** → Functions include CORS headers, check browser console for details

---

## Support

Your functions are ready! Test them with the curl command above, then integrate with your frontend at:
https://codebuild-default-webhook-source-lo.vercel.app
