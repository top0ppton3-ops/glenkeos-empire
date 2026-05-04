# ✅ Vercel Deployment Checklist - GlenKeos

**Date:** April 23, 2026  
**Stack:** React + Vite + Supabase  
**Deployment:** GitHub → Vercel (automatic)

---

## 🎯 PRE-DEPLOYMENT CHECKLIST

### Step 1: Code Updates ✅

- [x] **Updated `/src/app/services/supabase.ts`** to use `import.meta.env.VITE_*`
- [x] **Verified `/utils/supabase/info.ts`** already uses environment variables
- [x] **Auth Context** correctly uses `supabase.auth.getSession()`
- [x] **API Client** correctly sends JWT to Edge Functions

### Step 2: Vercel Environment Variables 🚧

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add these variables (select ALL environments):**

| Variable | Value | Status |
|----------|-------|--------|
| `VITE_SUPABASE_URL` | `https://beswluhdxaphtitaovly.supabase.co` | [ ] Set |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic` | [ ] Set |
| `VITE_PAYPAL_CLIENT_ID` | `<your_paypal_client_id>` | [ ] Set |
| `VITE_PAYPAL_ENVIRONMENT` | `sandbox` | [ ] Set |

**After setting variables:**
- [ ] Click "Save"
- [ ] Trigger redeploy (Deployments → ... → Redeploy)

### Step 3: Supabase OAuth Configuration 🚧

**Go to:** https://supabase.com/dashboard/project/beswluhdxaphtitaovly → Authentication → URL Configuration

**Add Redirect URLs:**
```
http://localhost:5173/**
http://localhost:3000/**
https://*-<your-vercel-team>.vercel.app/**
https://codebuild-default-webhook-source-lo.vercel.app/**
```

**Set Site URL:**
```
https://codebuild-default-webhook-source-lo.vercel.app
```

- [ ] Redirect URLs added
- [ ] Site URL set
- [ ] Click "Save"

### Step 4: Supabase Edge Function Secrets 🚧

**Set via CLI:**
```bash
supabase login
supabase link --project-ref beswluhdxaphtitaovly

# PayPal
supabase secrets set PAYPAL_CLIENT_ID=<your_id>
supabase secrets set PAYPAL_CLIENT_SECRET=<your_secret>
supabase secrets set PAYPAL_MODE=sandbox

# Twilio (SMS)
supabase secrets set TWILIO_ACCOUNT_SID=<your_sid>
supabase secrets set TWILIO_AUTH_TOKEN=<your_token>
supabase secrets set TWILIO_PHONE_NUMBER=<your_number>

