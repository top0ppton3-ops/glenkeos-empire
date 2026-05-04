# 🚀 DEPLOY GLENKEOS - START HERE

**Time Required:** 5-10 minutes  
**Prerequisites:** Supabase account (free), Vercel account (free)

---

## 📋 QUICK DEPLOYMENT CHECKLIST

- [ ] Install Supabase CLI
- [ ] Create Supabase project
- [ ] Link project locally
- [ ] Deploy backend
- [ ] Update Vercel environment variables
- [ ] Verify deployment

---

## STEP 1: INSTALL SUPABASE CLI (1 minute)

**On your local machine or this environment:**

```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

**Alternative installation methods:**
- macOS: `brew install supabase/tap/supabase`
- Windows: `scoop install supabase`
- Linux: Download from https://github.com/supabase/cli/releases

---

## STEP 2: LOGIN TO SUPABASE (30 seconds)

```bash
supabase login
```

This will:
1. Open your browser
2. Ask you to authorize the CLI
3. Generate an access token

**Don't have a Supabase account?**
- Sign up at https://supabase.com (free tier available)

---

## STEP 3: CREATE SUPABASE PROJECT (2 minutes)

**Option A: Via Dashboard (Recommended)**

1. Go to: https://app.supabase.com/new
2. Click "New Project"
3. Fill in:
   - **Organization:** Select or create one
   - **Name:** `glenkeos-production`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., US East, EU West)
4. Click "Create new project"
5. Wait ~2 minutes for project to initialize

**Option B: Via CLI**

```bash
supabase projects create glenkeos-production \
  --org-id YOUR_ORG_ID \
  --db-password YOUR_STRONG_PASSWORD \
  --region us-east-1
```

---

## STEP 4: GET YOUR PROJECT REFERENCE (30 seconds)

After project creation:

1. Go to your project dashboard
2. Look at the URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`
3. Copy the `YOUR_PROJECT_REF` part (e.g., `abcdefghijklmnop`)

**Example:**
```
URL: https://app.supabase.com/project/xyzabc123456
Project Ref: xyzabc123456
```

---

## STEP 5: LINK PROJECT LOCALLY (30 seconds)

**In your project directory:**

```bash
cd /workspaces/default/code

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

**Example:**
```bash
supabase link --project-ref xyzabc123456
```

You'll be asked for your database password (the one you set during project creation).

---

## STEP 6: DEPLOY BACKEND (3 minutes)

**Run the automated deployment script:**

```bash
./deploy-backend-now.sh
```

**What this does:**
1. ✅ Sets PayPal secrets (sandbox credentials)
2. ✅ Pushes database migrations (19 tables, 24 indexes)
3. ✅ Applies RLS security policies
4. ✅ Deploys 8 Edge Functions
5. ✅ Loads seed data (3 brands, sample stores)

**Expected output:**
```
🚀 GlenKeos Backend Deployment Starting...
✅ Supabase CLI found
✅ Project linked
✅ PayPal secrets configured
✅ Database migrations applied
✅ create-paypal-order deployed
✅ capture-paypal-order deployed
✅ paypal-webhook deployed
✅ update-driver-location deployed
✅ get-driver-location deployed
✅ update-loyalty deployed
✅ send-sms deployed
✅ send-email deployed

🎉 DEPLOYMENT COMPLETE!
```

---

## STEP 7: TEST BACKEND (1 minute)

```bash
./test-backend-complete.sh
```

**Expected results:**
- ✅ PayPal order creation works
- ✅ Driver location tracking works
- ✅ Loyalty system works
- ✅ Database schema validated
- ⚠️ SMS/Email skipped (optional features)

**Example test:**
```bash
# Manual PayPal test
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-paypal-order \
  -H "Content-Type: application/json" \
  -d '{"order_id":"test-001","amount":25.00,"currency":"USD"}'
```

---

## STEP 8: GET API CREDENTIALS (1 minute)

1. Go to: https://app.supabase.com/project/YOUR_PROJECT_REF/settings/api

2. Copy these two values:
   - **Project URL:** `https://YOUR_PROJECT_REF.supabase.co`
   - **Anon/Public Key:** Long string starting with `eyJhbGc...`

**Save these somewhere safe - you'll need them in the next step!**

---

## STEP 9: UPDATE VERCEL ENVIRONMENT VARIABLES (2 minutes)

Your frontend is already deployed at:
```
https://codebuild-default-webhook-source-lo.vercel.app
```

**Add environment variables:**

**Option A: Via Vercel Dashboard**

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add two new variables:

```
Name: VITE_SUPABASE_URL
Value: https://YOUR_PROJECT_REF.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGc... (paste your anon key)
```

5. Select **Production**, **Preview**, and **Development**
6. Click **Save**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Login
vercel login

