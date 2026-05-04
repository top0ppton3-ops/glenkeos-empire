# 🚀 GLENKEOS VERCEL + SUPABASE DEPLOYMENT GUIDE

## 📊 CURRENT STACK ANALYSIS

### ✅ **Your Vercel Stack:**
- **Framework:** React 18.3.1 + Vite 6.3.5 (SPA mode)
- **Build:** `pnpm run build` → outputs to `/dist`
- **No backend API routes** - Pure client-side app
- **No SSR/SSG** - All rendering happens in browser

### ✅ **Your Supabase Integration:**
- **Frontend:** Direct Supabase calls from browser using `@supabase/supabase-js`
- **Auth:** Currently NO auth implemented (anonymous access)
- **RLS:** Multi-tenant policies defined but NOT ENFORCED (no JWT)
- **Client Location:** `/src/app/services/supabase.ts` (hardcoded credentials)

### ⚠️ **Critical Security Gap:**
**You have NO backend routes**, so ALL Supabase calls happen from the browser with the anon key. Your RLS policies expect JWT claims that don't exist yet.

---

## 🔐 CURRENT AUTH FLOW (BROKEN)

```
Browser → Supabase Client (anon key) → Database
                                             ↓
                                    RLS expects JWT with:
                                    - auth.uid()
                                    - tenant_id
                                    - tenant_access
                                             ↓
                                    ❌ FAILS - No user logged in
```

---

## ✅ ANSWERS TO YOUR QUESTIONS

### 1️⃣ **What's your Vercel stack?**
**React 18 SPA with Vite** - No API routes, no backend

### 2️⃣ **Where do you call Supabase from backend?**
**NOWHERE** - You have no backend routes. All calls are client-side from:
- `/src/app/services/supabase.ts` (client initialization)
- `/src/app/services/api/supabaseAPI.ts` (CRUD operations)

### 3️⃣ **Do you use Supabase Auth sessions end-to-end?**
**NO** - You have auth UI components but NO actual Supabase Auth implementation

### 4️⃣ **Build command:**
```json
{
  "buildCommand": "pnpm run build",
  "scripts": {
    "build": "vite build"
  }
}
```

### 5️⃣ **Supabase Client Initialization:**

**Frontend Client:**
```typescript
// /src/app/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://beswluhdxaphtitaovly.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// ❌ HARDCODED - Should use env vars
// ❌ NO AUTH CONFIG - No session management
```

**Backend Client:**
**NONE EXISTS** - You have no backend

---

## 🎯 RECOMMENDED DEPLOYMENT STRATEGY

Since you have a **pure SPA with no backend**, you have 2 options:

### **Option A: Keep SPA + Add Supabase Auth (RECOMMENDED)**
Best for your current architecture

### **Option B: Add Vercel API Routes + Server-side RLS**
More secure but requires major refactoring

---

## 🚀 OPTION A: SPA + SUPABASE AUTH (RECOMMENDED)

### **Step 1: Fix Frontend Supabase Client**

Replace `/src/app/services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// Use environment variables (Vite syntax)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://beswluhdxaphtitaovly.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce' // More secure auth flow
  }
});
```

### **Step 2: Set Vercel Environment Variables**

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://beswluhdxaphtitaovly.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic` | Production, Preview, Development |

⚠️ **DO NOT add service role key to Vercel env vars** - It would be exposed in browser

### **Step 3: Deploy Supabase RLS Policies**

Go to: https://beswluhdxaphtitaovly.supabase.co → SQL Editor

Run this migration:

```sql
-- File: /supabase/migrations/20260422180000_hierarchical_tenant_rls.sql
-- Copy the ENTIRE file (694 lines) and paste into SQL Editor
```

This creates:
- ✅ Multi-tenant RLS policies
- ✅ JWT helper functions
- ✅ Customer ownership rules
- ✅ Corporate access controls

### **Step 4: Enable RLS on All Tables**

Run this SQL to enable RLS:

```sql
-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
```

### **Step 5: Configure Supabase Auth Providers**

Go to: https://beswluhdxaphtitaovly.supabase.co → Authentication → Providers

Enable:
- ✅ **Email (required)** - For staff/admin login
- ✅ **Google OAuth (optional)** - For customer quick signup
- ✅ **Phone (optional)** - For SMS auth

Configure redirect URLs:
```
https://codebuild-default-webhook-source.vercel.app/auth/callback
https://codebuild-default-webhook-source-lo.vercel.app/auth/callback
http://localhost:5173/auth/callback
```

### **Step 6: Create Auth Helper Functions**

Create `/src/app/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    signUp: (email: string, password: string, metadata?: any) =>
      supabase.auth.signUp({ email, password, options: { data: metadata } }),
    signIn: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };
}
```

### **Step 7: Implement Login Pages**

Your existing login pages need to actually call Supabase Auth:

