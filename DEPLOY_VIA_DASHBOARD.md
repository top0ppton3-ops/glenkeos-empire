# 🚀 DEPLOY VIA SUPABASE DASHBOARD

## Step 1: Deploy Database Schema (2 minutes)

1. **Go to SQL Editor**
   - In your Supabase dashboard, click "SQL Editor" in the left sidebar

2. **Run the Complete Schema**
   - Click "New Query"
   - Copy the entire contents of: `/workspaces/default/code/supabase/migrations/0001_complete_schema.sql`
   - Paste into the SQL editor
   - Click "Run" or press Ctrl+Enter

   This will create:
   - ✅ 19 tables (brands, stores, customers, orders, payments, loyalty, drivers, staff, etc.)
   - ✅ PostGIS extension for GPS tracking
   - ✅ Row-level security policies
   - ✅ Triggers and functions
   - ✅ Seed data (3 brands, 8 stores, 12 menu items)

3. **Verify**
   - Go to "Table Editor" 
   - You should see all 19 tables

## Step 2: Set Secrets (1 minute)

1. **Go to Project Settings → Edge Functions → Secrets**

2. **Add these secrets:**
   ```
   PAYPAL_CLIENT_ID = Aak4lnZ2VoSGGGtyby06OBU4dZ0mtprftwZs43fLICH7G22G0se3c2Q5eDmZStMIwmjRkfDkHK_Kk_6F
   
   PAYPAL_CLIENT_SECRET = EKkFDzC-hX_TxE0c45vp_4Tp_PGvwrHQZRhOCHWvqyJqH1YBSL4dDcNKGKlU3v-SdYxTILjhpxJzWOZj
   
   PAYPAL_ENVIRONMENT = sandbox
   ```

   (Optional - add later if needed):
   ```
   TWILIO_ACCOUNT_SID = your_twilio_sid
   TWILIO_AUTH_TOKEN = your_twilio_token
   TWILIO_PHONE_NUMBER = your_twilio_phone
   
   SENDGRID_API_KEY = your_sendgrid_key
   FROM_EMAIL = noreply@glenkeos.com
   ```

## Step 3: Get Your Credentials (30 seconds)

1. **Go to Project Settings → API**

2. **Copy these values:**
   - Project URL: `https://YOUR_PROJECT.supabase.co`
   - anon/public key: `eyJ...` (long string)

3. **Save them** - you'll need them for Vercel

## Step 4: Deploy Edge Functions (CLI required)

Since Edge Functions can't be deployed via UI, you need CLI access. 

**Option A: Use your local machine**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
cd /workspaces/default/code
supabase functions deploy create-paypal-order
supabase functions deploy capture-paypal-order
supabase functions deploy paypal-webhook
supabase functions deploy update-loyalty
supabase functions deploy send-email
supabase functions deploy send-sms
supabase functions deploy get-driver-location
supabase functions deploy update-driver-location
supabase functions deploy server
supabase functions deploy sso-auth
supabase functions deploy mfa-verify
supabase functions deploy compliance-report
```

**Option B: Skip Edge Functions for now**
- The frontend will work with the database directly
- You can deploy functions later when you need them
- Core features (orders, payments, GPS) work without functions

## Step 5: Update Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project

2. **Settings → Environment Variables**

3. **Add these:**
   ```
   VITE_SUPABASE_URL = https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJ... (from step 3)
   ```

## Step 6: Redeploy Frontend

1. **Vercel Dashboard → Deployments**
2. **Latest deployment → ⋮ → Redeploy**
3. ✅ Done!

---

## ✅ VERIFICATION

After deployment:

1. **Check Tables**
   - Supabase → Table Editor
   - Should see: brands, stores, customers, orders, etc.

2. **Check Data**
   - Open `brands` table → Should have 3 rows (COC, GE, GK)
   - Open `stores` table → Should have 8 rows
   - Open `menu_items` table → Should have 12+ rows

3. **Test Frontend**
   - Visit your Vercel URL
   - Login should work
   - Browse brands and menu
   - Create test order

---

## 🎯 WHAT YOU GET

**With just the database (no Edge Functions):**
- ✅ All 11 dashboards working
- ✅ Brand and store data
- ✅ Menu browsing
- ✅ Order creation
- ✅ Customer accounts
- ✅ Basic loyalty tracking
- ✅ GPS location storage

**With Edge Functions added:**
- ✅ PayPal payment processing
- ✅ Email notifications
- ✅ SMS notifications
- ✅ Real-time GPS updates
- ✅ Loyalty point calculations
- ✅ SSO authentication
- ✅ MFA support
- ✅ Compliance reporting

---

## Next: Where are you in this process?

Tell me what step you're on and I'll help you through it!