# Add environment variables
vercel env add VITE_SUPABASE_URL production
# Paste: https://YOUR_PROJECT_REF.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: your-anon-key
```

---

## STEP 10: REDEPLOY FRONTEND (1 minute)

**Option A: Via Vercel Dashboard**

1. Go to **Deployments**
2. Click the **⋮** menu on latest deployment
3. Click **Redeploy**
4. Confirm

**Option B: Via Git Push**

```bash
git add .
git commit -m "Connect to Supabase backend"
git push
```

**Option C: Via Vercel CLI**

```bash
vercel --prod
```

---

## STEP 11: VERIFY DEPLOYMENT (1 minute)

**1. Check Frontend Console**

Open your app: https://codebuild-default-webhook-source-lo.vercel.app

Open browser console (F12), you should see:
```
✅ Supabase configured from environment: YOUR_PROJECT_REF
```

**2. Test Order Creation**

Create a test order in any dashboard and verify it:
- Creates successfully
- Shows in database
- Triggers PayPal sandbox order

**3. Test GPS Tracking**

Update a driver location and verify it:
- Updates in real-time
- Shows on map (if implemented)
- Queries return correct location

---

## 🎉 DEPLOYMENT COMPLETE!

### ✅ What You Now Have

**Backend (Supabase):**
- 19 database tables with 24 indexes
- 8 Edge Functions deployed globally
- PayPal sandbox integration verified
- GPS tracking operational
- Loyalty system active
- Enterprise security (RLS) enabled

**Frontend (Vercel):**
- Connected to your Supabase backend
- Environment variables configured
- Real-time data updates
- Multi-brand support
- 11 operational dashboards

**Integrations:**
- PayPal (sandbox) - ready for testing
- SMS (placeholder) - configure later
- Email (placeholder) - configure later

---

## 🔧 OPTIONAL: CONFIGURE NOTIFICATIONS

### SMS Notifications (Twilio)

```bash
# Get credentials from https://www.twilio.com/console
supabase secrets set TWILIO_ACCOUNT_SID="your-account-sid"
supabase secrets set TWILIO_AUTH_TOKEN="your-auth-token"
supabase secrets set TWILIO_PHONE_NUMBER="+15551234567"

# Redeploy send-sms function
supabase functions deploy send-sms --no-verify-jwt
```

### Email Notifications (SendGrid)

```bash
# Get API key from https://app.sendgrid.com/settings/api_keys
supabase secrets set SENDGRID_API_KEY="SG.your-api-key"
supabase secrets set SENDGRID_FROM_EMAIL="noreply@glenkeos.com"

# Redeploy send-email function
supabase functions deploy send-email --no-verify-jwt
```

---

## 🔄 SWITCH TO PRODUCTION PAYPAL

**When ready for live payments:**

1. Create PayPal business account
2. Get production credentials
3. Update secrets:

```bash
supabase secrets set PAYPAL_CLIENT_ID="your-production-client-id"
supabase secrets set PAYPAL_CLIENT_SECRET="your-production-secret"
supabase secrets set PAYPAL_ENVIRONMENT="live"
```

4. Redeploy PayPal functions:

```bash
supabase functions deploy create-paypal-order --no-verify-jwt
supabase functions deploy capture-paypal-order --no-verify-jwt
supabase functions deploy paypal-webhook --no-verify-jwt
```

5. Configure webhook in PayPal dashboard:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/paypal-webhook
   ```

---

## 🆘 TROUBLESHOOTING

### "Project not linked"
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### "Migration failed"
```bash
supabase db reset
supabase db push
```

### "Function deployment error"
```bash
supabase functions logs FUNCTION_NAME
supabase functions deploy FUNCTION_NAME --no-verify-jwt
```

### "Environment variables not updating"
```bash
# Clear Vercel cache and force redeploy
vercel --prod --force
```

### "Supabase not configured" warning
- Verify environment variables are set in Vercel
- Check they're applied to Production environment
- Redeploy after setting variables
- Hard refresh browser (Ctrl+Shift+R)

---

## 📊 MONITORING

### View Function Logs
```bash
# All functions
supabase functions logs --follow

# Specific function
supabase functions logs create-paypal-order --follow
```

### Check Database
```bash
# Open SQL editor in browser
supabase db open

# Check schema
supabase db diff --schema public
```

### View Secrets
```bash
supabase secrets list
```

---

## 📚 DOCUMENTATION REFERENCE

- **Complete Infrastructure:** `BACKEND_INFRASTRUCTURE_COMPLETE.md`
- **Deployment Details:** `DEPLOY_INSTRUCTIONS_FINAL.md`
- **API Reference:** `supabase/functions/README.md`
- **Secrets Guide:** `supabase/SECRETS_SETUP.md`
- **Command Reference:** `COMMAND_REFERENCE.md`
- **All Errors Fixed:** `ALL_ERRORS_RESOLVED.md`

---

## 🎯 SUCCESS CRITERIA

Your deployment is successful when:

- ✅ `supabase functions list` shows 8 functions
- ✅ `supabase secrets list` shows PayPal credentials
- ✅ `./test-backend-complete.sh` passes core tests
- ✅ Frontend console shows "Supabase configured from environment"
- ✅ Can create orders in dashboard
- ✅ PayPal integration creates sandbox orders
- ✅ GPS tracking updates work
- ✅ Loyalty points calculate correctly

---

## ⏱️ TIME BREAKDOWN

- Install CLI: 1 minute
- Login: 30 seconds
- Create project: 2 minutes (wait time)
- Link project: 30 seconds
- Deploy backend: 3 minutes
- Test backend: 1 minute
- Get credentials: 1 minute
- Update Vercel: 2 minutes
- Redeploy: 1 minute
- Verify: 1 minute

**Total: ~12 minutes**

---

## 🚀 START DEPLOYMENT

**Begin here:**

```bash
# Step 1: Install Supabase CLI
npm install -g supabase

# Step 2: Login
supabase login

# Step 3-5: Create and link project (via dashboard)
# Go to: https://app.supabase.com/new

# Step 6: Deploy backend
./deploy-backend-now.sh

# Step 7: Test
./test-backend-complete.sh
```

**Then follow steps 8-11 to connect frontend!**

---

**Ready? Let's deploy! 🚀**

Run this command to start:
```bash
npm install -g supabase && supabase login
```
