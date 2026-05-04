# 🚀 Deploy RLS Policies NOW - Quick Commands

## ✅ What Just Happened

Migration files have been **renamed to proper timestamp format**:

```
✅ /supabase/migrations/20260422180000_hierarchical_tenant_rls.sql  (694 lines)
❌ Deleted: 0001, 0002, 0003 (old incorrectly named files)
```

---

## 🎯 Deploy in 3 Commands

```bash
# 1. Login to Supabase
supabase login

# 2. Link to your project
supabase link --project-ref beswluhdxaphtitaovly

# 3. Push the migration
supabase db push
```

**That's it!** ✅ Your RLS policies will be live.

---

## 📋 What Gets Deployed

The migration will:

1. **Create 3 Helper Functions** in `auth` schema:
   - `auth.user_tenant_id()` - extracts tenant from JWT
   - `auth.has_corporate_access()` - checks for parent tenant access
   - `auth.customer_id()` - maps auth user to customer record

2. **Drop Old Basic Policies** (if any exist):
   - Removes placeholder/basic RLS policies

3. **Create 60+ Hierarchical Policies** across:
   - ✅ customers (owner-based)
   - ✅ customer_addresses (owner-based)
   - ✅ orders (hybrid: customer + tenant)
   - ✅ order_items (linked to orders)
   - ✅ payments (customer + tenant)
   - ✅ drivers (tenant + self-access)
   - ✅ driver_locations (tenant-scoped)
   - ✅ staff (tenant + self-access)
   - ✅ shifts (tenant-scoped via staff)
   - ✅ loyalty_accounts (owner-based)
   - ✅ loyalty_transactions (owner-based)
   - ✅ notifications (customer + order linkage)
   - ✅ security_events (corporate-only)
   - ✅ stores (tenant-scoped, read for customers)
   - ✅ menu_items (public read, corporate write)

---

## ⚡ Alternative: Manual SQL (If CLI Issues)

If you don't have Supabase CLI or prefer manual:

1. Go to: https://supabase.com/dashboard/project/beswluhdxaphtitaovly/sql/new

2. Copy **entire contents** of:
   `/supabase/migrations/20260422180000_hierarchical_tenant_rls.sql`

3. Paste into SQL Editor

4. Click **RUN**

5. ✅ Done!

---

## 🔍 Verify Deployment

After deployment, run these in SQL Editor:

### 1. Check Helper Functions

```sql
SELECT 
  routine_name,
  routine_type,
  routine_schema
FROM information_schema.routines
WHERE routine_schema = 'auth'
AND routine_name IN ('user_tenant_id', 'has_corporate_access', 'customer_id');
```

**Expected:** 3 rows

### 2. Count RLS Policies

```sql
SELECT 
  COUNT(*) as total_policies,
  COUNT(DISTINCT tablename) as tables_with_policies
FROM pg_policies
WHERE schemaname = 'public';
```

**Expected:** ~60+ policies across ~15 tables

### 3. Test Functions

```sql
-- These should work (return default values when not authenticated via JWT)
SELECT auth.user_tenant_id();        -- Returns 'public' by default
SELECT auth.has_corporate_access();  -- Returns false by default
```

### 4. Check Specific Table Policies

```sql
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'orders'
ORDER BY policyname;
```

**Expected:** 4 policies (select, insert, update, delete)

---

## 📊 Migration Timeline

```
Before:  Only 20260421214451_create_kv_table applied
         No RLS policies on core tables
         No tenant helper functions

After:   20260422180000_hierarchical_tenant_rls applied ✅
         3 auth helper functions created ✅
         60+ RLS policies active ✅
         Fortune 500 multi-tenant security LIVE ✅
```

---

## 🎯 Next Steps After Deployment

### 1. Configure User JWT Metadata

Every authenticated user needs these JWT claims:

```json
{
  "app_metadata": {
    "tenant_id": "chic-on-chain",           // or "ghetto-eats", "goldkey", "glenkeos"
    "tenant_access": ["chic-on-chain"],     // array of accessible tenants
    "role": "customer"                      // or "staff", "admin", "driver"
  }
}
```

**How to add:** See `/TENANT_JWT_SETUP_GUIDE.md`

### 2. Deploy PayPal Secrets

Add these 3 environment variables to Supabase Edge Functions:

```bash
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_secret_here
PAYPAL_MODE=sandbox  # or 'live' for production
```

**How:** Supabase Dashboard → Edge Functions → Settings → Secrets

### 3. Run Final 2 SQL Scripts

You mentioned 2 more SQL scripts - deploy those next!

---

## 🚨 Troubleshooting

### Error: "function auth.user_tenant_id() already exists"

**Cause:** Migration was already run.

**Fix:** No action needed - your policies are already in place!

### Error: "policy already exists"

**Cause:** Partial migration was applied before.

**Fix:** 
```sql
-- Drop all policies and re-run migration
DROP POLICY IF EXISTS customers_select ON public.customers;
-- ... (repeat for other policies)
-- Then re-run full migration
```

### Error: "permission denied for schema auth"

**Cause:** Not using service role.

**Fix:** In SQL Editor, make sure you're using default connection (service role).

### CLI Error: "project not linked"

**Fix:**
```bash
supabase link --project-ref beswluhdxaphtitaovly
# Enter database password when prompted
```

---

## ✅ Success Criteria

You'll know it worked when:

- [ ] No errors in migration output
- [ ] 3 helper functions exist in `auth` schema
- [ ] 60+ RLS policies created
- [ ] `supabase migration list --linked` shows 20260422180000 as applied
- [ ] Test queries above return expected results

---

## 🎉 Ready to Deploy?

Choose your path:

**Fast (CLI):**
```bash
supabase login && supabase link --project-ref beswluhdxaphtitaovly && supabase db push
```

**Safe (Manual):**
Open SQL Editor → Copy migration file → Paste → Run

---

**You're one command away from Fortune 500 multi-tenant security!** 🚀