```typescript
// /src/app/pages/corporate/CorporateLogin.tsx
import { useAuth } from '../../hooks/useAuth';

export default function CorporateLogin() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await signIn(email, password);
    if (error) {
      console.error('Login failed:', error);
      return;
    }
    // Redirect to dashboard
    window.location.href = '/corporate/operations';
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### **Step 8: Deploy to Vercel**

1. Changes auto-save in Figma Make
2. Auto-push to GitHub
3. Vercel auto-deploys
4. Visit: https://codebuild-default-webhook-source.vercel.app

---

## 🔐 OPTION B: ADD VERCEL API ROUTES (More Secure)

If you want server-side validation, you need to:

1. **Migrate to Next.js or Remix** (Vite doesn't support API routes)
2. Create `/api/orders`, `/api/menu`, etc.
3. Use service role key on server
4. Validate JWTs manually

**This requires major refactoring** - Not recommended for your current setup.

---

## ⚠️ CURRENT RLS ISSUE

Your RLS policies expect these JWT claims:

```sql
auth.jwt() -> 'app_metadata' ->> 'tenant_id'  -- e.g., 'chic-on-chain'
auth.jwt() -> 'app_metadata' ->> 'tenant_access'  -- e.g., 'glenkeos,chic-on-chain'
auth.uid()  -- User's Supabase UUID
```

But you're not setting these during signup!

### **Fix: Add Tenant Metadata on Signup**

```typescript
// When user signs up, set tenant_id
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      tenant_id: 'chic-on-chain',  // Brand they're signing up for
      tenant_access: 'chic-on-chain',  // Can be comma-separated for multi-access
    }
  }
});
```

### **Or use Database Trigger:**

Create this SQL function to auto-set tenant:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create customer record when user signs up
  INSERT INTO public.customers (cognito_sub, email, first_name, last_name, tenant_id)
  VALUES (
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_app_meta_data->>'tenant_id', 'public')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 📋 DEPLOYMENT CHECKLIST

### **Database Setup**
- [ ] Run `/supabase/migrations/20260422180000_hierarchical_tenant_rls.sql`
- [ ] Enable RLS on all tables
- [ ] Create trigger for auto-creating customer records
- [ ] Seed initial data (stores, menu_items, staff)

### **Supabase Configuration**
- [ ] Enable Email provider in Auth settings
- [ ] Add redirect URLs for Vercel domains
- [ ] Configure SMTP for email (optional)
- [ ] Set up Storage buckets for images (if needed)

### **Vercel Configuration**
- [ ] Add `VITE_SUPABASE_URL` env var
- [ ] Add `VITE_SUPABASE_ANON_KEY` env var
- [ ] Verify build command: `pnpm run build`
- [ ] Verify output directory: `dist`

### **Code Changes**
- [ ] Update `/src/app/services/supabase.ts` to use env vars
- [ ] Create `/src/app/hooks/useAuth.ts`
- [ ] Implement actual auth in login pages
- [ ] Add protected route wrapper
- [ ] Test signup flow with tenant metadata

### **Edge Functions (Optional)**
- [ ] Deploy PayPal functions to Supabase Edge
- [ ] Deploy notification functions
- [ ] Set Edge Function secrets (PayPal API keys)

---

## 🧪 TESTING CHECKLIST

After deployment:

1. **Public Access (No Auth)**
   - [ ] Visit `/chic-on-chain/menu` - Should show menu items
   - [ ] Visit `/ghetto-eats/menu` - Should show menu items
   - [ ] Cart functionality works

2. **Auth Flow**
   - [ ] Sign up new customer
   - [ ] Verify email redirect
   - [ ] Sign in existing user
   - [ ] JWT has correct tenant_id

3. **RLS Enforcement**
   - [ ] Customer can see own orders
   - [ ] Customer CANNOT see other orders
   - [ ] Corporate admin can see all data

4. **Operations Dashboard**
   - [ ] Staff login works
   - [ ] Can view orders for their brand
   - [ ] Cannot view other brands (unless corporate)

---

## 🚨 COMMON ISSUES & FIXES

### **Issue: "RLS policy violated"**
**Cause:** User not authenticated or missing tenant_id in JWT
**Fix:** Ensure `auth.signUp()` includes tenant metadata

### **Issue: "Menu items not loading"**
**Cause:** RLS blocking anonymous access
**Fix:** Add public SELECT policy for menu_items:

```sql
CREATE POLICY menu_items_public_read ON public.menu_items
  FOR SELECT
  TO anon
  USING (is_active = true);
```

### **Issue: "Cannot create order"**
**Cause:** No customer_id in JWT
**Fix:** Use `auth.customer_id()` function and ensure customer record exists

### **Issue: "Vercel build fails"**
**Cause:** Environment variables not set
**Fix:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel settings

---

## 📞 NEXT STEPS

1. **Deploy this to Vercel first** (code is ready)
2. **Then run SQL migrations** in Supabase
3. **Set up Auth providers** in Supabase dashboard
4. **Test auth flow** locally
5. **Deploy auth changes** to Vercel

Do you want me to implement Option A (Supabase Auth) now?
