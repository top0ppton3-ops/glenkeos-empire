# 🚀 Supabase DB Push - Deploy RLS Policies Now

## ✅ What You Have

Your local repository now has:
- ✅ `/supabase/config.toml` - Supabase CLI configuration
- ✅ `/supabase/migrations/0001_complete_schema.sql` - Full database schema
- ✅ `/supabase/migrations/0002_payments_loyalty_tracking.sql` - Payments & loyalty tables
- ✅ `/supabase/migrations/0003_hierarchical_tenant_rls.sql` - **NEW: Fortune 500 RLS policies**

## ⚠️ Current Database State

Your Supabase database currently has:
- ✅ Only `20260421214451_create_kv_table` migration applied
- ❌ NO hierarchical tenant RLS policies
- ❌ NO helper functions (`auth.user_tenant_id()`, etc.)
- ⚠️ Still using default `_authenticated_deny_all` policies

---

## 🎯 Option 1: Manual SQL Editor (RECOMMENDED - Fastest)

**Why:** The Supabase CLI `db push` is designed for local → remote sync, but your migrations 0001 and 0002 were likely manually applied before. To avoid conflicts, manually apply just the NEW 0003 migration.

### Steps:

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/beswluhdxaphtitaovly/sql/new

2. **Copy the entire contents of `/supabase/migrations/0003_hierarchical_tenant_rls.sql`**
   (694 lines - the file is ready in your project)

3. **Paste into SQL Editor and click RUN**

4. **Verify success:**
   ```sql
   -- Check helper functions were created
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'auth' 
   AND routine_name IN ('user_tenant_id', 'has_corporate_access', 'customer_id');
   
   -- Should return 3 rows
   ```

5. **Done!** ✅ Your RLS policies are now live.

---

## 🎯 Option 2: Supabase CLI (If You Have It Set Up)

### Prerequisites Check:

```bash
# Check if Supabase CLI is installed
supabase --version

# Should show: supabase 1.x.x or higher
```

If not installed:
```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop install supabase

# Or via npm
npm install -g supabase
```

### Link Your Project:

```bash
# Authenticate with Supabase
supabase login

# Link to your live project
supabase link --project-ref beswluhdxaphtitaovly

# Enter your database password when prompted
```

### ⚠️ BEFORE YOU PUSH: Check Migration State

```bash
# See what migrations CLI thinks need to be applied
supabase db diff --linked
```

**Expected behavior:**
- If CLI shows 0001, 0002, 0003 as "pending", it means those migrations aren't tracked in `supabase_migrations.schema_migrations` table
- Since 0001 and 0002 were likely manually applied, you'll need to handle this carefully

### Option 2A: Push Only 0003 (Safest)

```bash
# Temporarily move 0001 and 0002 out of migrations folder
mv /supabase/migrations/0001_complete_schema.sql /tmp/
mv /supabase/migrations/0002_payments_loyalty_tracking.sql /tmp/

# Now push only 0003
supabase db push

# Move them back
mv /tmp/0001_complete_schema.sql /supabase/migrations/
mv /tmp/0002_payments_loyalty_tracking.sql /supabase/migrations/
```

### Option 2B: Push All (If Fresh Database)

```bash
# Only do this if you're SURE 0001 and 0002 weren't manually applied
supabase db push
```

**⚠️ WARNING:** This will attempt to run all 3 migrations. If 0001/0002 were already manually applied, you'll get duplicate object errors (which are mostly harmless but messy).

---

## 🎯 Option 3: Advanced - Mark Migrations as Applied

If you manually applied 0001 and 0002 earlier, tell Supabase CLI they're already done:

```bash
# Connect to your database via psql or Supabase SQL Editor
# Run this to mark migrations as applied:

INSERT INTO supabase_migrations.schema_migrations (version, statements, name)
VALUES 
  ('0001', ARRAY['-- Manually applied'], '0001_complete_schema'),
  ('0002', ARRAY['-- Manually applied'], '0002_payments_loyalty_tracking');

# Now push 0003 only
supabase db push
```

---

## 🔍 Post-Deployment Verification

After applying the migration (any option above), verify it worked:

### 1. Check Helper Functions Exist

