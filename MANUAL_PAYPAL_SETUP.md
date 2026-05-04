# Manual PayPal Setup Instructions

## Issue Found
The PayPal credentials you provided returned a 400 error from PayPal's API. This typically means:
1. Credentials are for production, not sandbox
2. Credentials are incomplete/split
3. App is not configured correctly in PayPal Developer Dashboard

## Setup PayPal Correctly (10 min)

### Step 1: Get Valid Sandbox Credentials

1. **Go to PayPal Developer Dashboard**
   - URL: https://developer.paypal.com/dashboard/
   - Login with your PayPal account

2. **Create a Sandbox App**
   - Click "Apps & Credentials"
   - Make sure you're on "Sandbox" tab (NOT Live)
   - Click "Create App"
   - Name: "GlenKeos Sandbox"
   - Select "Merchant" account type
   - Click "Create App"

3. **Copy Credentials**
   - You'll see **Client ID** (visible immediately)
   - Click "Show" under **Secret** to reveal it
   - Copy both - they should look like:
     ```
     Client ID: AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (starts with A)
     Secret: EXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (starts with E)
     ```

### Step 2: Add to Supabase (5 min)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/beswluhdxaphtitaovly
   - Settings → Edge Functions → Manage secrets

2. **Add these secrets:**
   ```
   PAYPAL_CLIENT_ID=<your_client_id_from_step_1>
   PAYPAL_CLIENT_SECRET=<your_secret_from_step_1>
   PAYPAL_ENVIRONMENT=sandbox
   ```

3. **Click "Add secret" for each one**

### Step 3: Deploy Functions (3 min)

From your local terminal (NOT Figma Make):

```bash
# Make sure you're in the project directory
cd /path/to/GlenKeos

# Deploy PayPal functions
npx supabase functions deploy create-paypal-order --project-ref beswluhdxaphtitaovly
npx supabase functions deploy capture-paypal-order --project-ref beswluhdxaphtitaovly
npx supabase functions deploy paypal-webhook --project-ref beswluhdxaphtitaovly
```

### Step 4: Create Webhook (5 min)

1. **In PayPal Developer Dashboard**
   - Apps & Credentials → Your App → Webhooks
   - Click "Add Webhook"

2. **Configure Webhook**
   - **Webhook URL:** 
     ```
     https://beswluhdxaphtitaovly.supabase.co/functions/v1/paypal-webhook
     ```
   - **Event types:** Select these:
     - ✅ `PAYMENT.CAPTURE.COMPLETED`
     - ✅ `PAYMENT.CAPTURE.DENIED`
     - ✅ `PAYMENT.CAPTURE.REFUNDED` (optional)

3. **Save and Copy Webhook ID**
   - After saving, copy the Webhook ID
   - Add to Supabase secrets:
     ```
     PAYPAL_WEBHOOK_ID=<your_webhook_id>
     ```

### Step 5: Test Integration (5 min)

Run the test script:

```bash
./test-paypal.sh
```

**Expected output:**
```json
{
  "paypal_order_id": "8AB12345CDEFG",
  "status": "CREATED",
  "links": [...]
}
```

### Step 6: Test Full Payment Flow (10 min)

1. **Create order** (test script does this)
2. **Copy approve URL** from response
3. **Open in browser** → Login with PayPal sandbox buyer account
4. **Approve payment**
5. **Capture payment** (frontend does this automatically)
6. **Verify** order status updated to PAID

## Troubleshooting

### "Invalid credentials" error
- Verify you copied from **Sandbox** tab, not Live
- Check for extra spaces/characters
- Regenerate secret in PayPal dashboard

### "Function not found" error
- Deploy functions (see Step 3)
- Wait 30 seconds after deployment

### "Webhook verification failed"
- Check PAYPAL_WEBHOOK_ID is correct
- Verify webhook URL matches exactly
- Check webhook is active in PayPal dashboard

## Alternative: Use My Test Credentials

If you want to test immediately, I can provide test PayPal sandbox credentials that are known to work. However, you should create your own for production.

## Quick Test Without Deployment

Want to verify your PayPal setup before deploying? Run:

```bash
./test-credentials.sh
```

This tests your credentials directly against PayPal API without touching Supabase.

---

**Bottom line:** The credentials you provided aren't working with PayPal's sandbox API. Follow Step 1 above to get fresh credentials from the correct location in your PayPal Developer Dashboard.
