# Vercel Deployment Configuration - GlenKeos Platform

**Date:** April 23, 2026  
**Stack:** React + Vite on Vercel  
**Backend:** 100% Supabase (ZERO AWS)

---

## 🎯 EXACT VERCEL CONFIGURATION

### Build Settings

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install"
}
```

**File Location:** `/vercel.json`

### Environment Variables (Vercel Dashboard)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables for all environments (Production, Preview, Development):

```env
# Supabase Connection (PUBLIC - Safe to expose in frontend)
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic
```

**⚠️ IMPORTANT:** These are PUBLIC keys and safe to include in client-side code. Security is enforced by Supabase Row Level Security (RLS).

---

## 🏗️ STACK DETAILS

### 1. Vercel Stack
**Type:** React (Vite)  
**NOT Next.js, NOT Remix, NOT SvelteKit**

Your platform is a **Single Page Application (SPA)** built with:
- React 18.3.1
- Vite 6.3.5 (build tool)
- React Router 7.13.0 (client-side routing)

### 2. Backend Calls
**Where you call Supabase from:** Frontend only (browser)

**You DO NOT have:**
- ❌ Vercel Serverless Functions (`/api/*` routes)
- ❌ Vercel Edge Functions
- ❌ Next.js API routes
- ❌ Server-side rendering (SSR)

**You DO have:**
- ✅ Client-side Supabase calls from React components
- ✅ Supabase Edge Functions (deployed to Supabase, not Vercel)
- ✅ Direct database queries via Supabase client

### 3. Authentication Flow
**Method:** Supabase Auth sessions end-to-end (NO manual JWT passing)

```typescript
// Frontend Authentication Flow
import { supabase } from './services/supabase';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Access token is automatically included in all Supabase requests
const token = session?.access_token;

// Supabase client automatically sends token with every request
const { data: orders } = await supabase
  .from('orders')
  .select('*');
// ↑ This request includes: Authorization: Bearer <access_token>
```

**RLS Enforcement:**
```sql
-- Example RLS Policy
CREATE POLICY "Users see only their tenant's data"
ON orders
FOR SELECT
USING (
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR
  (auth.jwt() ->> 'role') = 'admin'
);
```

### 4. Build Command & Initialization

**Build Command (from `package.json`):**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Frontend Supabase Client Initialization:**
```typescript
// File: /src/app/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://beswluhdxaphtitaovly.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Backend:** N/A - You don't initialize Supabase on Vercel. All backend logic is in Supabase Edge Functions.

---

## 📂 DEPLOYMENT STRUCTURE

```
┌─────────────────────────────────────────┐
│         VERCEL (Frontend Only)          │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Static Files (dist/)             │ │
│  │  • index.html                     │ │
│  │  • assets/*.js (React bundles)    │ │
│  │  • assets/*.css                   │ │
│  │  • assets/*.png, *.svg            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Environment Variables:                 │
│  • VITE_SUPABASE_URL                   │
│  • VITE_SUPABASE_ANON_KEY              │
└─────────────────────────────────────────┘
                  │
                  │ HTTP Requests
                  ↓
┌─────────────────────────────────────────┐
│      SUPABASE (Backend Services)        │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  PostgreSQL Database + RLS        │ │
│  │  • stores, menu_items, orders     │ │
│  │  • customers, drivers, inventory  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Auth (JWT)                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Edge Functions (Deno)            │ │
│  │  • create-paypal-order            │ │
│  │  • send-email, send-sms           │ │
│  │  • server (main API handler)      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Realtime (WebSocket)             │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🔐 SECURITY MODEL

### Row Level Security (RLS) Configuration

**All security is enforced at the database level:**

```sql
-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables

-- Example Policy: Customers see only their own orders
CREATE POLICY "customers_own_orders"
ON orders
FOR SELECT
USING (
  auth.uid() = customer_id
);

-- Example Policy: Staff see their tenant's orders
CREATE POLICY "staff_tenant_orders"
ON orders
FOR SELECT
USING (
  tenant_id = (auth.jwt() ->> 'tenant_id')
  AND (auth.jwt() ->> 'role') IN ('staff', 'admin')
);

-- Example Policy: Admins see everything
CREATE POLICY "admin_all_orders"
ON orders
FOR ALL
USING (
  (auth.jwt() ->> 'role') = 'admin'
);
```

### Frontend Request Flow

```
1. User logs in via Supabase Auth
   ↓
2. Supabase returns session with JWT access_token
   ↓
3. React stores session in memory
   ↓
4. All database queries include token automatically:
   
   const { data } = await supabase
     .from('orders')
     .select('*');
   
   // Supabase client sends:
   // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ↓
5. Supabase validates JWT
   ↓
6. RLS policies check JWT claims (role, tenant_id, uid)
   ↓
7. Database returns only authorized rows
```

**NO manual JWT handling required!** Supabase client does it all.

---

## 🚀 DEPLOYMENT WORKFLOW

### Step 1: Code Changes
```bash
# Make changes to your React code
vim src/app/pages/MyPage.tsx

# Commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin main
```

### Step 2: Automatic Vercel Deployment
```
GitHub webhook triggers Vercel
  ↓
Vercel clones repository
  ↓
Vercel runs: pnpm install
  ↓
Vercel runs: pnpm run build
  ↓
Vercel uploads dist/ to CDN
  ↓
Deployment complete! 🎉
```

**No manual steps needed!** Vercel auto-deploys on every push to `main`.

### Step 3: Supabase Edge Functions (Manual)
```bash
# Only needed when Edge Functions change
cd supabase/functions/<function-name>

# Deploy specific function
supabase functions deploy <function-name>

# Or deploy all at once
for func in supabase/functions/*/; do
  supabase functions deploy $(basename $func)
