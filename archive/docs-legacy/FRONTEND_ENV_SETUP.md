# 🌐 FRONTEND ENVIRONMENT CONFIGURATION

After deploying your Supabase backend, connect the frontend by setting environment variables.

---

## 🔧 REQUIRED ENVIRONMENT VARIABLES

### Get Your Supabase Credentials

1. **Go to Supabase Dashboard**
   ```
   https://app.supabase.com/project/YOUR_PROJECT_REF/settings/api
   ```

2. **Copy these values:**
   - **Project URL**: `https://YOUR_PROJECT_REF.supabase.co`
   - **Anon/Public Key**: Long string starting with `eyJhbGc...`

---

## ⚡ VERCEL DEPLOYMENT

### Option 1: Via Vercel Dashboard

1. Go to your project: https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
Name: VITE_SUPABASE_URL
Value: https://YOUR_PROJECT_REF.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGc... (paste your anon key)
```

5. Click **Save**
6. Go to **Deployments** and click **Redeploy**

### Option 2: Via Vercel CLI

```bash
vercel env add VITE_SUPABASE_URL
# Paste: https://YOUR_PROJECT_REF.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste: your anon key

# Redeploy
vercel --prod
```

---

## 🧪 LOCAL DEVELOPMENT

### Create `.env` file

```bash
# Copy the example
cp .env.example .env

# Edit .env and add your values
nano .env
```

### `.env` contents:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_PAYPAL_CLIENT_ID=Aak4lnZ2VoSGGGtyby06OBU4dZ0mtprftwZs43fLICH7G22G0se3c2Q5eDmZStMIwmjRkfDkHK_Kk_6F
VITE_PAYPAL_ENVIRONMENT=sandbox
```

### Run locally:

```bash
npm run dev
```

---

## ✅ VERIFY CONFIGURATION

### Check Browser Console

Open your app and check the console:

**Success:**
```
✅ Supabase configured: YOUR_PROJECT_REF
```

**Not Configured:**
```
⚠️ Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### Test API Connection

```javascript
// Open browser console on your app
fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/')
  .then(r => r.json())
  .then(console.log)
```

Expected: API response (not 404)

---

## 🔐 SECURITY NOTES

### ✅ Safe to Expose (Frontend)
- `VITE_SUPABASE_URL` - Public URL
- `VITE_SUPABASE_ANON_KEY` - Public anon key (has RLS protection)
- `VITE_PAYPAL_CLIENT_ID` - Public PayPal client ID

### ❌ NEVER Expose (Backend Only)
- `PAYPAL_CLIENT_SECRET` - Kept in Supabase secrets ✅
- `TWILIO_AUTH_TOKEN` - Kept in Supabase secrets ✅
- `SENDGRID_API_KEY` - Kept in Supabase secrets ✅
- Database password - Only in Supabase ✅

**All sensitive secrets are secured in Supabase Edge Functions!**

---

## 🚨 TROUBLESHOOTING

### "Supabase not configured" warning

**Solution:**
1. Verify environment variables are set in Vercel
2. Redeploy your Vercel app
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R)

### "Failed to fetch" errors

**Solution:**
1. Check Supabase URL is correct
2. Verify backend functions are deployed
3. Check CORS settings in Supabase
4. Test backend directly:
   ```bash
   curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-paypal-order
   ```

### Environment variables not updating

**Solution:**
1. Delete old deployment
2. Clear Vercel build cache
3. Redeploy:
   ```bash
   vercel --prod --force
   ```

---

## 📋 DEPLOYMENT CHECKLIST

**Backend Deployment:**
- [ ] Supabase project created
- [ ] Backend deployed (`./deploy-backend-now.sh`)
- [ ] Functions verified (`supabase functions list`)
- [ ] PayPal tested successfully

**Frontend Configuration:**
- [ ] Got Supabase URL from dashboard
- [ ] Got anon key from dashboard
- [ ] Added to Vercel environment variables
- [ ] Redeployed Vercel app
- [ ] Verified console shows "Supabase configured"

**End-to-End Test:**
- [ ] Can create orders
- [ ] PayPal integration works
- [ ] GPS tracking updates
- [ ] Loyalty points calculate

---

## 🎯 QUICK REFERENCE

**Get Credentials:**
```
https://app.supabase.com/project/YOUR_PROJECT_REF/settings/api
```

**Add to Vercel:**
```
https://vercel.com/YOUR_USERNAME/YOUR_PROJECT/settings/environment-variables
```

**Redeploy:**
```bash
vercel --prod
```

---

## 📚 MORE INFO

- **Backend Deployment:** `DEPLOY_INSTRUCTIONS_FINAL.md`
- **Backend Status:** `BACKEND_READY_STATUS.md`
- **Complete Guide:** `BACKEND_INFRASTRUCTURE_COMPLETE.md`

---

**Status:** ✅ Frontend ready, just needs backend credentials

**Next:** Deploy backend → Get credentials → Set in Vercel → Redeploy
