# 🚀 GlenKeos Vercel Production Deployment Guide

**Stack:** React + Vite (SPA) + Supabase  
**Date:** April 23, 2026  
**Status:** Production Ready

---

## ✅ CURRENT SETUP ANALYSIS

### Your Frontend Code (/src/app/services/supabase.ts)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://beswluhdxaphtitaovly.supabase.co';
const supabaseAnonKey = 'eyJhbGci...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**❌ ISSUE:** Hardcoded credentials (won't use Vercel env vars)

### Your Auth Context (/src/app/contexts/AuthContext.tsx)
```typescript
// ✅ CORRECT - Uses Supabase Auth properly
supabase.auth.getSession()  // Gets JWT automatically
supabase.auth.onAuthStateChange()  // Listens for changes
supabase.auth.signInWithPassword()
```

### Your Edge Function Calls (/src/app/services/api/client.ts)
```typescript
// ✅ CORRECT - Fetches JWT automatically
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

headers["Authorization"] = `Bearer ${token}`;  // Sends JWT to Edge Function
```

**Backend URL:**
```typescript
const BACKEND_URL = `https://${projectId}.supabase.co/functions/v1/server`;
```

---

## 🔧 REQUIRED FIXES FOR VERCEL

### Fix 1: Update /src/app/services/supabase.ts

**Replace with:**
```typescript
import { createClient } from '@supabase/supabase-js';

// Use Vite environment variables (VITE_ prefix required)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://beswluhdxaphtitaovly.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check Vercel settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Export for debugging
export { supabaseUrl, supabaseAnonKey };
```

### Fix 2: Update /utils/supabase/client.ts (if exists)

Check if this file exists and uses the same pattern.

### Fix 3: Update OAuth Redirect URLs in Supabase

**Go to:** Supabase Dashboard → Authentication → URL Configuration

**Add these URLs:**
```
http://localhost:5173/**
https://*-<your-vercel-team>.vercel.app/**
https://codebuild-default-webhook-source-lo.vercel.app/**
```

**Set SITE_URL:**
```
Production: https://codebuild-default-webhook-source-lo.vercel.app
```

**Example wildcard for Vercel previews:**
```
https://*-glenkeos-team.vercel.app/**
```

This allows OAuth (Google login) to work on:
- Local development (localhost:5173)
- Vercel preview deploys (PR branches)
- Production (your main domain)

---

## 📦 VERCEL ENVIRONMENT VARIABLES

### Step 1: Go to Vercel Dashboard
```
https://vercel.com/dashboard
→ Select your project
→ Settings
→ Environment Variables
```

### Step 2: Add These Variables

**For ALL environments (Production, Preview, Development):**

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `VITE_SUPABASE_URL` | `https://beswluhdxaphtitaovly.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic` | Production, Preview, Development |
| `VITE_PAYPAL_CLIENT_ID` | `<your_paypal_client_id>` | Production, Preview, Development |
| `VITE_PAYPAL_ENVIRONMENT` | `sandbox` (or `live` for production) | Production, Preview, Development |

