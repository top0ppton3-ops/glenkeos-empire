# GlenKeos Empire - Structure Contract

**Date**: May 4, 2026  
**Purpose**: Repeatable, modular payments + platform architecture  
**Stack**: Next.js + Supabase + Stripe

---

## 🎯 NORTH STAR

Build a **repeatable** payments + platform architecture that:
- ✅ Is **owned by you** (your processor lane, your data)
- ✅ Is **modular** (can be cloned for new brands/rails)
- ✅ Is **documented** so any new engineer can onboard fast

**This is not a one-off build. This is a template for the future.**

---

## 📁 FOLDER LAYOUT

```
glenkeos/
├── supabase/
│   ├── migrations/          # All database migrations (timestamped)
│   │   ├── 20260504050001_payments_complete.sql
│   │   ├── 20260504060001_menu_options_and_bookings.sql
│   │   └── ...
│   └── seed/                # Seed data for development
│
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── (customer)/      # Customer portal routes
│   │   ├── (manager)/       # Manager portal routes
│   │   ├── (corporate)/     # Corporate portal routes
│   │   ├── (executive)/     # Executive portal routes
│   │   ├── api/             # API route handlers
│   │   └── components/      # Shared UI components
│   │
│   ├── lib/                 # Domain logic (BUSINESS LOGIC ONLY HERE)
│   │   ├── payments/        # Payments domain
│   │   │   ├── index.ts     # Main orchestrator
│   │   │   ├── card.ts      # Card payment processing
│   │   │   ├── apple-pay.ts # Apple Pay processing
│   │   │   ├── cash-app.ts  # Cash App processing
│   │   │   └── types.ts     # Payment types
│   │   ├── orders/          # Orders domain
│   │   │   ├── index.ts
│   │   │   ├── pricing.ts   # Pricing resolution
│   │   │   └── types.ts
│   │   ├── menu/            # Menu domain
│   │   ├── support/         # Support domain
│   │   ├── delivery/        # Delivery domain
│   │   └── ...
│   │
│   ├── services/            # External service integrations
│   │   └── api/             # API clients
│   │       ├── payments.ts  # Payment service client
│   │       ├── orders.ts    # Orders service client
│   │       └── supabaseAPI.ts
│   │
│   ├── types/               # Shared TypeScript types
│   │   └── contracts.ts     # API contracts
│   │
│   └── utils/               # Utility functions
│       └── supabase/
│           └── client.ts    # Supabase client
│
├── docs/                    # Domain documentation
│   ├── STRUCTURE.md         # This file
│   ├── PAYMENTS_DOMAIN.md   # Payments domain spec
│   ├── ORDERS_DOMAIN.md     # Orders domain spec (future)
│   └── ...
│
├── package.json
└── README.md
```

---

## 🧱 DOMAIN BOUNDARIES

### What is a Domain?

A **domain** is a cohesive set of business logic that:
- Has clear responsibilities
- Owns its own data model
- Can be understood independently
- Can be extended without breaking others

### Current Domains

| Domain | Responsibility | Location |
|--------|---------------|----------|
| **Payments** | Card, Apple Pay, Cash App processing | `src/lib/payments/` |
| **Orders** | Order creation, pricing, status management | `src/lib/orders/` |
| **Menu** | Menu items, categories, options | `src/lib/menu/` |
| **Pricing** | Pricing rules, promotions, discounts | `src/lib/pricing/` |
| **Delivery** | Delivery zones, driver assignment | `src/lib/delivery/` |
| **Support** | Support tickets, messages | `src/lib/support/` |
| **Assignments** | Staff/driver assignments | `src/lib/assignments/` |
| **Notifications** | Real-time notifications | `src/lib/notifications/` |

---

## 🚫 WHERE LOGIC LIVES (CRITICAL)

### ✅ DO: Put logic in `/lib`

```typescript
// ✅ CORRECT: src/lib/payments/index.ts
export async function processCardPayment(params: CardPaymentParams) {
  // Business logic here
  const payment = await createPaymentIntent(params);
  const order = await updateOrderStatus(payment);
  return { payment, order };
}
```

