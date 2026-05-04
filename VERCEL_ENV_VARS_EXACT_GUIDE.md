# 🎯 VERCEL ENVIRONMENT VARIABLES - EXACT GUIDE

**Status**: You just added variables successfully ✅  
**Next**: Need to add the correct VITE_* variables for browser

---

## 📋 WHICH SUPABASE KEY GOES WHERE

### From Supabase Dashboard

You see 4 different keys in Supabase. Here's which ones to use:

| Supabase Key Name | Use Where | Vercel Variable Name |
|------------------|-----------|---------------------|
| **anonymous (anon) API key** | ✅ Browser (public) | `VITE_SUPABASE_ANON_KEY` |
| **service_role API key** | ⚠️ Server only (secret) | `SUPABASE_SERVICE_ROLE_KEY` |
| ~~publishable key~~ | ❌ Don't use | - |
| ~~secret key (default)~~ | ❌ Don't use | - |

### For Vite Browser Code

Add these 3 to Vercel **Production**, **Preview**, **Development**:

#### 1. VITE_SUPABASE_URL
**Value**:
```
https://beswluhdxaphtitaovly.supabase.co
```
**From**: Your Supabase project URL (shown at top of Supabase dashboard)

---

#### 2. VITE_SUPABASE_ANON_KEY
**Value**: Copy the **"anonymous (anon) API key"** from Supabase dashboard

It looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic
```

**Which key**: Click **"anonymous (anon) API key"** → Copy button

---

#### 3. VITE_PAYPAL_CLIENT_ID
**Value**:
```
EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC
```
**From**: Your PayPal sandbox client ID

---

### For Server-Side (Optional - Edge Functions)

If you need server-side access (Edge Functions):

#### SUPABASE_SERVICE_ROLE_KEY (Already added ✅)
**Value**: Copy the **"service_role API key"** from Supabase

⚠️ **NEVER** expose this in browser code - server-side only!

---

## 🎯 STEP-BY-STEP IN VERCEL

### Current Status
You already have these (can keep for server-side):
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE...OLE_KEY` (service role key)
- ✅ `SUPABASE..._SECRET`
- ✅ `SUPABASE_PUBLISHABLE_KEY`
- ✅ `SUPABASE...RET_KEY`

### What to Add Now

Go to: https://vercel.com/dashboard → **codebuild-default-webhook-source-lo** → Settings → Environment Variables

Click **"Add New"** for each:

#### Variable 1: VITE_SUPABASE_URL
1. Name: `VITE_SUPABASE_URL`
2. Value: `https://beswluhdxaphtitaovly.supabase.co`
3. Environments: Check **Production**, **Preview**, **Development**
4. Click **Save**

#### Variable 2: VITE_SUPABASE_ANON_KEY
1. Name: `VITE_SUPABASE_ANON_KEY`
2. Value: Copy from Supabase → Click **"anonymous (anon) API key"** → **Copy**
3. Paste the copied value
4. Environments: Check **Production**, **Preview**, **Development**
5. Click **Save**

#### Variable 3: VITE_PAYPAL_CLIENT_ID
1. Name: `VITE_PAYPAL_CLIENT_ID`
2. Value: `EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC`
3. Environments: Check **Production**, **Preview**, **Development**
4. Click **Save**

---

## 🚀 AFTER ADDING ALL 3 VARIABLES

### Trigger Redeploy
1. Go to **Deployments** tab
2. Find latest deployment
3. Click **...** menu
4. Click **Redeploy**
5. Confirm redeploy

### Vercel Will Show
```
✅ Added Environment Variable successfully. 
   A new deployment is needed for changes to take effect.
```

Then automatically redeploys! 🎉

---

## ✅ VERIFICATION

After redeploy completes:

### Check Build Logs
- ✅ Build should succeed
- ✅ No environment variable warnings
- ✅ Should say "Ready" in ~2 minutes

### Check Production Site
1. Visit: https://codebuild-default-webhook-source-lo.vercel.app
2. Open browser console (F12)
3. Look for:
   - ✅ No Supabase connection errors
   - ✅ No "VITE_SUPABASE_URL is undefined" warnings
   - ✅ PayPal button loads if you go to checkout

---

## 📊 FINAL ENVIRONMENT VARIABLES

After adding, you should have:

### Browser-Side (VITE_* prefix)
- ✅ `VITE_SUPABASE_URL` → For Vite to connect to Supabase
- ✅ `VITE_SUPABASE_ANON_KEY` → For browser authentication
- ✅ `VITE_PAYPAL_CLIENT_ID` → For PayPal SDK

### Server-Side (existing)
- ✅ `SUPABASE_URL` → For server calls
- ✅ `SUPABASE...OLE_KEY` → Service role key (secret)
- ✅ Other SUPABASE_* variables → Can keep

---

## 🎯 KEY POINTS

1. **VITE_* prefix** = Browser can read via `import.meta.env.VITE_*`
2. **No VITE_ prefix** = Server-side only (browser can't access)
3. **anon key** = Safe for browser (public access with RLS)
4. **service_role key** = NEVER in browser (bypasses RLS)

---

## ✅ DONE!

Once you add those 3 VITE_* variables and redeploy:
- ✅ Vite will read environment variables correctly
- ✅ Supabase will connect from browser
- ✅ PayPal SDK will load
- ✅ No runtime errors

**You're almost there!** Just add the 3 VITE_* vars and redeploy! 🚀
