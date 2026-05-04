# ✅ GlenKeos CORRECT Architecture (April 2026)

**CRITICAL: This document contains the OFFICIAL architecture. Ignore any AWS references in legacy files.**

---

## 🎯 THE TRUTH: 100% Vercel + Supabase

### What We Use
```
┌─────────────────────────────────────────┐
│           VERCEL (Frontend)             │
│  React 18.3.1 SPA + Vite 6.3.5         │
│  Deployed via GitHub auto-sync          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         SUPABASE (Backend)              │
│  • PostgreSQL 15+ with RLS              │
│  • Supabase Auth (JWT)                  │
│  • Edge Functions (Deno)                │
│  • Realtime (WebSocket)                 │
│  • PostgREST (Auto API)                 │
└─────────────────────────────────────────┘
```

### What We DON'T Use
```
❌ AWS Lambda
❌ AWS RDS
❌ AWS API Gateway
❌ AWS EventBridge
❌ AWS Cognito
❌ AWS S3
❌ AWS Anything
```

---

## 📋 EXACT ANSWERS TO YOUR QUESTIONS

### 1. Vercel Stack?
**Answer:** React + Vite (SPA)
- Pure React 18.3.1 Single Page Application
- Vite 6.3.5 build tool
- React Router 7.13.0 for client-side routing
- NOT Next.js, NOT Remix, NOT any SSR framework

### 2. Where do you call Supabase from?
**Answer:** Frontend only (browser)
- All Supabase calls are client-side
- No backend/server-side on Vercel
- Direct database queries via Supabase client

### 3. Vercel server routes (/api/*)?
**Answer:** NO - Zero Vercel API routes
- No `/api/*` endpoints
- No Vercel Serverless Functions
- No Vercel Edge Functions
- All backend logic is in Supabase Edge Functions

### 4. Auth Implementation?
**Answer:** Supabase Auth sessions end-to-end
- JWT tokens managed automatically
- No manual JWT passing
- Session stored in browser
- Tokens auto-included in all requests

### 5. Build Command & Initialization?

