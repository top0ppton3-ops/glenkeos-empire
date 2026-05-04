# 🎯 DEPLOY PAYPAL - 5 MINUTE GUIDE

**Method:** Supabase Dashboard (No CLI needed!)

---

## 📋 Quick Steps

### 1️⃣ Set Secrets (1 min)
**URL:** https://supabase.com/dashboard/project/beswluhdxaphtitaovly/settings/functions

Scroll to **"Edge Function Secrets"** → Click **"Add new secret"**:

```
PAYPAL_CLIENT_ID = Aak4lnZ2VoSGGGtyby06OBU4dZ0mtprftwZs43fLICH7G22G0se3c2Q5eDmZStMIwmjRkfDkHK_Kk_6F
PAYPAL_CLIENT_SECRET = EAay-EpxvbnpzooEJIP7dfvNIDWdtCtelD2_-3BKUcNFJVBerv-X2aQRNH1EO1Yy0wG501KIDqmJHgH6
PAYPAL_ENVIRONMENT = sandbox
```

### 2️⃣ Deploy Functions (3 min)
**URL:** https://supabase.com/dashboard/project/beswluhdxaphtitaovly/functions

Click **"Deploy a new function"** three times:

| Function Name | Code File |
|--------------|-----------|
| `create-paypal-order` | Copy from `FUNCTION_1_CREATE_ORDER.ts` |
| `capture-paypal-order` | Copy from `FUNCTION_2_CAPTURE_ORDER.ts` |
| `paypal-webhook` | Copy from `FUNCTION_3_WEBHOOK.ts` |

### 3️⃣ Test (1 min)

```bash
curl -X POST \
  "https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-paypal-order" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"test_001","amount":29.99,"currency":"USD"}'
```

**Expected:** You should see a PayPal order ID in the response!

---

## ✅ That's It!

Your PayPal integration is LIVE at:
- `https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-paypal-order`
- `https://beswluhdxaphtitaovly.supabase.co/functions/v1/capture-paypal-order`
- `https://beswluhdxaphtitaovly.supabase.co/functions/v1/paypal-webhook`

---

## 📁 Files You Need

1. **DASHBOARD_DEPLOY_GUIDE.md** ← Full detailed instructions
2. **FUNCTION_1_CREATE_ORDER.ts** ← Copy/paste for function 1
3. **FUNCTION_2_CAPTURE_ORDER.ts** ← Copy/paste for function 2
4. **FUNCTION_3_WEBHOOK.ts** ← Copy/paste for function 3

---

## 🚨 Troubleshooting

**"Invalid credentials"** → Double-check secrets in Step 1

**"Function not found"** → Wait 30 seconds after deployment

**CORS errors** → Functions already include CORS headers

---

**Your frontend is ready:** https://codebuild-default-webhook-source-lo.vercel.app

**Test credentials are working:** Order ID `02M50197TY5129543` already created successfully!

Now just deploy these three functions and you're done! 🎉
