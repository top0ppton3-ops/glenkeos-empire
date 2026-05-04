# GlenKeos Platform Architecture

**Version**: 1.0.0-enterprise  
**Last Updated**: April 24, 2026  
**Stack**: Vercel + Supabase (No AWS)

---

## System Overview

GlenKeos is a multi-brand restaurant platform supporting three brands:
- **Chic-on-Chain**: Premium dining ($25-75/order, 50% margins)
- **Ghetto Eats**: Fast delivery ($8-20/order, 60% margins)
- **GoldKey**: VIP concierge (invite-only, membership-based)

**Architecture Pattern**: Modular monolith with multi-tenant isolation  
**Deployment Model**: Serverless (Vercel edge functions + Supabase)  
**Database**: PostgreSQL 15+ with Row-Level Security (RLS)

---

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS v4.1.12
- **Routing**: React Router 7.13.0 (Data mode)
- **State**: Zustand 5.0.12
- **Animation**: Motion 12.23.24
- **Deployment**: Vercel (300+ edge locations)

### Backend
- **Database**: Supabase PostgreSQL 15+
- **Auth**: Supabase Auth (JWT-based)
- **API**: PostgREST (auto-generated REST API)
- **Functions**: Supabase Edge Functions (Deno runtime)
- **Realtime**: WebSocket subscriptions (5 tables)
- **Storage**: Supabase Storage (S3-compatible)

### Integrations
- **Payments**: PayPal + Stripe
- **SMS**: Twilio
- **Email**: SendGrid / Resend
- **Monitoring**: Sentry + UptimeRobot
- **Analytics**: Vercel Analytics

---

## Architecture Principles

### 1. Multi-Tenancy
Every table has `tenant_id` column. RLS enforces hard isolation:
```sql
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = auth.user_tenant_id() OR auth.has_corporate_access());
```

**Tenancy Model**:
- Each store/location = separate tenant
- Corporate users (SUPER_ADMIN) can access all tenants
- Customers can only see their own data

### 2. Security-First
- **Authentication**: JWT tokens via Supabase Auth
- **Authorization**: Row-level security (RLS) at database level
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Secrets**: Vercel environment variables (never in code)

### 3. Lean Infrastructure
- **NO AWS** (too complex, too expensive)
- **NO Kubernetes** (unnecessary operational overhead)
- **YES Vercel** (auto-scaling, CDN, edge functions)
- **YES Supabase** (managed PostgreSQL, realtime, auth)

**Cost**: $45/month vs. $200k-500k/year on AWS

### 4. API-First
- PostgREST auto-generates REST API from database schema
- OpenAPI specification documents all endpoints
- Edge Functions handle complex business logic
- Realtime subscriptions for live updates

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   USER CLIENTS                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Browser  │  │  Mobile  │  │  Tablet  │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│       │             │              │                 │
│       └─────────────┼──────────────┘                 │
│                     │                                 │
│                     ▼                                 │
│         ┌───────────────────────┐                    │
│         │   VERCEL CDN (Global) │                    │
│         │ 300+ Edge Locations   │                    │
│         └───────────┬───────────┘                    │
│                     │                                 │
│                     ▼                                 │
│         ┌───────────────────────┐                    │
│         │  React Application    │                    │
│         │  - TypeScript         │                    │
│         │  - Tailwind CSS       │                    │
│         │  - React Router       │                    │
│         └───────────┬───────────┘                    │
│                     │                                 │
│                     ▼                                 │
│         ┌───────────────────────┐                    │
│         │  Supabase Client      │                    │
│         │  (PostgREST + Auth)   │                    │
│         └───────────┬───────────┘                    │
└─────────────────────┼───────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   SUPABASE (Backend)       │
         │                             │
         │  ┌──────────────────────┐  │
         │  │ PostgreSQL 15+       │  │
         │  │ - Multi-tenant       │  │
         │  │ - Row-level Security │  │
         │  │ - 9 tables           │  │
         │  └──────────┬───────────┘  │
         │             │               │
         │  ┌──────────┴───────────┐  │
         │  │ Supabase Auth        │  │
         │  │ - JWT tokens         │  │
         │  │ - Role-based access  │  │
         │  └──────────────────────┘  │
         │                             │
         │  ┌──────────────────────┐  │
         │  │ Edge Functions       │  │
         │  │ - Payment processing │  │
         │  │ - Notifications      │  │
         │  │ - Webhooks           │  │
         │  └──────────────────────┘  │
         │                             │
         │  ┌──────────────────────┐  │
         │  │ Realtime             │  │
         │  │ - WebSocket          │  │
         │  │ - 5 channels active  │  │
         │  └──────────────────────┘  │
         └─────────────┬───────────────┘
                       │
                       ▼
         ┌────────────────────────────┐
         │ EXTERNAL INTEGRATIONS      │
         │                             │
         │  - PayPal API              │
         │  - Stripe API              │
         │  - Twilio (SMS)            │
         │  - SendGrid (Email)        │
         │  - Sentry (Monitoring)     │
         └────────────────────────────┘