**⚠️ CRITICAL:** 
- These are PUBLIC keys (safe to expose in browser)
- Security is enforced by Supabase RLS policies, not by hiding keys
- Never add `service_role` key to Vercel (that's SECRET and only for Edge Functions)

### Step 3: Verify Environment Variables

After setting, click "Redeploy" in Vercel to apply the new env vars.

---

## 🔐 SUPABASE EDGE FUNCTION SECRETS

These are PRIVATE and set on Supabase side (NOT Vercel):

### Set via Supabase CLI:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref beswluhdxaphtitaovly

# Set secrets (these are for Edge Functions only)
supabase secrets set PAYPAL_CLIENT_ID=<your_paypal_client_id>
supabase secrets set PAYPAL_CLIENT_SECRET=<your_paypal_secret>
supabase secrets set PAYPAL_MODE=sandbox  # or 'live'

supabase secrets set TWILIO_ACCOUNT_SID=<your_twilio_sid>
supabase secrets set TWILIO_AUTH_TOKEN=<your_twilio_token>
supabase secrets set TWILIO_PHONE_NUMBER=<your_twilio_number>

supabase secrets set SENDGRID_API_KEY=<your_sendgrid_key>
supabase secrets set SENDGRID_FROM_EMAIL=noreply@glenkeos.com

# Verify secrets
supabase secrets list
```

**These secrets are:**
- Only accessible to Supabase Edge Functions (server-side)
- Never exposed to browser
- Required for PayPal, SMS, Email to work

---

## 🚀 DEPLOYMENT WORKFLOW

### Automatic Deployment (Recommended)

**GitHub → Vercel auto-deploy:**
```bash
git add .
git commit -m "Update Supabase client to use env vars"
git push origin main
```

Vercel will:
1. Detect the push
2. Install dependencies (`pnpm install`)
3. Build the project (`pnpm run build`)
4. Deploy to CDN
5. Live in 2-3 minutes

### Manual Deployment (If needed)

```bash
# Install Vercel CLI (one-time)
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## ✅ EDGE FUNCTION SETUP (Supabase Side)

### Your Current Edge Functions

Based on your code, you're calling:
- `/create-paypal-order` - Initialize PayPal payment
- `/capture-paypal-order` - Complete PayPal payment
- Potentially `/server` - Main API handler

### Ensure Edge Functions Use Auth Context

**Example Edge Function with JWT validation:**

```typescript
// /supabase/functions/create-paypal-order/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Get Authorization header
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Missing authorization header' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Create Supabase client with user's JWT
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader }
      }
    }
  );

  // Now RLS policies will apply based on the user's JWT
  const { data: { user } } = await supabaseClient.auth.getUser();
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Business logic here
  // user.id is available
  // RLS will filter database queries based on JWT claims
  
  const { order_id, amount, currency } = await req.json();
  
  // PayPal API call logic...
  const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const paypalSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  
  // ... create PayPal order ...
  
  return new Response(
    JSON.stringify({ paypal_order_id: '...', status: 'created' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

**Key Points:**
1. Edge Function receives `Authorization: Bearer <jwt>` from browser
2. Creates Supabase client with that JWT
3. Calls `supabaseClient.auth.getUser()` to validate
4. All database queries respect RLS policies
5. Secrets (`PAYPAL_CLIENT_ID`, etc.) are accessed via `Deno.env.get()`

### Deploy Edge Functions

```bash
# Deploy all functions
cd /path/to/your/project

supabase functions deploy create-paypal-order
supabase functions deploy capture-paypal-order
supabase functions deploy paypal-webhook
supabase functions deploy send-email
supabase functions deploy send-sms
supabase functions deploy update-loyalty
supabase functions deploy get-driver-location
supabase functions deploy update-driver-location
supabase functions deploy compliance-report
supabase functions deploy mfa-verify
supabase functions deploy sso-auth
supabase functions deploy server

# Or deploy all at once
for func in supabase/functions/*/; do
  supabase functions deploy $(basename $func)
done
```

---

## 🔍 VERIFICATION CHECKLIST

### Before Going Live

- [ ] **Fix 1 Applied:** `/src/app/services/supabase.ts` uses `import.meta.env.VITE_*`
- [ ] **Vercel Env Vars Set:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured
- [ ] **OAuth URLs Configured:** Vercel domain added to Supabase Auth settings
- [ ] **Supabase Secrets Set:** PayPal, Twilio, SendGrid keys added
- [ ] **Edge Functions Deployed:** All 12 functions deployed to Supabase
- [ ] **Test Build Locally:** `pnpm run build` succeeds
- [ ] **Test Auth Flow:** Login works on production
- [ ] **Test Edge Function:** PayPal payment works
- [ ] **Check Browser Console:** No CORS or auth errors

### After Deployment

1. **Open Production URL:**
   ```
   https://codebuild-default-webhook-source-lo.vercel.app
   ```

2. **Check Browser Console:**
   ```javascript
   // Should see in console:
   ✅ Environment validated successfully
   🔧 Mode: production
   🗄️ Supabase: https://beswluhdxaphtitaovly.supabase.co
   ```

3. **Test Authentication:**
   - Try logging in
   - Check `localStorage` for `supabase.auth.token`
   - Verify JWT is present

4. **Test Edge Function Call:**
   - Try PayPal checkout
   - Open Network tab
   - Check request to `https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-paypal-order`
   - Verify `Authorization: Bearer <jwt>` header is sent

5. **Check Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/beswluhdxaphtitaovly
   → Edge Functions → Logs
   ```
   - Look for function invocations
   - Check for errors

---

## 🐛 TROUBLESHOOTING

### Issue: "Missing Supabase environment variables"

**Cause:** Vercel env vars not set or wrong names

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Ensure they're enabled for all environments (Production, Preview, Development)
4. Redeploy: Deployments → ... → Redeploy

### Issue: OAuth redirect fails

**Cause:** Vercel domain not in Supabase allowed URLs

**Fix:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add Vercel domain: `https://*-<team>.vercel.app/**`
3. Add production domain: `https://codebuild-default-webhook-source-lo.vercel.app/**`

### Issue: Edge Function returns 401

**Cause:** JWT not being sent or invalid

**Fix:**
1. Check browser console for `🔐 JWT token present? true`
2. Verify user is logged in before calling Edge Function
3. Check Network tab for `Authorization` header in request
4. Check Edge Function logs in Supabase Dashboard

### Issue: Edge Function can't access secrets

**Cause:** Secrets not set on Supabase

**Fix:**
```bash
supabase secrets set PAYPAL_CLIENT_ID=<value>
supabase secrets set PAYPAL_CLIENT_SECRET=<value>
```

### Issue: Build fails with "import.meta.env not defined"

**Cause:** Using wrong env var syntax

**Fix:** Ensure you're using `import.meta.env.VITE_*` (NOT `process.env.*`)

---

## 📋 DEPLOYMENT CHECKLIST

### One-Time Setup

- [x] Vercel project created and connected to GitHub
- [x] Supabase project created (beswluhdxaphtitaovly)
- [ ] **TODO:** Fix `supabase.ts` to use `import.meta.env`
- [ ] **TODO:** Set Vercel environment variables
- [ ] **TODO:** Configure OAuth redirect URLs in Supabase
- [ ] **TODO:** Set Supabase secrets for Edge Functions
- [ ] **TODO:** Deploy all Edge Functions to Supabase
- [ ] **TODO:** Test end-to-end flow

### Every Deploy

- [ ] Test locally: `pnpm run dev`
- [ ] Build locally: `pnpm run build`
- [ ] Commit changes: `git commit -m "message"`
- [ ] Push to main: `git push origin main`
- [ ] Wait for Vercel deploy (2-3 min)
- [ ] Test production URL
- [ ] Check for errors in Vercel logs
- [ ] Check for errors in Supabase Edge Function logs

---

## 🎯 NEXT STEPS

1. **Apply Fix 1:** Update `/src/app/services/supabase.ts` to use env vars
2. **Set Vercel Env Vars:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. **Configure OAuth:** Add Vercel domain to Supabase Auth settings
4. **Set Supabase Secrets:** Add PayPal, Twilio, SendGrid credentials
5. **Deploy Edge Functions:** Run `supabase functions deploy` for all functions
6. **Test Production:** Visit Vercel URL and test auth + payments
7. **Monitor:** Watch Vercel + Supabase dashboards for errors

---

## 💰 PRODUCTION COSTS

**Monthly Infrastructure:**
- Vercel Pro: $20/month (recommended for production)
- Supabase Pro: $25/month (recommended for production)
- **Total: $45/month**

**Free Tiers (for testing):**
- Vercel Hobby: Free (limited to personal projects)
- Supabase Free: Free (500MB database, 2GB bandwidth)

---

## 📞 SUPPORT RESOURCES

- **Vercel Docs:** https://vercel.com/docs/frameworks/vite
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Vite Env Vars:** https://vitejs.dev/guide/env-and-mode.html

---

**Ready to deploy?** Start with Fix 1 and set Vercel env vars!

**Version:** 1.0  
**Last Updated:** April 23, 2026  
**Status:** Production Deployment Guide