```sql
SELECT 
  routine_name,
  routine_type,
  routine_schema
FROM information_schema.routines
WHERE routine_schema = 'auth'
AND routine_name IN ('user_tenant_id', 'has_corporate_access', 'customer_id');
```

**Expected:** 3 rows (all 3 functions)

### 2. Check RLS Policies Were Created

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected:** ~60+ policies across tables like:
- `customers_select`, `customers_insert`, etc.
- `orders_select`, `orders_insert`, etc.
- `drivers_select`, `drivers_insert`, etc.

### 3. Test Corporate Access Function

```sql
-- This should return 'public' (default) since you're not authenticated via JWT
SELECT auth.user_tenant_id();

-- This should return false
SELECT auth.has_corporate_access();
```

### 4. Check Old Policies Were Removed

```sql
-- This should return NO rows (old policies were dropped)
SELECT policyname 
FROM pg_policies 
WHERE policyname LIKE '%_authenticated_deny_all%';
```

---

## ✅ Success Checklist

- [ ] Migration 0003 applied without errors
- [ ] 3 helper functions exist in `auth` schema
- [ ] 60+ RLS policies created across core tables
- [ ] Old `_authenticated_deny_all` policies removed
- [ ] `auth.user_tenant_id()` function callable
- [ ] Ready to configure JWT metadata for users

---

## 🚨 Troubleshooting

### Error: "relation already exists"

**Cause:** You're trying to re-run 0001 or 0002 that were already manually applied.

**Fix:** Use **Option 1** (manual SQL editor) to apply ONLY 0003, OR mark 0001/0002 as applied in `supabase_migrations.schema_migrations`.

### Error: "function auth.user_tenant_id() already exists"

**Cause:** You already ran 0003 before.

**Fix:** No action needed! Your policies are already in place. Verify with the verification queries above.

### Error: "permission denied for schema auth"

**Cause:** You're not using the service role or postgres user.

**Fix:** 
- In SQL Editor, make sure you're using the default connection (service role)
- Via CLI, ensure you linked correctly: `supabase link --project-ref beswluhdxaphtitaovly`

### Error: "cannot create function in schema auth"

**Cause:** Supabase has restrictions on some auth schema modifications.

**Fix:** The functions in 0003 are designed to work - if you see this error, contact me. It's likely a permission issue.

---

## 📊 What Happens Next (After RLS Applied)

1. ✅ **RLS policies are live** - all tables now enforce hierarchical tenant access
2. ⚠️ **Users need JWT metadata** - you must add `app_metadata.tenant_id` and `app_metadata.tenant_access` to user JWTs
3. 🔧 **Update signup/login flows** - see `/TENANT_JWT_SETUP_GUIDE.md` for how to set JWT metadata

**Without JWT metadata configured:**
- Customers won't see their own data (because `auth.customer_id()` returns null)
- Staff won't see tenant data (because `auth.user_tenant_id()` returns 'public')
- Corporate access won't work (because `auth.has_corporate_access()` returns false)

**To fix:** Add JWT metadata during user creation (see guide).

---

## 🎯 Recommended Path Forward

**For you RIGHT NOW:**

1. ✅ **Use Option 1** (Manual SQL Editor) - paste 0003 contents and run
2. ✅ **Verify with post-deployment queries** above
3. ✅ **Move to JWT setup** - configure user metadata (see `/TENANT_JWT_SETUP_GUIDE.md`)
4. ✅ **Test with real users** - create test customer/staff/admin users with proper metadata
5. ✅ **Deploy final secrets** - add 2 SQL scripts + 3 PayPal secrets you mentioned

---

## 💡 Quick Command Reference

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link project
supabase link --project-ref beswluhdxaphtitaovly

# Check migration status
supabase db diff --linked

# Push migrations
supabase db push

# Pull remote schema (to see what's currently in database)
supabase db pull

# Reset local database (DANGER - local dev only)
supabase db reset
```

---

## 🎉 You're Almost There!

Your Fortune 500 multi-tenant RLS architecture is ONE PASTE AWAY from being live. After that, just JWT metadata configuration and you're ready for production! 🚀

---

**Choose your path and let me know which option you want to use!**