```

---

## Database Schema

**Tables**: 9 core tables
1. `stores` - Store locations
2. `customers` - Customer profiles
3. `menu_items` - Menu items per store
4. `inventory_items` - Real-time inventory
5. `orders` - All orders (CRITICAL)
6. `order_items` - Line items
7. `drivers` - Delivery fleet
8. `notifications` - Multi-channel notifications
9. `compliance_audit_log` - Immutable audit trail (SOC 2 / GDPR)

**See**: `/docs/architecture/COMPLETE_DATABASE_SCHEMA.sql`

---

## Authentication & Authorization

### Authentication Flow
1. User enters email/password
2. Supabase Auth validates credentials
3. JWT token issued containing:
   ```json
   {
     "sub": "user-uuid",
     "tenant_id": "chic-on-chain-001",
     "role": "MANAGER",
     "exp": 1735689600
   }
   ```
4. Token stored in localStorage
5. Every API call includes: `Authorization: Bearer {token}`

### Authorization (RLS)
Row-level security enforces access control at database level:
```sql
-- Only returns orders for user's tenant
SELECT * FROM orders; -- Auto-filtered by RLS

-- Behind the scenes, PostgreSQL enforces:
SELECT * FROM orders WHERE tenant_id = auth.user_tenant_id();
```

**Roles**:
- `SUPER_ADMIN`: Platform-wide access
- `CORPORATE_ADMIN`: Multi-store access within brand
- `STORE_MANAGER`: Single store management
- `STAFF`: Store operations
- `DRIVER`: Delivery fleet
- `CUSTOMER`: End users

---

## Real-time Architecture

**Enabled Tables**:
- `orders` - Order status updates
- `drivers` - Live location tracking
- `inventory_items` - Stock level changes
- `notifications` - Push notifications
- `order_items` - Kitchen display system

**Implementation**:
```typescript
const subscription = supabase
  .channel('orders-realtime')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'orders' },
    (payload) => {
      // Update UI automatically
      setOrders(prev => [...prev, payload.new]);
    }
  )
  .subscribe();