### ❌ DON'T: Put logic in routes

```typescript
// ❌ WRONG: src/app/api/payments/route.ts
export async function POST(request: Request) {
  // DON'T do this - no business logic in routes!
  const payment = await stripe.charges.create(...);
  const order = await db.orders.update(...);
  return Response.json({ payment, order });
}
```

### ✅ DO: Routes only call domain functions

```typescript
// ✅ CORRECT: src/app/api/payments/route.ts
import { processCardPayment } from '@/lib/payments';

export async function POST(request: Request) {
  const body = await request.json();
  const result = await processCardPayment(body); // Domain does the work
  return Response.json(result);
}
```

---

## 📦 MIGRATION STRATEGY

### Naming Convention

```
YYYYMMDDHHMMSS_description.sql

Examples:
20260504050001_payments_complete.sql
20260504060001_menu_options_and_bookings.sql
20260505120000_add_loyalty_points.sql
```

### Migration Rules

1. **Never edit existing migrations** - Always create new ones
2. **Always test locally first** - `supabase db reset`
3. **Include rollback in comments** - Document how to undo
4. **One domain per migration** - Don't mix payments + orders
5. **Update domain docs** - Every migration = update PAYMENTS_DOMAIN.md

### Running Migrations

```bash
# Local development
supabase db reset              # Apply all migrations from scratch
supabase db push              # Push local migrations to remote

# Production
supabase db push --linked     # Push to linked production project
```

---

## 🔄 HOW TO ADD A NEW PAYMENT RAIL

**Example**: Adding Venmo support

### 1. Database Migration

Create `supabase/migrations/YYYYMMDDHHMMSS_add_venmo.sql`:

```sql
-- Add venmo to payment type enum
ALTER TYPE payment_type ADD VALUE IF NOT EXISTS 'venmo';

-- Create venmo-specific RPC if needed
CREATE OR REPLACE FUNCTION process_venmo_payment(
  p_user_id UUID,
  p_order_id UUID,
  p_amount INTEGER,
  p_venmo_token TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Implementation
$$;
```

### 2. Domain Logic

Create `src/lib/payments/venmo.ts`:

```typescript
export interface VenmoPaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  venmoToken: string;
}

export async function processVenmoPayment(
  params: VenmoPaymentParams
): Promise<Payment> {
  // 1. Validate venmo token
  // 2. Create payment intent
  // 3. Process with Venmo API
  // 4. Update database
  // 5. Return payment
}
```

### 3. Update Main Orchestrator

Edit `src/lib/payments/index.ts`:

```typescript
import { processVenmoPayment } from './venmo';

export async function processPayment(params: PaymentParams) {
  switch (params.type) {
    case 'card': return processCardPayment(params);
    case 'apple_pay': return processApplePayment(params);
    case 'cash_app': return processCashAppPayment(params);
    case 'venmo': return processVenmoPayment(params); // Add this
    default: throw new Error(`Unsupported payment type: ${params.type}`);
  }
}
```

### 4. Update Documentation

Edit `docs/PAYMENTS_DOMAIN.md`:
- Add Venmo to supported payment types
- Document Venmo-specific flows
- Update API contracts

### 5. Done!

That's it. The domain pattern makes it trivial to add new payment rails.

---

## 🧪 HOW TO ADD A NEW PRODUCT LINE

**Example**: Adding a subscription product

### 1. Create Domain

```
src/lib/subscriptions/
├── index.ts          # Main orchestrator
├── create.ts         # Create subscription
├── cancel.ts         # Cancel subscription
├── upgrade.ts        # Upgrade/downgrade
└── types.ts          # Subscription types
```

### 2. Create Database Migration

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  -- ...
);
```

### 3. Create API Routes

```
src/app/api/subscriptions/
├── create/route.ts
├── cancel/route.ts
└── upgrade/route.ts
```

Each route calls domain functions:

```typescript
import { createSubscription } from '@/lib/subscriptions';

