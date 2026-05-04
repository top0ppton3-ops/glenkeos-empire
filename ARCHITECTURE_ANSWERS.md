# GlenKeos Enterprise Architecture - Technical Foundation

**Date**: April 24, 2026  
**Status**: Production-Ready Foundation

---

## Critical Architecture Decisions

### 1. Auth Model
**Decision**: Single `users` table with role-based access control

**Implementation**:
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(50) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,  -- SUPER_ADMIN | CORPORATE_ADMIN | STORE_MANAGER | STAFF | DRIVER | CUSTOMER
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

**Roles**:
- `SUPER_ADMIN`: Platform-wide access (GlenKeos Inc corporate)
- `CORPORATE_ADMIN`: Multi-store access within brand
- `STORE_MANAGER`: Single store management
- `STAFF`: Store operations staff
- `DRIVER`: Delivery fleet
- `CUSTOMER`: End users

**Why**: Simplifies authentication, enables role hierarchies, easier to audit, single source of truth.

---

### 2. Multi-Tenant Model
**Decision**: Hard isolation with corporate cross-tenant access

**Implementation**:
```sql
-- Every table has tenant_id
CREATE TABLE public.orders (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,  -- Hard isolation
  ...
);

-- RLS Policy: Hard isolation by default
CREATE POLICY orders_tenant_isolation ON orders
  USING (
    tenant_id = auth.jwt() ->> 'tenant_id' 
    OR 
    auth.jwt() ->> 'role' = 'SUPER_ADMIN'  -- Corporate override
  );
```

**Tenancy Structure**:
- `chic-on-chain-{store_id}`: Each Chic-on-Chain location is a tenant
- `ghetto-eats-{store_id}`: Each Ghetto Eats hub is a tenant  
- `goldkey-{location_id}`: Each GoldKey location is a tenant
- `glenkeos-corporate`: Master tenant for cross-brand analytics

**Why**: 
- Regulatory compliance (GDPR, SOC2 require data isolation)
- Franchise model ready (each franchisee owns their data)
- Corporate analytics still possible via `SUPER_ADMIN` role
- Scale to 1000+ locations without data leakage

---

### 3. Data API Usage
**Decision**: Supabase client (PostgREST) + Edge Functions for complex operations

**Frontend (90% of operations)**:
```typescript
import { supabase } from '@/lib/supabase';

// Simple CRUD via Supabase client
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('status', 'PENDING');

// RLS enforces tenant_id automatically via JWT
```

**Backend (10% - complex operations)**:
```typescript
// supabase/functions/create-paypal-order/index.ts
// Edge Functions for:
// - Payment processing (PayPal, Stripe webhooks)
// - External API integrations (Twilio SMS, SendGrid email)
// - Complex business logic (revenue recognition, inventory reconciliation)
// - Async jobs (report generation, bulk operations)
```

**Why**:
- PostgREST = auto-generated REST API (no backend code needed)
- RLS = security enforced at database level (cannot be bypassed)
- Edge Functions = Deno runtime (TypeScript, fast cold starts, global deployment)
- Realtime = WebSocket subscriptions built-in (no polling needed)

**NOT using**:
- ❌ Server actions (Next.js specific, vendor lock-in)
- ❌ GraphQL (unnecessary complexity for this use case)
- ❌ Custom backend server (Supabase handles it better)

---

### 4. Realtime Requirements
**Decision**: WebSocket subscriptions on critical operational tables

**Tables with Realtime Enabled**:

1. **`orders`** - Critical
   - New order notifications for kitchen staff
   - Status updates for customers ("Your order is ready!")
   - Driver assignment notifications
   - Real-time order board in operations dashboard

2. **`drivers`** - Critical
   - Live location tracking (lat/lng updates every 10 seconds)
   - Online/offline status
   - Current delivery assignments
   - Fleet management dashboard

3. **`inventory_items`** - High Priority
   - Low stock alerts
   - Real-time inventory depletion during peak hours
   - Auto-ordering triggers when stock drops below threshold

4. **`notifications`** - Medium Priority
   - Push notification delivery
   - Read receipts
   - Real-time alerts for staff

5. **`order_items`** - Medium Priority  
   - Kitchen display system (KDS) updates
   - Item preparation status changes

**NOT using Realtime**:
- `customers` (static data, changes infrequent)
- `stores` (configuration data, rarely changes)
- `menu_items` (updated via admin panel, not time-critical)
- `compliance_audit_log` (write-only, never updated)

**Implementation**:
```typescript
// Frontend subscription
const subscription = supabase
  .channel('orders-channel')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('Order updated:', payload.new);
      // Update UI automatically
    }
  )
  .subscribe();
```

**Why**:
- Critical for operations (kitchen can't wait 30 seconds for refresh)
- Customer experience (live delivery tracking like Uber Eats)
- Cost-effective (Supabase handles WebSocket scaling)
- Selective (only tables that need it, not everything)

---

## System Capacity Targets

**Year 1 (Current)**:
- 10 locations, 50K customers
- ~500 orders/day peak
- ~50 concurrent users
- Current infrastructure handles this easily

**Year 3 (Scaling)**:
- 250 locations, 500K customers  
- ~25,000 orders/day peak
- ~5,000 concurrent users
- Requires: Supabase Pro ($500/mo), connection pooling, read replicas

**Year 5 (Fortune 500)**:
- 1,000 locations, 5M customers
- ~100,000 orders/day peak  
- ~20,000 concurrent users
- Requires: Supabase Enterprise, dedicated Postgres instances, multi-region deployment

**Scalability Plan**:
- At 100 locations: Enable read replicas
- At 500 locations: Multi-region deployment (US-East, US-West)
- At 1000 locations: Dedicated Postgres cluster per brand

---

## Generation Outputs

Based on these answers, generate:

✅ **SQL Schema**: Complete database schema with all tables, indexes, RLS policies  
✅ **RLS Policies**: Row-level security for every table (hard isolation + corporate override)  
✅ **Indices**: Performance indexes for operational queries (<10ms response times)  
✅ **Realtime Channels**: WebSocket configuration for 5 critical tables  
✅ **API Spec**: OpenAPI 3.1 specification (all endpoints, request/response schemas)  
✅ **Data Model**: Entity-relationship diagram with validation rules  
✅ **Figma Flow Definitions**: User journey maps (customer, staff, driver, admin)  
✅ **DevOps YAML**: GitHub Actions CI/CD pipeline (lint, test, security scan, deploy)  
✅ **Compliance Baseline**: SOC 2, GDPR, PCI-DSS implementation checklist  

---

**Next Step**: Generate all 9 deliverables now.
