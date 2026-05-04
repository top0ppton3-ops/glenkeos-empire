# 🚀 DEPLOY BACKEND NOW - Complete Guide

## Our Database Schema (For Reference)

**payments table uses:**
- `external_payment_id` VARCHAR(255) ← Stores PayPal order ID
- `payment_details` JSONB ← Stores raw webhook data
- `payment_status` ← PENDING, AUTHORIZED, COMPLETED, FAILED, REFUNDED

**orders table uses:**
- `metadata` JSONB ← Additional PayPal data
- `order_status` ← PENDING, ACCEPTED, IN_PREP, READY, etc.

✅ **Webhook is now updated to match this schema!**

---

## STEP 1: Deploy Database Schema (2 minutes)

### In Supabase Dashboard:

1. **Go to SQL Editor** (left sidebar)
2. **Click "New Query"**
3. **Copy the entire file:** `/workspaces/default/code/supabase/migrations/0001_complete_schema.sql`
4. **Paste and click "RUN"**

This creates:
- ✅ 19 tables
- ✅ PostGIS extension
- ✅ Row-level security
- ✅ 3 brands, 4 stores, 9 menu items

**Verify:** Go to Table Editor → should see all 19 tables

---

## STEP 2: Set Secrets (1 minute)

### Required Secrets:

In **Supabase Dashboard → Project Settings → Edge Functions → Secrets**

Add these:

```
PAYPAL_CLIENT_ID = Aak4lnZ2VoSGGGtyby06OBU4dZ0mtprftwZs43fLICH7G22G0se3c2Q5eDmZStMIwmjRkfDkHK_Kk_6F

PAYPAL_CLIENT_SECRET = EKkFDzC-hX_TxE0c45vp_4Tp_PGvwrHQZRhOCHWvqyJqH1YBSL4dDcNKGKlU3v-SdYxTILjhpxJzWOZj

PAYPAL_ENVIRONMENT = sandbox
```

### Optional (for webhook verification):

```
PAYPAL_WEBHOOK_ID = (get this after creating webhook in PayPal dashboard)
```

**Note:** SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically provided.

---

## STEP 3: Deploy Edge Functions (Optional - CLI Required)

```bash
# Login to Supabase
pnpm dlx supabase login

# Link to your project (get ref from dashboard URL)
pnpm dlx supabase link --project-ref YOUR_PROJECT_REF

# Deploy PayPal webhook
pnpm dlx supabase functions deploy paypal-webhook
```

---

## STEP 4: Get Credentials & Update Vercel

1. **Supabase Dashboard → Settings → API**
2. Copy: Project URL and anon public key
3. **Vercel Dashboard → Settings → Environment Variables**
4. Add:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
5. **Redeploy frontend**

---

✅ **DONE! Your backend is live!**