```

---

## Data Flow

### Order Creation Flow
1. Customer adds items to cart (frontend state)
2. Customer clicks "Place Order"
3. Frontend sends POST to `/rest/v1/orders`
4. PostgreSQL validates and inserts order
5. RLS enforces tenant_id match
6. Trigger logs change to `compliance_audit_log`
7. Realtime broadcasts order to all subscribed clients
8. Edge Function creates PayPal payment intent
9. Customer redirected to PayPal checkout
10. Webhook confirms payment, updates order status
11. Realtime broadcasts status change to kitchen staff
12. Order appears on Kitchen Display System

---

## Scalability Targets

| Metric | Year 1 | Year 3 | Year 5 |
|--------|--------|--------|--------|
| Locations | 10 | 250 | 1,000+ |
| Customers | 50K | 500K | 5M+ |
| Orders/day | 500 | 25,000 | 100,000+ |
| Concurrent users | 50 | 5,000 | 20,000+ |
| Database size | <1 GB | 100 GB | 1 TB+ |
| Monthly cost | $45 | $500 | $5,000 |

**Scaling Strategy**:
- At 100 locations: Enable read replicas
- At 500 locations: Multi-region deployment
- At 1000 locations: Dedicated Postgres cluster per brand

---

## Disaster Recovery

**RTO** (Recovery Time Objective): 1 hour  
**RPO** (Recovery Point Objective): 5 minutes

**Backup Strategy**:
- Daily automated backups (Supabase)
- 30-day retention
- Point-in-time recovery available
- Monthly restore tests

**Failure Scenarios**:
- Vercel down → Auto-failover to nearest edge location (<1 second)
- Database down → Restore from backup (~30 minutes)
- Payment processor down → Queue orders, retry automatically

---

## Compliance

**SOC 2 Type II**: Audit scheduled Q3 2026  
**GDPR**: Data Processing Agreement signed with Supabase  
**PCI-DSS**: SAQ A (using Stripe/PayPal, we don't store card data)

**See**: `/docs/compliance/SOC2_GDPR_COMPLIANCE_BASELINE.md`

---

## Monitoring

**Uptime**: 99.99% SLA (4.3 minutes downtime/month allowed)  
**Performance**: API p95 < 200ms  
**Error Rate**: <0.1% (1 error per 1,000 requests)

**Tools**:
- Sentry (error tracking, performance monitoring)
- UptimeRobot (uptime monitoring)
- Vercel Analytics (traffic, performance)
- Supabase Dashboard (database metrics)

**See**: `/docs/devops/MONITORING_OBSERVABILITY_PLAN.md`

---

## Security

**Threat Model**:
- SQL Injection → Prevented by PostgREST parameterized queries
- XSS → Prevented by React auto-escaping
- CSRF → Prevented by JWT tokens (no cookies)
- Data leakage → Prevented by RLS policies
- Secrets exposure → All secrets in environment variables

**Penetration Testing**: Annual requirement (contract Q2 2026)

---

## Development Workflow

1. Developer creates feature branch
2. Writes code, adds tests
3. Opens pull request
4. CI/CD pipeline runs:
   - Lint (ESLint)
   - Type check (TypeScript strict mode)
   - Unit tests (Jest)
   - Integration tests (against staging DB)
   - Security scan (Snyk, TruffleHog)
   - Build production bundle
5. Preview deployment to Vercel (unique URL per PR)
6. Code review (2 approvals required)
7. Merge to main → Auto-deploy to production

**See**: `.github/workflows/ci-cd-pipeline.yml`

---

## File Structure

```
/workspaces/default/code/
├── src/
│   ├── app/                 # Application code
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components (routes)
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API clients
│   │   └── contexts/        # React contexts (auth, theme)
│   ├── shared/              # Shared utilities
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   └── styles/              # Global styles
├── supabase/
│   ├── functions/           # Edge Functions (Deno)
│   └── migrations/          # Database migrations
├── scripts/                 # Setup scripts
├── docs/                    # Documentation
│   ├── api/                 # API specs
│   ├── architecture/        # Architecture docs
│   ├── compliance/          # SOC 2, GDPR
│   └── devops/              # CI/CD, monitoring
├── .github/
│   └── workflows/           # GitHub Actions
└── public/                  # Static assets
```

---

## Key Documents

- **API Specification**: `/docs/api/OPENAPI_SPECIFICATION.yaml`
- **Database Schema**: `/docs/architecture/COMPLETE_DATABASE_SCHEMA.sql`
- **Environment Schema**: `/env.schema.json`
- **Compliance Baseline**: `/docs/compliance/SOC2_GDPR_COMPLIANCE_BASELINE.md`
- **Monitoring Plan**: `/docs/devops/MONITORING_OBSERVABILITY_PLAN.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Security Policy**: `SECURITY.md`

---

**This architecture scales from 10 locations to 1,000+ while maintaining simplicity and operational excellence.**