**Build Command:**
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Frontend Supabase Client:**
```typescript
// File: /src/app/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://beswluhdxaphtitaovly.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Backend Initialization:**
N/A - You don't initialize Supabase on Vercel.  
All backend code runs in Supabase Edge Functions.

---

## 🚫 AWS SERVICES: ZERO

| Service Type | AWS | Our Solution |
|--------------|-----|--------------|
| **Compute** | Lambda | Supabase Edge Functions |
| **Database** | RDS | Supabase PostgreSQL |
| **API** | API Gateway | Supabase PostgREST |
| **Events** | EventBridge | Supabase Realtime |
| **Auth** | Cognito | Supabase Auth |
| **Storage** | S3 | Supabase Storage |
| **Secrets** | Secrets Manager | Supabase Secrets + Vercel Env |

**AWS provides us ZERO services.**

---

## 📁 LEGACY FILES (IGNORE THESE)

These directories exist for historical reference only and are **NOT deployed**:

```
/services/*               ← Old AWS Lambda code (IGNORE)
/cloudformation/*         ← Old AWS CloudFormation (IGNORE)
/terraform/*              ← Old AWS Terraform (IGNORE)
/scripts/discover-*       ← AWS discovery scripts (IGNORE)
```

**What to do with them:**
- Leave them alone (they don't affect production)
- Or delete them if they're confusing

---

## ✅ PRODUCTION FILES (USE THESE)

### Frontend (Vercel)
```
/src/app/
  ├── services/
  │   ├── supabase.ts              ← Supabase client init
  │   └── api/supabaseAPI.ts       ← Complete API layer (500+ lines)
  ├── contexts/AuthContext.tsx     ← Auth management
  ├── routes.tsx                   ← React Router config
  ├── pages/                       ← All page components
  └── components/                  ← All UI components

/vercel.json                       ← Vercel config
/vite.config.ts                    ← Vite config
/package.json                      ← Dependencies
```

### Backend (Supabase)
```
/supabase/
  ├── functions/                   ← 12 Edge Functions
  │   ├── create-paypal-order/
  │   ├── capture-paypal-order/
  │   ├── send-email/
  │   ├── send-sms/
  │   └── ...
  └── migrations/                  ← Database migrations

/database/
  └── complete-schema.sql          ← Full DB schema
```

---

## 🔐 SECURITY MODEL

### Row Level Security (RLS)

All tables enforce security at the database level:

```sql
-- Example: Tenant isolation
CREATE POLICY "tenant_isolation"
ON orders FOR SELECT
USING (
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') = 'admin'
);
```

### Auth Flow

```
1. User signs in
   ↓
2. Supabase Auth returns JWT
   ↓
3. JWT stored in browser
   ↓
4. All DB queries auto-include JWT
   ↓
5. RLS validates JWT claims
   ↓
6. Only authorized data returned
```

**Public keys are safe to expose. Security is via RLS.**

---

## 🌐 DEPLOYMENT

### Automatic (Frontend)
```bash
git push origin main
# Vercel auto-builds and deploys
```

### Manual (Edge Functions - when changed)
```bash
supabase functions deploy <function-name>
```

### Manual (Database - when schema changes)
```bash
supabase db push
```

---

## 📊 COMPLETE DATA FLOW

### Customer Places Order

```
React Component
  ↓
supabase.from('orders').insert(orderData)
  ↓
Supabase validates JWT token
  ↓
RLS checks permissions
  ↓
Data inserted into PostgreSQL
  ↓
Realtime broadcasts update
  ↓
Operations dashboard receives update
```

### Payment Processing

```
Checkout Page
  ↓
Call Edge Function: /create-paypal-order
  ↓
Edge Function calls PayPal API
  ↓
Return approval URL
  ↓
User redirects to PayPal
  ↓
PayPal webhook → /paypal-webhook
  ↓
Edge Function updates order status
  ↓
Realtime pushes to frontend
```

---

## 🔑 ENVIRONMENT VARIABLES

### Vercel (PUBLIC - safe to expose)
```env
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Supabase Secrets (PRIVATE - for Edge Functions)
```bash
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
TWILIO_AUTH_TOKEN
SENDGRID_API_KEY
```

---

## 📦 12 SUPABASE EDGE FUNCTIONS

1. `create-paypal-order` - Initialize payment
2. `capture-paypal-order` - Complete payment
3. `paypal-webhook` - Handle PayPal callbacks
4. `send-email` - Email via SendGrid
5. `send-sms` - SMS via Twilio
6. `update-loyalty` - Loyalty points
7. `get-driver-location` - Driver GPS
8. `update-driver-location` - Update GPS
9. `compliance-report` - Generate reports
10. `mfa-verify` - Multi-factor auth
11. `sso-auth` - Single sign-on
12. `server` - Main API handler

**All run on Supabase Deno runtime, NOT AWS Lambda.**

---

## 📋 9 DATABASE TABLES (All with RLS)

1. `stores` - Store locations
2. `menu_items` - Products/menu
3. `orders` - Customer orders
4. `customers` - Customer accounts
5. `drivers` - Driver fleet
6. `inventory` - Stock management
7. `payments` - Payment records
8. `loyalty_points` - Loyalty program
9. `compliance_logs` - Audit logs

**All tables have:**
- `tenant_id` for multi-tenant isolation
- Row Level Security policies
- Timestamps (created_at, updated_at)

---

## 💰 COST

**Monthly Infrastructure:**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- **Total: $45/month**

**vs AWS equivalent: $200+/month**

---

## 🔍 VERIFICATION

### How to Prove ZERO AWS Usage

**Check AWS Console:**
1. Lambda → Should be 0 functions
2. RDS → Should be 0 databases
3. API Gateway → Should be 0 APIs
4. EventBridge → Should be 0 custom buses

**Check Vercel Dashboard:**
1. Deployments → See React builds
2. No serverless functions
3. Only static files deployed

**Check Supabase Dashboard:**
1. Database → 9 tables
2. Edge Functions → 12 functions
3. Auth → Users and sessions

---

## 📚 DOCUMENTATION REFERENCE

| Document | Purpose |
|----------|---------|
| **[ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md)** | Complete overview |
| **[VERCEL_SUPABASE_ARCHITECTURE.md](./VERCEL_SUPABASE_ARCHITECTURE.md)** | Detailed diagrams |
| **[VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md)** | Deployment guide |
| **[AWS_CLEANUP_COMPLETE.md](./AWS_CLEANUP_COMPLETE.md)** | Migration details |
| **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** | Command reference |
| **[README.md](./README.md)** | Main docs |

---

## ✅ SUMMARY

**GlenKeos Architecture:**
- ✅ 100% Vercel + Supabase
- ✅ ZERO AWS services
- ✅ All backend in Supabase
- ✅ All frontend on Vercel
- ✅ Production ready
- ✅ Auto-deploying
- ✅ Cost-effective ($45/mo)
- ✅ Fully documented

**If anyone mentions AWS:**
- They're referring to legacy code
- AWS provides us ZERO services
- Point them to this document

---

**Version:** 2.0  
**Date:** April 23, 2026  
**Status:** OFFICIAL - Production Architecture  
**Authority:** This document supersedes all AWS references

---

# THIS IS THE TRUTH. 🎯
