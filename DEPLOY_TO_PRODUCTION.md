# 🚀 GlenKeos Production Deployment Guide

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] Supabase project created: `beswluhdxaphtitaovly.supabase.co`
- [ ] Vercel project created: `codebuild-default-webhook-source`
- [ ] GitHub repository connected (if using Git-based deployment)
- [ ] PayPal Developer account created
- [ ] All API keys collected

---

## 🗄️ STEP 1: DEPLOY SUPABASE DATABASE

### 1.1 Apply RLS Migration

1. Go to https://beswluhdxaphtitaovly.supabase.co
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy contents from `/supabase/migrations/20260422180000_hierarchical_tenant_rls.sql`
5. Paste and click **Run**
6. Verify: "Success. No rows returned"

### 1.2 Verify Tables Exist

Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- `customers`
- `customer_addresses`
- `orders`
- `order_items`
- `menu_items`
- `stores`
- `drivers`
- `inventory_items`
- `loyalty_points`
- `payments`
- `compliance_logs`
- `staff`
- `policies`
- `risk_events`

### 1.3 Verify RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All should show `rowsecurity = t` (true)

### 1.4 Seed Sample Data

```sql
-- Create brands/stores
INSERT INTO stores (id, name, brand, address, city, state, zip, tenant_id, is_active) VALUES
  ('store-coc-001', 'Chic-on-Chain Downtown', 'chic-on-chain', '123 Premium Ave', 'New York', 'NY', '10001', 'chic-on-chain', true),
  ('store-ge-001', 'Ghetto Eats Express', 'ghetto-eats', '456 Fast Street', 'Brooklyn', 'NY', '11201', 'ghetto-eats', true),
  ('store-gk-001', 'GoldKey Concierge', 'goldkey', '789 Luxury Blvd', 'Manhattan', 'NY', '10019', 'goldkey', true);

-- Create menu items
INSERT INTO menu_items (id, name, description, price, category, tenant_id, store_id, is_active, image_url) VALUES
  ('menu-coc-001', 'Truffle Burger', 'Premium grass-fed beef with black truffle aioli', 24.99, 'Entrees', 'chic-on-chain', 'store-coc-001', true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
  ('menu-coc-002', 'Lobster Mac & Cheese', 'Maine lobster in aged cheddar sauce', 32.99, 'Entrees', 'chic-on-chain', 'store-coc-001', true, 'https://images.unsplash.com/photo-1476124369491-c0df5e48c6fa?w=400'),
  ('menu-ge-001', 'Quick Tacos (3)', 'Street-style tacos, your choice of protein', 8.99, 'Entrees', 'ghetto-eats', 'store-ge-001', true, 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400'),
  ('menu-ge-002', 'Loaded Fries', 'Crispy fries, cheese, bacon, jalapeños', 6.99, 'Sides', 'ghetto-eats', 'store-ge-001', true, 'https://images.unsplash.com/photo-1585238341710-401c2a7d3285?w=400'),
  ('menu-gk-001', 'A5 Wagyu Experience', 'Japanese Wagyu ribeye, tableside service', 299.99, 'Exclusive', 'goldkey', 'store-gk-001', true, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
  ('menu-gk-002', 'Caviar Service', 'Oscietra caviar with traditional accompaniments', 189.99, 'Exclusive', 'goldkey', 'store-gk-001', true, 'https://images.unsplash.com/photo-1607623488509-d6b75e2c156b?w=400');
```

### 1.5 Create Test User

```sql
-- This will be done through Auth signup, but verify customers table is ready
SELECT * FROM customers LIMIT 5;
```

---

## ⚡ STEP 2: DEPLOY SUPABASE EDGE FUNCTIONS

### 2.1 Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

### 2.2 Login to Supabase

```bash
supabase login
```

This opens a browser for authentication.

### 2.3 Link to Your Project

```bash
supabase link --project-ref beswluhdxaphtitaovly
```

### 2.4 Deploy Edge Functions

```bash
# Deploy PayPal functions
supabase functions deploy create-paypal-order
supabase functions deploy capture-paypal-order
supabase functions deploy paypal-webhook

# Deploy notification functions
supabase functions deploy send-email
supabase functions deploy send-sms

# Deploy operational functions
supabase functions deploy update-loyalty
supabase functions deploy get-driver-location
supabase functions deploy update-driver-location

# Deploy MFA/SSO functions
supabase functions deploy mfa-verify
supabase functions deploy sso-auth
```

### 2.5 Set Edge Function Secrets

```bash
# PayPal configuration
supabase secrets set PAYPAL_CLIENT_ID=your_sandbox_client_id
supabase secrets set PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
supabase secrets set PAYPAL_ENVIRONMENT=sandbox

# Email configuration (if using SendGrid, etc.)
supabase secrets set SENDGRID_API_KEY=your_sendgrid_key

# SMS configuration (if using Twilio, etc.)
supabase secrets set TWILIO_ACCOUNT_SID=your_twilio_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_twilio_token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

### 2.6 Verify Edge Functions

```bash
# List all deployed functions
supabase functions list

# Test a function
curl -X POST \
  https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-paypal-order \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"test-123","amount":29.99}'
```

---

## 🔧 STEP 3: CONFIGURE VERCEL

### 3.1 Add Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project: `codebuild-default-webhook-source`
3. Go to **Settings** → **Environment Variables**
4. Add the following for **Production, Preview, Development**:

```bash
# Supabase
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic

