# GlenKeos Hierarchical Tenant RLS - Setup Guide

## ✅ Step 1: Run the Migration in Supabase

The SQL migration has been created at `/supabase/migrations/0003_hierarchical_tenant_rls.sql`

**To apply it:**

1. Go to **Supabase Dashboard** → https://supabase.com/dashboard/project/beswluhdxaphtitaovly
2. Click **SQL Editor** → **New Query**
3. Copy/paste the contents of `0003_hierarchical_tenant_rls.sql`
4. Click **Run**

This will:
- ✅ Create helper functions for tenant access control
- ✅ Add RLS policies for all core tables (customers, orders, payments, drivers, staff, etc.)
- ✅ Enable hierarchical access (parent `glenkeos` tenant sees all brands)
- ✅ Enable owner-based access (customers see only their data)

---

## ✅ Step 2: Configure JWT Metadata

Your RLS policies read from **JWT app_metadata**. You need to add this metadata when users sign up or sign in.

### For Customer Users (Public App)

When a customer signs up via Supabase Auth:

```typescript
// Example: Customer signup for Chic-on-Chain brand
const { data, error } = await supabase.auth.signUp({
  email: 'customer@example.com',
  password: 'secure-password',
  options: {
    data: {
      app_metadata: {
        tenant_id: 'chic-on-chain',        // Primary brand
        tenant_access: ['chic-on-chain'],  // Can access this brand only
        role: 'customer'
      }
    }
  }
});
```

**Brand Mapping:**
- `chic-on-chain` - Premium restaurant (B1)
- `ghetto-eats` - Fast delivery (B2)
- `goldkey` - Ultra-luxury (B3)

### For Staff/Driver Users

When staff or drivers are added:

```typescript
// Example: Driver for Ghetto Eats
const { data, error } = await supabase.auth.admin.createUser({
  email: 'driver@glenkeos.com',
  password: 'secure-password',
  user_metadata: {},
  app_metadata: {
    tenant_id: 'ghetto-eats',
    tenant_access: ['ghetto-eats'],
    role: 'driver'
  }
});
```

### For Corporate Admin Users

Corporate users need access to ALL brands:

```typescript
// Example: COC Command Center admin
const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@glenkeos.internal',
  password: 'secure-password',
  user_metadata: {},
  app_metadata: {
    tenant_id: 'glenkeos',           // Parent tenant
    tenant_access: ['glenkeos'],     // Corporate access = sees all brands
    role: 'admin'
  }
});
```

---

## ✅ Step 3: Update Existing Users (Migration Script)

If you have existing users in Supabase Auth, update their metadata:

```sql
-- Run in Supabase SQL Editor

-- Update all existing customers to default tenant (adjust as needed)
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{tenant_id}',
  '"chic-on-chain"'
)
WHERE raw_app_meta_data->>'role' = 'customer'
OR raw_app_meta_data IS NULL;

-- Add tenant_access array
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  raw_app_meta_data,
  '{tenant_access}',
  '["chic-on-chain"]'::jsonb
)
WHERE raw_app_meta_data->>'tenant_id' = 'chic-on-chain';

-- Set corporate admin users
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{tenant_id}',
    '"glenkeos"'
  ),
  '{tenant_access}',
  '["glenkeos"]'::jsonb
)
WHERE email LIKE '%@glenkeos.internal';
```

---

## ✅ Step 4: Verify RLS is Working

Test access control with different user types:

### Test 1: Customer Access (Own Data Only)

```typescript
// Login as customer
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'customer@example.com',
  password: 'password'
});

// Should see only their own orders
const { data: orders } = await supabase
  .from('orders')
  .select('*');
// ✅ Returns: only orders where customer_id = user.id

// Should NOT see other customers' orders
const { data: otherOrders } = await supabase
  .from('orders')
  .select('*')
  .eq('customer_id', 'some-other-customer-id');
// ✅ Returns: [] (empty, blocked by RLS)
```

### Test 2: Brand Staff Access (Tenant-Scoped)

