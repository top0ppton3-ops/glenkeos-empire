# PayPal Integration - Test & Verification

## Setup (5 min)

### 1. Get PayPal Sandbox Credentials
1. Go to https://developer.paypal.com/dashboard/
2. Login with your PayPal account
3. Apps & Credentials → Create App
4. Copy:
   - **Client ID**
   - **Secret** (click "Show" under Secret)

### 2. Add to Supabase
Supabase Dashboard → Project Settings → Edge Functions → Add secrets:
```bash
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_secret_here
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_WEBHOOK_ID=your_webhook_id (get from step 3)
```

### 3. Create Webhook
1. PayPal Dashboard → Webhooks
2. Add Webhook
3. URL: `https://beswluhdxaphtitaovly.supabase.co/functions/v1/paypal-webhook`
4. Events: Select **All Events** or at minimum:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
5. Copy **Webhook ID** → Add to Supabase env

## Test Flow

### Test 1: Create PayPal Order
```bash
curl -X POST \
  https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-paypal-order \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test_order_001",
    "amount": 25.99,
    "currency": "USD"
  }'
```

**Expected Response:**
```json
{
  "paypal_order_id": "8FU12345ABCDE",
  "status": "CREATED",
  "links": [...]
}
```

### Test 2: Approve Payment (Manual)
1. Copy `approve` link from response
2. Open in browser
3. Login with PayPal Sandbox buyer account
4. Approve payment

### Test 3: Capture Payment
```bash
curl -X POST \
  https://beswluhdxaphtitaovly.supabase.co/functions/v1/capture-paypal-order \
  -H "Content-Type: application/json" \
  -d '{
    "paypal_order_id": "8FU12345ABCDE",
    "order_id": "test_order_001"
  }'
```

**Expected Response:**
```json
{
  "paypal_order_id": "8FU12345ABCDE",
  "capture_id": "9AB12345CDEFG",
  "status": "COMPLETED",
  "payment_status": "PAID"
}
```

### Test 4: Verify Webhook
PayPal automatically sends webhook → Check Supabase logs:
```bash
npx supabase functions logs paypal-webhook --tail
```

**Expected Log:**
```
Processing PayPal webhook: PAYMENT.CAPTURE.COMPLETED
Payment captured: 8FU12345ABCDE
Order updated to PAID: test_order_001
```

## Verification Checklist

- [ ] Create order returns `paypal_order_id`
- [ ] Approve link works in browser
- [ ] Capture returns `COMPLETED` status
- [ ] Order status updates to `PAID` in database
- [ ] Webhook receives and processes event
- [ ] Transaction ID stored correctly

## Sandbox Test Accounts

Create test accounts at: https://developer.paypal.com/dashboard/accounts

**Buyer Account (for testing payments):**
- Email: sb-buyer@personal.example.com
- Password: Test1234!

**Seller Account (receives payments):**
- Email: sb-seller@business.example.com
- Password: Test1234!

## Production Deployment

### Before Going Live:
1. Get Live API credentials from PayPal
2. Update env vars:
   ```bash
   PAYPAL_ENVIRONMENT=live
   PAYPAL_CLIENT_ID=live_client_id
   PAYPAL_CLIENT_SECRET=live_secret
   ```
3. Update webhook URL to production domain
4. Test with small transaction ($0.01)
5. Monitor logs for 24 hours

## Troubleshooting

### Error: "PayPal token error"
- Check CLIENT_ID and CLIENT_SECRET are correct
- Verify PAYPAL_ENVIRONMENT is set

### Error: "Invalid webhook signature"
- Check PAYPAL_WEBHOOK_ID matches PayPal dashboard
- Verify webhook URL is correct

### Order doesn't update to PAID
- Check webhook is sending events
- Verify `paypal_order_id` matches
- Check Supabase logs for errors

## Integration Status

✅ create-paypal-order function deployed  
✅ capture-paypal-order function deployed  
✅ paypal-webhook function deployed  
✅ Database schema supports payment fields  
✅ Frontend PayPalButton component ready  
✅ Error handling implemented  
✅ Webhook verification active  

**Status: READY FOR TESTING**