export async function POST(request: Request) {
  const body = await request.json();
  const subscription = await createSubscription(body);
  return Response.json(subscription);
}
```

### 4. Reuse Existing Domains

```typescript
// subscriptions domain uses payments domain
import { processCardPayment } from '@/lib/payments';

export async function createSubscription(params: SubParams) {
  // Create subscription
  const sub = await db.insert(...);
  
  // Charge first payment using existing payments domain
  const payment = await processCardPayment({
    orderId: sub.id,
    amount: sub.plan.price,
    paymentMethodId: params.paymentMethodId,
  });
  
  return { subscription: sub, payment };
}
```

---

## 👥 ROLES & RESPONSIBILITIES

### Lead Engineer / Architect
- **Owns**: STRUCTURE.md, all `*_DOMAIN.md` docs
- **Reviews**: Any change touching core domains
- **Ensures**: New code follows domain patterns

### Backend Engineers
- **Own**: `/src/lib/*` and `/supabase/migrations`
- **Never**: Put logic in routes
- **Always**: Update domain docs with migrations

### Frontend Engineers
- **Own**: `/src/app` and UI components
- **Follow**: Patterns from domain docs
- **Call**: Domain functions via API routes

### DevOps / Infra
- **Own**: Supabase project, env vars, deployment
- **Ensure**: Migrations run in CI
- **Monitor**: Database performance

---

## ✅ CHECKLIST: Adding a New Feature

- [ ] 1. Does this belong in an existing domain? If yes, extend it.
- [ ] 2. If new domain: Create `/src/lib/[domain]/` folder structure
- [ ] 3. Write business logic in domain files (NOT in routes)
- [ ] 4. Create database migration if needed
- [ ] 5. Create API routes that ONLY call domain functions
- [ ] 6. Update or create `[DOMAIN]_DOMAIN.md` documentation
- [ ] 7. Test locally with `supabase db reset`
- [ ] 8. Submit PR with domain + migration + docs
- [ ] 9. Architect reviews domain boundaries
- [ ] 10. Deploy migration + code together

---

## 🚨 ANTI-PATTERNS TO AVOID

### ❌ Business Logic in Routes
```typescript
// ❌ WRONG
export async function POST(request: Request) {
  const stripe = new Stripe(key);
  const charge = await stripe.charges.create(...); // Logic in route!
}
```

### ❌ Domain Crossing Boundaries Directly
```typescript
// ❌ WRONG: payments domain directly accessing orders table
import { db } from '@/lib/db';
export async function processPayment() {
  await db.orders.update(...); // Orders domain should own this!
}
```

### ❌ Mixing Domains in One File
```typescript
// ❌ WRONG: payments + orders + menu in one file
export async function checkout() {
  const menu = await loadMenu();      // Menu domain
  const pricing = await resolve();    // Pricing domain
  const order = await create();       // Orders domain
  const payment = await charge();     // Payments domain
  // This should be orchestrated by a checkout domain!
}
```

### ❌ Migration Without Documentation
```sql
-- ❌ WRONG: Migration without updating PAYMENTS_DOMAIN.md
ALTER TABLE payments ADD COLUMN new_field TEXT;
-- ^ You MUST update documentation when schema changes!
```

---

## 📖 NEXT STEPS

1. **Read**: `PAYMENTS_DOMAIN.md` - See how a complete domain is documented
2. **Clone**: Use payments domain as template for new domains
3. **Extend**: Add new payment rails following the pattern
4. **Repeat**: Every new feature follows this structure

---

## 🎯 SUCCESS METRICS

Your team knows the structure is working when:
- ✅ New engineers can find code in <5 minutes
- ✅ Adding a payment rail takes <1 day (not <1 week)
- ✅ PRs have clear domain ownership
- ✅ No business logic lives in API routes
- ✅ Migrations always come with doc updates
- ✅ Domains can be reused across brands/products

---

**This structure is your competitive advantage. Protect it.**