```typescript
// Login as Chic-on-Chain staff
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'staff@chic-on-chain.com',
  password: 'password'
});

// Should see all orders for their brand
const { data: orders } = await supabase
  .from('orders')
  .select('*');
// ✅ Returns: all orders where tenant_id = 'chic-on-chain'

// Should NOT see other brands' orders
const { data: otherBrandOrders } = await supabase
  .from('orders')
  .select('*')
  .eq('tenant_id', 'ghetto-eats');
// ✅ Returns: [] (empty, different tenant)
```

### Test 3: Corporate Admin Access (All Brands)

```typescript
// Login as GlenKeos corporate admin
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'admin@glenkeos.internal',
  password: 'password'
});

// Should see ALL orders across ALL brands
const { data: allOrders } = await supabase
  .from('orders')
  .select('*');
// ✅ Returns: orders from chic-on-chain, ghetto-eats, goldkey (all tenants)
```

---

## ✅ Step 5: Anonymous Access Validation

The RLS policies now block all anonymous (non-authenticated) access:

```typescript
// Without authentication
const { data, error } = await supabase
  .from('customers')
  .select('*');

// ✅ Returns: error (RLS denies anonymous access)
// ✅ Or returns: [] (empty array, no rows pass RLS check)
```

---

## 🎯 What's Protected Now

| Table | Customer Access | Brand Staff Access | Corporate Access |
|-------|----------------|-------------------|------------------|
| `customers` | Own record only | ❌ No access | ✅ All customers |
| `customer_addresses` | Own addresses | ❌ No access | ✅ All addresses |
| `orders` | Own orders | ✅ Tenant's orders | ✅ All orders |
| `order_items` | Via own orders | ✅ Tenant's items | ✅ All items |
| `payments` | Own payments | ✅ Tenant's payments | ✅ All payments |
| `drivers` | ❌ No access | ✅ Tenant's drivers | ✅ All drivers |
| `driver_locations` | ❌ No access | ✅ Tenant's locations | ✅ All locations |
| `staff` | ❌ No access | ✅ Tenant's staff | ✅ All staff |
| `shifts` | ❌ No access | ✅ Tenant's shifts | ✅ All shifts |
| `loyalty_accounts` | Own account | ❌ No access | ✅ All accounts |
| `loyalty_transactions` | Own transactions | ❌ No access | ✅ All transactions |
| `notifications` | Own notifications | ✅ Tenant's notifications | ✅ All notifications |
| `security_events` | ❌ No access | ❌ No access | ✅ Corporate only |
| `stores` | ✅ Browse all | ✅ Tenant's stores | ✅ All stores |
| `menu_items` | ✅ Browse all | ✅ Browse all | ✅ Full CRUD |

---

## 🚀 Next Steps

1. **Run the SQL migration** in Supabase Dashboard
2. **Update your signup/login flows** to include `app_metadata` with tenant info
3. **Test with different user roles** (customer, staff, driver, admin)
4. **Verify anonymous access is blocked** on sensitive tables
5. **Proceed with your final deployment** (2 SQL scripts + 3 PayPal secrets)

---

## 📝 Notes

- **JWT app_metadata** is automatically included in `auth.jwt()` and cached per session
- **Tenant changes** require users to log out/in to refresh JWT
- **Corporate users** (`tenant_id = 'glenkeos'`) have read/write access to all brands
- **Customers** can browse stores/menu across all brands, but can only order from their assigned brand
- **RLS is enforced** even when using service role key in Edge Functions (use `supabase.auth.setSession()` to impersonate users)

---

## 🔒 Security Checklist

- [x] RLS enabled on all customer/operational tables
- [x] Owner-based policies for customer data (customers, addresses, loyalty)
- [x] Tenant-based policies for operational data (orders, payments, drivers, staff)
- [x] Corporate override for parent tenant (`glenkeos`)
- [x] Anonymous access blocked by default (requires `TO authenticated`)
- [x] Helper functions for tenant resolution (`auth.user_tenant_id()`, `auth.has_corporate_access()`)
- [ ] JWT metadata configured for all user types
- [ ] Tested access control with real users
- [ ] Ready for production deployment

**Status: 99% → 100% after JWT metadata setup** 🎉
