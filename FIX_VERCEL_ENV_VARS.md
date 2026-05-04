# 🔧 FIX VERCEL ENVIRONMENT VARIABLES

**Problem**: Vercel has NEXT_PUBLIC_* variables (for Next.js)  
**Solution**: We're using Vite, need VITE_* variables  
**Status**: Code is correct, Vercel config is wrong

---

## ✅ CONFIRMED: Our Code Uses VITE_* (Correct)

### Supabase Init (`utils/supabase/info.ts`)
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### PayPal Init (`src/app/components/payments/PayPalButton.tsx`)
```typescript
const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'fallback-id';
```

**Code is correct!** ✅

---

## ❌ WRONG: Vercel Has NEXT_PUBLIC_* Variables

Current Vercel env vars (WRONG for Vite):
- ❌ `NEXT_PUBLIC_SUPABASE_URL`
- ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ❌ `NEXT_PUBLIC_...ISHABLE_KEY`
- ❌ `SUPABASE_PUBLISHABLE_KEY`
- ⚠️ `SUPABASE...RET_KEY` (sensitive - keep for server-side only)

---

## ✅ FIX VERCEL ENVIRONMENT VARIABLES

### Step 1: Delete Wrong Variables
Go to: https://vercel.com/dashboard → **codebuild-default-webhook-source-lo** → Settings → Environment Variables

**DELETE these** (they're for Next.js, not Vite):
- ❌ Delete: `NEXT_PUBLIC_SUPABASE_URL`
- ❌ Delete: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ❌ Delete: `NEXT_PUBLIC_...ISHABLE_KEY`
- ❌ Delete: `SUPABASE_PUBLISHABLE_KEY`

**KEEP this** (for Edge Functions server-side):
- ✅ Keep: `SUPABASE...RET_KEY` (sensitive)

---

### Step 2: Add Correct VITE_* Variables

Add these 3 environment variables to **Production**, **Preview**, and **Development**:

#### 1. VITE_SUPABASE_URL
```
https://beswluhdxaphtitaovly.supabase.co
```

#### 2. VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic
```

#### 3. VITE_PAYPAL_CLIENT_ID
```
EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC
```

---

### Step 3: Redeploy

After adding VITE_* variables:
1. Go to: Deployments tab
2. Click **...** menu on latest deployment
3. Click **Redeploy**
4. Select **Use existing build cache** (optional)
5. Click **Redeploy**

---

## 🎯 WHY THIS MATTERS

### Vite vs Next.js Environment Variables

| Framework | Browser Env Var Pattern | Example |
|-----------|------------------------|---------|
| **Next.js** | `NEXT_PUBLIC_*` | `process.env.NEXT_PUBLIC_SUPABASE_URL` |
| **Vite** | `VITE_*` | `import.meta.env.VITE_SUPABASE_URL` |

**We're using Vite**, so we need `VITE_*` prefixes!

### What Each Variable Does

1. **VITE_SUPABASE_URL** (browser-safe)
   - Supabase project URL
   - Used by browser to connect to Supabase

2. **VITE_SUPABASE_ANON_KEY** (browser-safe)
   - Anonymous/public key for browser-side auth
   - Row-level security protects your data
   - Safe to expose in browser

3. **VITE_PAYPAL_CLIENT_ID** (browser-safe)
   - PayPal sandbox client ID
   - Used to load PayPal SDK in browser
   - Safe to expose in browser

4. **SUPABASE...RET_KEY** (server-only, KEEP)
   - Service role key (super admin)
   - **NEVER** expose in browser code
   - Only use in Edge Functions server-side

---

## 📋 VERIFICATION CHECKLIST

After fixing Vercel env vars:

### In Vercel Dashboard
- [ ] Deleted all `NEXT_PUBLIC_*` variables
- [ ] Deleted `SUPABASE_PUBLISHABLE_KEY`
- [ ] Added `VITE_SUPABASE_URL` to Production/Preview/Development
- [ ] Added `VITE_SUPABASE_ANON_KEY` to Production/Preview/Development
- [ ] Added `VITE_PAYPAL_CLIENT_ID` to Production/Preview/Development
- [ ] Kept `SUPABASE...RET_KEY` (sensitive) for server-side
- [ ] Triggered redeploy

### After Redeploy
- [ ] Build succeeds
- [ ] No environment variable warnings in build logs
- [ ] Site loads at production URL
- [ ] Browser console shows no Supabase connection errors
- [ ] PayPal button loads correctly

---

## 🚀 QUICK FIX VIA CLI (ALTERNATIVE)

```bash
# Login to Vercel
vercel login

# Link to project
vercel link

# Remove wrong variables (if possible via CLI)
# Note: May need to use web UI to delete

# Add correct VITE_* variables
vercel env add VITE_SUPABASE_URL production
# Paste: https://beswluhdxaphtitaovly.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add VITE_PAYPAL_CLIENT_ID production
# Paste: EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9Q...

# Repeat for preview and development environments
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview  
vercel env add VITE_PAYPAL_CLIENT_ID preview

vercel env add VITE_SUPABASE_URL development
vercel env add VITE_SUPABASE_ANON_KEY development
vercel env add VITE_PAYPAL_CLIENT_ID development

# Deploy
vercel --prod
```

---

## ✅ FINAL RESULT

After fixing:
- ✅ Vite can read `import.meta.env.VITE_SUPABASE_URL`
- ✅ Vite can read `import.meta.env.VITE_SUPABASE_ANON_KEY`
- ✅ Vite can read `import.meta.env.VITE_PAYPAL_CLIENT_ID`
- ✅ Supabase connects successfully
- ✅ PayPal SDK loads successfully
- ✅ No runtime environment variable errors

**The code is already correct - just need to fix Vercel config!** 🚀