done
```

### Step 4: Database Migrations (When Schema Changes)
```bash
# Option 1: Supabase CLI
supabase db push

# Option 2: Supabase Dashboard
# 1. Go to SQL Editor
# 2. Paste migration SQL
# 3. Click Run
```

---

## 🔍 MONITORING & DEBUGGING

### Vercel Dashboard
**URL:** https://vercel.com/dashboard

**Check:**
- **Deployments** → Build logs, deploy history
- **Analytics** → Page views, performance
- **Logs** → Runtime logs (if any serverless functions exist - you don't have any)
- **Settings → Environment Variables** → Verify VITE_SUPABASE_* vars

### Supabase Dashboard
**URL:** https://supabase.com/dashboard/project/beswluhdxaphtitaovly

**Check:**
- **Database** → Table data, run SQL queries
- **Auth** → User list, authentication logs
- **Edge Functions** → Function logs, invocations
- **API Docs** → Auto-generated API documentation
- **Logs** → Database queries, errors

### Browser DevTools
**Console Logs:**
```typescript
// Frontend debugging
console.log('🔐 JWT token present?', Boolean(session?.access_token));
console.log('📊 Fetching orders for tenant:', tenantId);
console.log('✅ Orders fetched:', data);
```

**Network Tab:**
- Check requests to `beswluhdxaphtitaovly.supabase.co`
- Verify `Authorization: Bearer <token>` header
- Check response status codes (200, 401, 403)

---

## ⚡ PERFORMANCE OPTIMIZATIONS

### Vercel CDN
- Static files cached globally
- HTTPS/SSL automatic
- HTTP/2 and HTTP/3 support
- Brotli compression

### Supabase Connection Pooling
- Automatic connection pooling
- Optimized PostgreSQL queries
- Built-in caching layer

### React Optimizations
```typescript
// Use React Query for caching
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['orders'],
  queryFn: () => supabaseAPI.orders.list(),
  staleTime: 30000, // Cache for 30s
});
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "Failed to fetch" or CORS errors
**Cause:** Supabase URL/key incorrect  
**Solution:** Verify environment variables in Vercel dashboard

### Issue: Empty data returned from queries
**Cause:** RLS policies blocking access  
**Solution:** Check RLS policies, verify user is logged in

### Issue: 401 Unauthorized
**Cause:** JWT token expired or invalid  
**Solution:** Refresh session with `supabase.auth.refreshSession()`

### Issue: Build fails on Vercel
**Cause:** Missing dependencies or TypeScript errors  
**Solution:** Check build logs in Vercel dashboard, fix errors locally

### Issue: Environment variables not working
**Cause:** Variables not prefixed with `VITE_`  
**Solution:** All Vite env vars must start with `VITE_` to be exposed to frontend

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [x] Frontend code committed to GitHub
- [x] Vercel project connected to GitHub repo
- [x] Environment variables set in Vercel dashboard
  - [x] `VITE_SUPABASE_URL`
  - [x] `VITE_SUPABASE_ANON_KEY`
- [x] Supabase project created
- [x] Database schema deployed
- [x] RLS policies enabled on all tables
- [x] Supabase Edge Functions deployed
- [x] Supabase Secrets configured (PayPal, Twilio, SendGrid)
- [x] Domain configured (optional)
- [ ] Database seeded with menu items
- [ ] Database seeded with stores
- [ ] End-to-end testing complete

---

## 🎉 READY FOR PRODUCTION

Your platform is configured for:
- ✅ Automatic deployments (GitHub → Vercel)
- ✅ Secure authentication (Supabase Auth + RLS)
- ✅ Scalable database (Supabase PostgreSQL)
- ✅ Serverless compute (Supabase Edge Functions)
- ✅ Real-time updates (Supabase Realtime)
- ✅ Global CDN (Vercel)
- ✅ HTTPS/SSL (automatic)
- ✅ Zero AWS complexity

**Next Step:** Seed your database and go live! 🚀

---

**Configuration Version:** 2.0  
**Last Updated:** April 23, 2026  
**Status:** Production Ready
