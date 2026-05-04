# 🚀 DEPLOY DATABASE NOW - 2 MINUTE GUIDE

**Date**: May 4, 2026  
**Status**: Ready to deploy  
**Method**: Copy-paste into Supabase SQL Editor

---

## ✅ QUICK DEPLOY (RECOMMENDED)

### Step 1: Open SQL Editor
https://supabase.com/dashboard/project/beswluhdxaphtitaovly/sql/new

### Step 2: Copy & Run This Script

```sql
-- GlenKeos Empire - Core Tables Deployment
-- Safe to run multiple times (idempotent)

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "http";

-- 2. User Roles (Base Schema)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'driver', 'manager', 'support', 'corporate', 'executive')),
  tenant_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant ON user_roles(tenant_id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own roles" ON user_roles;
CREATE POLICY "Users view own roles" ON user_roles FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Corporate users manage roles" ON user_roles;
CREATE POLICY "Corporate users manage roles" ON user_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('corporate', 'executive')
  )
);

-- 3. Payment Status Type
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'canceled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4. Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card', 'apple_pay', 'cash_app')),
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_reference TEXT NOT NULL,
  last4 TEXT,
  brand TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own payment methods" ON payment_methods;
CREATE POLICY "Users manage own payment methods" ON payment_methods FOR ALL
USING (user_id = auth.uid());

-- 5. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID,
  payment_method_id UUID REFERENCES payment_methods(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_reference TEXT,
  provider_raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own payments" ON payments;
CREATE POLICY "Users view own payments" ON payments FOR SELECT
USING (user_id = auth.uid());

-- 6. Refunds
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  amount INTEGER NOT NULL,
  reason TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  provider_reference TEXT,
  provider_raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own refunds" ON refunds;
CREATE POLICY "Users view own refunds" ON refunds FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM payments p
    WHERE p.id = refunds.payment_id
    AND p.user_id = auth.uid()
  )
);

-- 7. Ledger Entries (Immutable)
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  refund_id UUID REFERENCES refunds(id),
  account_debit TEXT NOT NULL,
  account_credit TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_payment ON ledger_entries(payment_id);
CREATE INDEX IF NOT EXISTS idx_ledger_refund ON ledger_entries(refund_id);

ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Prevent ledger modifications
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Ledger entries are immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_ledger_update ON ledger_entries;
CREATE TRIGGER prevent_ledger_update
  BEFORE UPDATE OR DELETE ON ledger_entries
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

-- ✅ DEPLOYMENT COMPLETE
DO $$
BEGIN
  RAISE NOTICE '✅ Core tables deployed successfully';
  RAISE NOTICE '📊 Tables: user_roles, payment_methods, payments, refunds, ledger_entries';
  RAISE NOTICE '🔒 RLS policies active';
  RAISE NOTICE '🛡️ Ledger immutability enforced';
END $$;
```

### Step 3: Verify Deployment
Run this query to confirm tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'payment_methods', 'payments', 'refunds', 'ledger_entries')
ORDER BY table_name;
```

---

## 🌐 FIX SITE NOT UPDATING (CRITICAL)

### ROOT CAUSE
Your Vercel project is NOT connected to GitHub. Deployments only happen via manual webhook.

### FIX (2 minutes)

**Step 1**: Go to Vercel Git Settings  
https://vercel.com/top0ppton3-ops-projects/codebuild-default-webhook-source-location/settings/git

**Step 2**: Click **Connect Git Repository**

**Step 3**: Select Repository
- Repository: `top0ppton3-ops/glenkeos-empire`
- Branch: `master`

**Step 4**: Save

**Result**: Every git push will now auto-deploy to Vercel

---

## 📁 REPOSITORY CLARIFICATION

### You have ONE repository:
- **GitHub Repo**: `glenkeos-empire` (https://github.com/top0ppton3-ops/glenkeos-empire)
- **Branch**: `master`

### Vercel Project:
- **Project Name**: `codebuild-default-webhook-source-location`
- **Deploys FROM**: `glenkeos-empire` repository

**These are NOT two separate repos** - it's one repo deploying to one Vercel project.

---

## ✅ COMPLETE DEPLOYMENT CHECKLIST

1. **Deploy Database** (SQL script above - 2 min)
2. **Connect Vercel to GitHub** (Fix auto-deploy - 2 min)
3. **Verify Site Updates** (Push test commit - 1 min)
4. **Add Custom Domain** (www.glenkeos.com - 5 min)

**Total**: 10 minutes to 100% deployment

---

**Action**: Copy the SQL script above into Supabase SQL Editor NOW.
