# GlenKeos Production Architecture
## 100% Vercel + Supabase (ZERO AWS)

**Last Updated:** April 23, 2026  
**Status:** Production Ready

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                        │
│              React 18.3.1 SPA (Vite 6.3.5)              │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   VERCEL HOSTING                         │
│  • Static React build (dist/)                           │
│  • CDN distribution                                      │
│  • HTTPS/SSL automatic                                  │
│  • Environment variables:                               │
│    - VITE_SUPABASE_URL                                  │
│    - VITE_SUPABASE_ANON_KEY                             │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│              SUPABASE BACKEND (All Services)             │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database + Row Level Security (RLS)  │  │
│  │  • stores                                        │  │
│  │  • menu_items                                    │  │
│  │  • orders                                        │  │
│  │  • customers                                     │  │
│  │  • drivers                                       │  │
│  │  • inventory                                     │  │
│  │  • payments                                      │  │
│  │  • loyalty_points                                │  │
│  │  • compliance_logs                               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Supabase Auth (JWT-based)                       │  │
│  │  • Email/password authentication                 │  │
│  │  • OAuth (Google, etc.)                          │  │
│  │  • Session management                            │  │
│  │  • Role-based access control                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Edge Functions (Deno runtime)                   │  │
│  │  • create-paypal-order                           │  │
│  │  • capture-paypal-order                          │  │
│  │  • paypal-webhook                                │  │
│  │  • send-email                                    │  │
│  │  • send-sms                                      │  │
│  │  • update-loyalty                                │  │
│  │  • get-driver-location                           │  │
│  │  • update-driver-location                        │  │
│  │  • compliance-report                             │  │
│  │  • mfa-verify                                    │  │
│  │  • sso-auth                                      │  │
│  │  • server (main API handler)                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Storage (if needed for file uploads)            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Realtime (WebSocket subscriptions)              │  │
│  │  • Live order updates                            │  │
│  │  • Driver location tracking                      │  │
│  │  • Real-time notifications                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend (Vercel)
- **Framework:** React 18.3.1
- **Build Tool:** Vite 6.3.5
- **Styling:** Tailwind CSS 4.1.12
- **Routing:** React Router 7.13.0 (Data mode)
- **State:** Zustand 5.0.12 + React Context
- **UI Components:** Radix UI + shadcn/ui
- **Deployment:** Vercel (auto-deploy from GitHub)

### Backend (Supabase)
- **Database:** PostgreSQL 15+ with RLS
- **Auth:** Supabase Auth (JWT-based)
- **API:** Supabase PostgREST + Edge Functions
- **Realtime:** Supabase Realtime (WebSocket)
- **Storage:** Supabase Storage (optional)

### Third-Party Integrations
- **Payments:** PayPal (via Supabase Edge Functions)
- **SMS:** Twilio (via send-sms Edge Function)
- **Email:** SendGrid/Resend (via send-email Edge Function)

---

## Data Flow

### 1. Customer Storefront Flow
```
User visits glenkeos.com (Vercel)
  ↓
React loads with Supabase client
  ↓
Browse menu (supabase.from('menu_items').select())
  ↓
Add to cart (local state)
  ↓
Checkout → Create order (supabase.from('orders').insert())
  ↓
Payment → Call Supabase Edge Function (create-paypal-order)
  ↓
Capture payment → Edge Function (capture-paypal-order)
  ↓
Real-time order updates (supabase.channel().on('postgres_changes'))
```

### 2. Operations Dashboard Flow
```
Staff logs in → Supabase Auth
  ↓
JWT token stored in session
  ↓
Dashboard loads orders (supabase.from('orders').select() with RLS)
  ↓
Update order status (supabase.from('orders').update())
  ↓
Assign driver (supabase.from('orders').update({ driver_id }))
  ↓
Real-time updates pushed to customer app
```

### 3. Admin/Corporate Flow
```
Admin logs in → Supabase Auth (admin role)
  ↓
Access all tenants via RLS policies
  ↓
View analytics (aggregate queries via supabaseAPI.ts)
  ↓
Manage inventory (CRUD via Supabase client)
  ↓
Compliance reports (call compliance-report Edge Function)
```

---

## Security Model

### Row Level Security (RLS)
All database tables have RLS policies that enforce:
- **Tenant isolation** (`tenant_id` column on all tables)
- **Role-based access** (anon, authenticated, admin, staff)
- **Customer data privacy** (users only see their own data)

### Authentication Flow
```
1. User signs in → Supabase Auth
2. Supabase returns JWT access_token
3. Frontend stores token in session
4. All requests include: Authorization: Bearer <access_token>
5. RLS policies validate JWT claims
6. Database grants/denies access based on role + tenant
```