# PayPal (for frontend PayPal button)
VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id
VITE_PAYPAL_ENVIRONMENT=sandbox
```

### 3.2 Trigger Deployment

**Option A: Auto-deploy (Figma Make)**
- Changes auto-save
- GitHub auto-syncs
- Vercel auto-deploys

**Option B: Manual Redeploy**
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **Redeploy**

**Option C: Git Push (if using Git directly)**
```bash
git add .
git commit -m "feat: production backend integration"
git push origin main
```

### 3.3 Monitor Build

1. Go to **Deployments** tab
2. Click on the deployment
3. Watch build logs
4. Wait for "Deployment Ready" (usually 2-3 minutes)

### 3.4 Verify Deployment

Visit your live URL:
- **Production**: https://codebuild-default-webhook-source.vercel.app
- **Preview**: https://codebuild-default-webhook-source-git-branch-name.vercel.app

---

## 🧪 STEP 4: TEST PRODUCTION

### 4.1 Test Homepage

1. Visit https://codebuild-default-webhook-source.vercel.app
2. Verify page loads without errors
3. Check browser console for errors (F12 → Console)

### 4.2 Test Brand Menus

1. Go to `/chic-on-chain/menu`
2. Should see menu items loaded from Supabase
3. Check Network tab (F12 → Network) for Supabase API calls

Expected request:
```
GET https://beswluhdxaphtitaovly.supabase.co/rest/v1/menu_items?...
```

### 4.3 Test Cart & Checkout

1. Add items to cart
2. Go to `/cart`
3. Click "Checkout"
4. Fill in details
5. Test PayPal payment (sandbox mode)

### 4.4 Test Authentication

1. Click "Sign Up" or "Login"
2. Create test account
3. Verify JWT session in localStorage
4. Check Supabase Auth dashboard for new user

### 4.5 Test RLS

Open browser console:
```javascript
// Should work (authenticated user sees own orders)
const { data, error } = await supabase
  .from('orders')
  .select('*');
console.log('My Orders:', data);

// Should fail (can't see other tenant's data without permission)
const { data: otherData, error: otherError } = await supabase
  .from('menu_items')
  .select('*')
  .eq('tenant_id', 'other-brand');
console.log('Other Brand:', otherData, otherError);
```

---

## 📊 STEP 5: MONITORING & ANALYTICS

### 5.1 Vercel Analytics

1. Go to https://vercel.com/dashboard
2. Select project
3. Click **Analytics** tab
4. Enable Web Analytics (free tier available)

### 5.2 Supabase Logs

1. Go to https://beswluhdxaphtitaovly.supabase.co
2. Click **Logs** in sidebar
3. Monitor:
   - **API Logs**: Database queries
   - **Auth Logs**: Login/signup events
   - **Functions Logs**: Edge function execution

### 5.3 Error Tracking (Optional)

Add Sentry or similar:
```bash
npm install @sentry/react
```

---

## 🔒 STEP 6: SECURITY HARDENING

### 6.1 Enable Supabase Auth Email Verification

1. Go to **Authentication** → **Settings**
2. Enable "Confirm email" for signups
3. Configure email templates

### 6.2 Configure CORS

Supabase Edge Functions already have CORS enabled.

Verify in `/supabase/functions/*/index.ts`:
```typescript
headers: {
  "Access-Control-Allow-Origin": "*", // Or specific domain
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

### 6.3 Rate Limiting

Enable in Supabase dashboard:
1. Go to **Settings** → **API**
2. Configure rate limits (default: 100 req/s)

### 6.4 Review RLS Policies

```sql
-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

Verify each table has appropriate policies.

---

## 🎯 STEP 7: GO LIVE CHECKLIST

- [ ] Database migration applied
- [ ] Sample data seeded
- [ ] Edge Functions deployed
- [ ] Vercel environment variables set
- [ ] Production deployment successful
- [ ] Homepage loads correctly
- [ ] Menu items display from database
- [ ] Cart system works
- [ ] Checkout flow works
- [ ] PayPal integration tested (sandbox)
- [ ] Authentication works
- [ ] RLS policies enforced
- [ ] All brands accessible (Chic-on-Chain, Ghetto Eats, GoldKey)
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Analytics enabled
- [ ] Monitoring configured

---

## 🚨 ROLLBACK PROCEDURE

If deployment fails:

### Vercel Rollback:
1. Go to **Deployments**
2. Find previous working deployment
3. Click **"..."** → **Promote to Production**

### Supabase Rollback:
1. Go to **Database** → **Migrations**
2. Revert migration if needed
3. Or restore from automatic backup

### Edge Functions Rollback:
```bash
# Redeploy previous version
supabase functions deploy function-name --no-verify-jwt
```

---

## 📞 SUPPORT RESOURCES

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **PayPal Sandbox**: https://developer.paypal.com/dashboard
- **Project Logs**: https://vercel.com/dashboard/logs

---

## 🎉 SUCCESS!

Your GlenKeos platform is now live at:
**https://codebuild-default-webhook-source.vercel.app**

Next steps:
1. Switch PayPal from sandbox to live
2. Add custom domain (optional)
3. Enable production monitoring
4. Set up automated backups
5. Configure CI/CD pipeline
6. Plan scaling strategy
