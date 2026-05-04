# 🚨 MIGRATION NAMING FIX - Action Required

## 🔍 **Problem Identified**

Your migration files are named incorrectly for Supabase CLI:

```
❌ 0001_complete_schema.sql
❌ 0002_payments_loyalty_tracking.sql  
❌ 0003_hierarchical_tenant_rls.sql
✅ 20260422150000_complete_schema.sql (this one is correct!)
```

**Supabase CLI expects:** `YYYYMMDDHHMMSS_description.sql`

---

## ✅ **Solution: Rename Files**

### Option A: Manual Rename (Simplest)

On your local machine, rename these files:

```bash
# Navigate to your project
cd /path/to/your/project

# Rename migrations to timestamp format
mv supabase/migrations/0001_complete_schema.sql \
   supabase/migrations/20260421000000_complete_schema.sql

mv supabase/migrations/0002_payments_loyalty_tracking.sql \
   supabase/migrations/20260421120000_payments_loyalty_tracking.sql

mv supabase/migrations/0003_hierarchical_tenant_rls.sql \
   supabase/migrations/20260422180000_hierarchical_tenant_rls.sql
```

**Timestamp Logic:**
- `20260421000000` = April 21, 2026 00:00:00 (schema base)
- `20260421120000` = April 21, 2026 12:00:00 (payments added later)
- `20260422180000` = April 22, 2026 18:00:00 (RLS policies - newest)

---

### Option B: Use Supabase CLI to Generate Proper Migration

Instead of renaming, create a NEW migration with proper timestamp:

```bash
# This creates a timestamped migration file
supabase migration new hierarchical_tenant_rls

# Then copy the contents of 0003_hierarchical_tenant_rls.sql into the new file
```

---

## 🎯 **Recommended Path Forward**

Since your database only shows `20260421214451_create_kv_table` was applied:

### Step 1: Check What DB Thinks Is Applied

Run in Supabase SQL Editor:
```sql
SELECT version, name
FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

**Expected output:**
```
version              | name
---------------------|------------------------
20260421214451       | create_kv_table_89a553ba
```

### Step 2: Decide on Strategy

**Strategy A: Skip Old Migrations, Apply Only RLS (FASTEST)**

If your database already has the tables from 0001 and 0002 (manually applied), then:

1. **Ignore** `0001_complete_schema.sql` and `0002_payments_loyalty_tracking.sql`
2. **Rename only** `0003` to proper timestamp:
   ```bash
   mv supabase/migrations/0003_hierarchical_tenant_rls.sql \
      supabase/migrations/20260422180000_hierarchical_tenant_rls.sql
   ```
3. Run:
   ```bash
   supabase db push
   ```

**Strategy B: Apply All From Scratch (RISKY - May Cause Errors)**

If you want CLI to track all migrations:

1. Rename ALL files to timestamp format (see Option A above)
2. Run `supabase db push`
3. **WARNING:** This will try to re-create tables that already exist, causing errors. Only do this if you're 100% sure the tables don't exist yet.

**Strategy C: Manual SQL for RLS Only (SAFEST)**

1. Don't rename anything
2. Go to Supabase SQL Editor
3. Copy/paste contents of `0003_hierarchical_tenant_rls.sql`
4. Click RUN
5. ✅ Done - RLS policies applied, no migration tracking conflicts

---

## 📋 **What I Recommend RIGHT NOW**

Use **Strategy C** (Manual SQL):

1. **Open:** https://supabase.com/dashboard/project/beswluhdxaphtitaovly/sql/new

2. **Copy:** Entire contents of `/supabase/migrations/0003_hierarchical_tenant_rls.sql` (694 lines)

3. **Paste** into SQL Editor

4. **Click** RUN

5. **Verify:**
   ```sql
   -- Check helper functions exist
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'auth' 
   AND routine_name IN ('user_tenant_id', 'has_corporate_access', 'customer_id');
   
   -- Should return 3 rows
   ```

6. **Celebrate** 🎉 Your RLS policies are live!

---

## 🔧 **If You Want Clean CLI Tracking Later**

After manually applying RLS, you can "mark it as applied" for CLI tracking:

```sql
-- Run in Supabase SQL Editor
INSERT INTO supabase_migrations.schema_migrations (version, statements, name)
VALUES ('20260422180000', ARRAY['-- Applied manually via SQL Editor'], 'hierarchical_tenant_rls');
```

Then rename the local file:
```bash
mv supabase/migrations/0003_hierarchical_tenant_rls.sql \
   supabase/migrations/20260422180000_hierarchical_tenant_rls.sql
```

Now `supabase migration list` will show it as applied ✅

---

## 🎯 **Summary: What to Do Next**

**Fastest path to live RLS policies:**

1. ✅ **Manual SQL Editor** - paste 0003 contents, click RUN (2 minutes)
2. ✅ **Verify** - run verification queries above
3. ✅ **Move on** - configure JWT metadata (see `/TENANT_JWT_SETUP_GUIDE.md`)

**Cleanest path for future:**

1. ✅ Rename `0003` to `20260422180000_hierarchical_tenant_rls.sql`
2. ✅ Run `supabase db push`
3. ✅ All future migrations will be properly tracked

---

## 📞 **Tell Me:**

Which strategy do you want to use?
- **"Manual SQL"** - I'll guide you through copy/paste
- **"Rename and push"** - I'll give you exact commands
- **"Something else"** - Tell me what you're thinking

Choose your path! 🚀