### Environment Variables (Vercel)
```env
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**NOTE:** These are PUBLIC and safe to expose in frontend code. Security is enforced by RLS.

---

## Deployment Process

### 1. Vercel Deployment
```bash
# Automatic deployment via GitHub integration
git push origin main
# Vercel auto-builds and deploys
```

**Build Configuration:**
- Build Command: `pnpm run build`
- Output Directory: `dist`
- Framework: Vite
- Environment Variables: Set in Vercel dashboard

### 2. Supabase Edge Functions Deployment
```bash
# Deploy all Edge Functions
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

### 3. Database Migrations
```bash
# Run migrations via Supabase CLI or Dashboard
supabase db push

# Or via Supabase Dashboard:
# SQL Editor → Paste migration SQL → Run
```

---

## File Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/       # React components
│   │   ├── contexts/         # AuthContext, CartContext
│   │   ├── hooks/            # Custom hooks
│   │   ├── layouts/          # Page layouts
│   │   ├── pages/            # Route pages
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── supabaseAPI.ts  # ⭐ Main backend API
│   │   │   │   ├── client.ts       # HTTP client
│   │   │   │   └── ...             # Service modules
│   │   │   └── supabase.ts         # Supabase client init
│   │   └── routes.tsx        # React Router config
│   ├── main.tsx              # App entry point
│   └── styles/               # CSS
├── supabase/
│   ├── functions/            # Edge Functions (Deno)
│   │   ├── create-paypal-order/
│   │   ├── capture-paypal-order/
│   │   ├── send-email/
│   │   └── ...
│   ├── migrations/           # Database migrations
│   └── config.toml           # Supabase config
├── database/
│   ├── complete-schema.sql   # Full database schema
│   └── migrations/           # SQL migrations
├── package.json
├── vite.config.ts
├── vercel.json               # Vercel config
└── README.md
```

---

## Key Files

### Frontend Supabase Client
**`/src/app/services/supabase.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://beswluhdxaphtitaovly.supabase.co';
const supabaseAnonKey = 'eyJhbGci...'; // Public anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### API Service Layer
**`/src/app/services/api/supabaseAPI.ts`**
- All backend CRUD operations
- Direct Supabase client calls
- No HTTP abstraction needed
- Type-safe database queries

### Vercel Configuration
**`/vercel.json`**
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install"
}
```

---

## NO AWS SERVICES

**The following are NOT used:**
- ❌ AWS Lambda
- ❌ AWS API Gateway
- ❌ AWS RDS
- ❌ AWS EventBridge
- ❌ AWS DynamoDB
- ❌ AWS Amplify
- ❌ AWS S3 (use Supabase Storage instead)
- ❌ AWS Secrets Manager
- ❌ AWS CloudFormation
- ❌ Terraform for AWS

**All backend logic is in Supabase Edge Functions.**

**All data is in Supabase PostgreSQL.**

**All authentication is via Supabase Auth.**

---

## Multi-Tenant Architecture

### Tenant Isolation
Every table has a `tenant_id` column:
- `chic-on-chain` - Premium restaurant operations
- `ghetto-eats` - Fast delivery
- `goldkey` - Ultra-luxury by invitation

### RLS Policy Example
```sql
CREATE POLICY "Users can only see their tenant's orders"
ON orders
FOR SELECT
USING (
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR
  (auth.jwt() ->> 'role') = 'admin'
);
```

---

## Monitoring & Observability

### Vercel Dashboard
- Build logs
- Deployment history
- Analytics
- Error tracking

### Supabase Dashboard
- Database queries
- Real-time connections
- Edge Function logs
- Auth users
- Storage usage

---

## Production Checklist

- [x] Frontend deployed to Vercel
- [x] Supabase project created
- [x] Database schema deployed
- [x] RLS policies enabled
- [x] Edge Functions deployed
- [x] Environment variables set
- [x] Domain configured (optional)
- [x] SSL/HTTPS enabled (automatic)
- [ ] Seed database with menu items
- [ ] Seed database with stores
- [ ] Configure PayPal credentials in Edge Functions
- [ ] Configure SMS/Email API keys
- [ ] Test end-to-end order flow

---

## Next Steps

1. **Seed Database:** Use Supabase Dashboard SQL Editor to insert initial data
2. **Configure Secrets:** Set Edge Function secrets (PayPal, Twilio, SendGrid)
3. **Test Production:** Place test orders on all three brands
4. **Monitor:** Check Vercel + Supabase dashboards for errors
5. **Scale:** Supabase auto-scales; upgrade plan if needed

---

## Support & Documentation

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **React Router:** https://reactrouter.com/
- **Tailwind CSS:** https://tailwindcss.com/

---

**Architecture Version:** 2.0  
**Last Verified:** April 23, 2026  
**Contact:** GlenKeos Platform Team
