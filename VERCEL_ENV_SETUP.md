# 🚀 VERCEL ENVIRONMENT VARIABLES SETUP

**CRITICAL**: These must be set in Vercel Dashboard for deployment to work.

---

## 📍 HOW TO SET VERCEL ENVIRONMENT VARIABLES

1. Go to: https://vercel.com/dashboard
2. Select your project: **codebuild-default-webhook-source-lo**
3. Click **Settings** → **Environment Variables**
4. Add each variable below

---

## 🔑 REQUIRED ENVIRONMENT VARIABLES

### Supabase Configuration (Public - Safe for Client)

**Variable Name**: `VITE_SUPABASE_URL`  
**Value**: 
```
https://beswluhdxaphtitaovly.supabase.co
```
**Environment**: Production, Preview, Development

---

**Variable Name**: `VITE_SUPABASE_ANON_KEY`  
**Value**: 
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic
```
**Environment**: Production, Preview, Development

---

### Supabase Service Role (Server-Side Only - DO NOT expose to client)

**Variable Name**: `SUPABASE_SERVICE_ROLE_KEY`  
**Value**: 
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY1NTM3MiwiZXhwIjoyMDUwMjMxMzcyfQ.BAAkPJbK4bCC9TZRop5lSAgwwdwR97nkTWrSYBs2FpX59LRla5FgyL4UXnKK5usDHZygROl0dmBH7KKgrE
```
**Environment**: Production
**⚠️ WARNING**: This is a SECRET - only use in server-side code or Edge Functions

---

### PayPal Configuration

**Variable Name**: `PAYPAL_CLIENT_ID`  
**Value**: 
```
EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC
```
**Environment**: Production, Preview

---

**Variable Name**: `PAYPAL_CLIENT_SECRET`  
**Value**: 
```
YOUR_PAYPAL_SECRET_HERE
```
**Environment**: Production
**Note**: Get this from PayPal Developer Dashboard

---

## ✅ VERIFICATION CHECKLIST

After adding all environment variables in Vercel:

- [ ] VITE_SUPABASE_URL is set
- [ ] VITE_SUPABASE_ANON_KEY is set
- [ ] SUPABASE_SERVICE_ROLE_KEY is set (Production only)
- [ ] PAYPAL_CLIENT_ID is set
- [ ] All values are correctly copied (no extra spaces)
- [ ] Click **Save** after each variable
- [ ] Trigger a new deployment: Settings → Deployments → Redeploy

---

## 🔄 REDEPLOY AFTER SETTING VARIABLES

```bash
# Option 1: Push to GitHub (auto-deploy)
git push origin master

# Option 2: Redeploy in Vercel Dashboard
# Go to: Deployments → Latest Deployment → ⋯ Menu → Redeploy
```

---

## 🧪 TEST AFTER DEPLOYMENT

Visit your site and check:
1. Homepage loads without errors
2. Login works (tests Supabase connection)
3. Customer portal accessible
4. No console errors about missing env vars

---

## 🚨 TROUBLESHOOTING

### Build fails with "VITE_SUPABASE_URL is not defined"
**Fix**: Add the VITE_ prefixed variables in Vercel Dashboard

### 401 Unauthorized errors
**Fix**: Check VITE_SUPABASE_ANON_KEY is correct

### PayPal integration fails
**Fix**: Add PAYPAL_CLIENT_SECRET (get from PayPal Dashboard)

---

**Last Updated**: 2026-05-03  
**Vercel Project**: codebuild-default-webhook-source-lo  
**Supabase Project**: beswluhdxaphtitaovly