# SendGrid (Email)
supabase secrets set SENDGRID_API_KEY=<your_key>
supabase secrets set SENDGRID_FROM_EMAIL=noreply@glenkeos.com
```

**Verify:**
```bash
supabase secrets list
```

- [ ] PayPal secrets set
- [ ] Twilio secrets set
- [ ] SendGrid secrets set
- [ ] Secrets verified with `list` command

### Step 5: Deploy Supabase Edge Functions 🚧

```bash
# Deploy all functions
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
```

**Or deploy all at once:**
```bash
for func in supabase/functions/*/; do
  supabase functions deploy $(basename $func)
done
```

- [ ] All 12 Edge Functions deployed
- [ ] Verified in Supabase Dashboard → Edge Functions

### Step 6: Test Local Build 🚧

```bash
# Test build locally before deploying
pnpm install
pnpm run build
pnpm run preview

# Open http://localhost:4173 and test
```

- [ ] Build succeeds without errors
- [ ] Preview works locally
- [ ] Auth flow works
- [ ] No console errors

---

## 🚀 DEPLOYMENT STEPS

### Automatic Deployment (Recommended)

```bash
# Commit code changes
git add .
git commit -m "Configure Supabase to use Vercel env vars"
git push origin main
```

**Vercel will:**
1. Detect GitHub push
2. Install dependencies
3. Run build
4. Deploy to production
5. Complete in 2-3 minutes

- [ ] Code pushed to GitHub
- [ ] Vercel deployment triggered
- [ ] Deployment succeeded (check Vercel dashboard)

### Manual Deployment (If needed)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Check Production URL

**Visit:** https://codebuild-default-webhook-source-lo.vercel.app

- [ ] Site loads without errors
- [ ] No blank page
- [ ] All brands accessible (Chic-on-Chain, Ghetto Eats, GoldKey)

### 2. Check Browser Console

**Open DevTools → Console**

Should see:
```
✅ Supabase configured from environment: beswluhdxaphtitaovly
```

Should NOT see:
```
❌ Missing Supabase environment variables
```

- [ ] Environment variables loaded correctly
- [ ] No console errors
- [ ] Supabase client initialized

### 3. Test Authentication

1. Go to `/internal/login` or customer login
2. Try logging in with test credentials
3. Check browser console for:
   ```
   🔐 JWT token present? true
   ```

- [ ] Login works
- [ ] JWT token generated
- [ ] Session persisted (refresh page, still logged in)

### 4. Test Edge Function Call

1. Go to checkout page
2. Try PayPal payment
3. Open Network tab (DevTools)
4. Look for request to `https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-paypal-order`
5. Check request headers for: `Authorization: Bearer eyJ...`

- [ ] Edge Function called successfully
- [ ] JWT sent in Authorization header
- [ ] Response received (check Network tab)

### 5. Check Supabase Dashboard

**Go to:** https://supabase.com/dashboard/project/beswluhdxaphtitaovly

**Check Edge Functions:**
- Functions → Logs
- Look for recent invocations
- Check for errors

**Check Auth:**
- Authentication → Users
- Verify test user appears after login

- [ ] Edge Functions receiving requests
- [ ] No errors in function logs
- [ ] Auth users appearing in dashboard

### 6. Test Real-Time Features

1. Open operations dashboard
2. Create a test order
3. Verify order appears in real-time

- [ ] Real-time updates working
- [ ] WebSocket connection established

---

## 🐛 TROUBLESHOOTING

### Issue: Site shows blank page

**Possible causes:**
1. Build error (check Vercel deployment logs)
2. Missing environment variables
3. Supabase client initialization error

**Debug steps:**
```bash
# Check Vercel logs
vercel logs <deployment-url>

# Check browser console
# Look for error messages
```

- [ ] Check Vercel build logs
- [ ] Check browser console
- [ ] Verify env vars are set

### Issue: "Missing Supabase environment variables"

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Ensure they're enabled for all environments
4. Redeploy

- [ ] Env vars verified in Vercel
- [ ] Redeployment triggered

### Issue: Auth fails / Login doesn't work

**Solution:**
1. Check Supabase → Authentication → URL Configuration
2. Verify Vercel domain is in allowed redirect URLs
3. Add wildcard: `https://*-team.vercel.app/**`

- [ ] Redirect URLs configured
- [ ] Wildcard pattern added

### Issue: Edge Function returns 401

**Solution:**
1. Check user is logged in before calling function
2. Verify JWT is being sent (check Network tab)
3. Check Edge Function logs in Supabase Dashboard

- [ ] User logged in
- [ ] JWT sent in request
- [ ] Edge Function logs checked

---

## 📋 FINAL CHECKLIST

### Before Marking as Complete

- [ ] All Vercel environment variables set
- [ ] Supabase OAuth redirect URLs configured
- [ ] Supabase Edge Function secrets set
- [ ] All 12 Edge Functions deployed
- [ ] Local build tested successfully
- [ ] Code pushed to GitHub
- [ ] Vercel deployment succeeded
- [ ] Production site loads correctly
- [ ] Browser console shows no errors
- [ ] Authentication works
- [ ] Edge Functions work
- [ ] JWT tokens being sent
- [ ] Real-time updates working
- [ ] No errors in Supabase logs

### Optional (Recommended for Production)

- [ ] Custom domain configured in Vercel
- [ ] SSL certificate verified (automatic with Vercel)
- [ ] PayPal switched to production mode
- [ ] Twilio production credentials set
- [ ] SendGrid production API key set
- [ ] Database seeded with menu items
- [ ] Database seeded with stores
- [ ] End-to-end order flow tested
- [ ] Payment processing tested
- [ ] SMS notifications tested
- [ ] Email notifications tested

---

## 🎯 SUCCESS CRITERIA

**Platform is production-ready when:**

✅ Code deployed to Vercel  
✅ Environment variables configured  
✅ Authentication working  
✅ Edge Functions responding  
✅ Real-time updates active  
✅ No console errors  
✅ All brands accessible  
✅ Operations dashboard functional  

---

## 📞 NEED HELP?

**Deployment Issues:**
- See: [VERCEL_PRODUCTION_DEPLOYMENT.md](./VERCEL_PRODUCTION_DEPLOYMENT.md)

**Architecture Questions:**
- See: [CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)

**Quick Commands:**
- See: [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)

---

**Checklist Version:** 1.0  
**Last Updated:** April 23, 2026  
**Status:** Ready to Execute

---

# LET'S DEPLOY! 🚀

Start with **Step 2: Vercel Environment Variables** and work through each step.
