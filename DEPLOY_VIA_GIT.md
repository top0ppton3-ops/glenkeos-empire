# 🚀 Deploy RLS via Git Push to Supabase

## **Method: Git → GitHub → Supabase Auto-Deploy**

This is the **production-grade approach** for deploying migrations!

---

## 📋 **Prerequisites**

- ✅ GitHub repository for GlenKeos
- ✅ Supabase project: `beswluhdxaphtitaovly`
- ✅ Migration file ready: `20260422180000_hierarchical_tenant_rls.sql`

---

## 🎯 **Step 1: Commit Migration to Git**

```bash
# Check status
git status

# Add migration files
git add supabase/migrations/20260422180000_hierarchical_tenant_rls.sql
git add supabase/config.toml
git add DEPLOY_*.md
git add RLS_DEPLOYMENT_READY.md

# Commit
git commit -m "feat: Add hierarchical multi-tenant RLS policies

- Create auth helper functions (user_tenant_id, has_corporate_access, customer_id)
- Implement 60+ RLS policies across 15 tables
- Enable hierarchical tenant isolation (glenkeos parent → brand children)
- Owner-based policies for customers
- Tenant-based policies for staff/drivers
- Corporate override for glenkeos parent tenant
- Production-ready Fortune 500 security architecture"

# Push to GitHub
git push origin main
```

---

## 🔗 **Step 2: Connect Supabase to GitHub** (One-Time Setup)

### Option A: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/beswluhdxaphtitaovly

2. **Navigate to:**
   Settings → Integrations → GitHub

3. **Click "Connect to GitHub"**

4. **Authorize Supabase** to access your GitHub account

5. **Select Repository:**
   Choose your GlenKeos repository

6. **Configure Branch:**
   - Production branch: `main` (or `master`)
   - Enable: "Auto-deploy migrations on push"

7. **Click "Connect"**

### Option B: Via Supabase CLI

```bash
# Link GitHub repo
supabase link --project-ref beswluhdxaphtitaovly

# Enable GitHub integration
supabase db remote set --branch main

# Verify
supabase projects list
```

---

## 🚀 **Step 3: Push to Trigger Auto-Deploy**

Once connected, every push to `main` automatically deploys migrations!

```bash
# Any future push will auto-deploy
git push origin main
```

**Supabase will:**
1. ✅ Detect new migration files
2. ✅ Run them in timestamp order
3. ✅ Apply changes to production database
4. ✅ Send deployment notification

---

## 📊 **Step 4: Monitor Deployment**

### Check Deployment Status

**Via Dashboard:**
1. Go to: https://supabase.com/dashboard/project/beswluhdxaphtitaovly
2. Navigate to: Database → Migrations
3. See: Migration history and status

**Via CLI:**
```bash
supabase migration list --linked
```

**Expected Output:**
```
20260422180000_hierarchical_tenant_rls.sql  [APPLIED]
```

---

## ✅ **Verify RLS Deployment**

### 1. Check in Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/beswluhdxaphtitaovly/sql/new

```sql
-- Check helper functions created
SELECT 
  routine_schema,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'auth'
AND routine_name IN ('user_tenant_id', 'has_corporate_access', 'customer_id');
```
**Expected:** 3 rows

```sql
-- Count RLS policies
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
```
**Expected:** ~15 tables with 4 policies each (60+ total)

```sql
-- Test helper functions
SELECT auth.user_tenant_id() as tenant_id;
SELECT auth.has_corporate_access() as has_access;
```
**Expected:** Returns defaults ('public', false)

---

## 🔄 **GitHub Actions (Optional - Advanced)**

For even more control, create a GitHub Actions workflow:

```yaml
# .github/workflows/deploy-supabase.yml
name: Deploy to Supabase

on:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Link to Supabase
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
      
      - name: Push migrations
        run: supabase db push
        
      - name: Notify deployment
        run: echo "✅ RLS policies deployed successfully!"
```

**Secrets to add in GitHub:**
- `SUPABASE_PROJECT_REF`: `beswluhdxaphtitaovly`
- `SUPABASE_ACCESS_TOKEN`: From Supabase settings
- `SUPABASE_DB_PASSWORD`: Your database password

---

## 🎯 **Workflow Summary**

```
Local Changes
    ↓
git add supabase/migrations/*.sql
    ↓
git commit -m "migration: description"
    ↓
git push origin main
    ↓
GitHub receives push
    ↓
Supabase detects new migrations
    ↓
Auto-applies to database
    ↓
✅ DEPLOYED!
```

---

## 🚨 **Troubleshooting**

### "GitHub integration not found"
→ Complete Step 2 (Connect Supabase to GitHub) first

### "No migrations detected"
→ Ensure files are in `supabase/migrations/` folder
→ Check filename format: `YYYYMMDDHHMMSS_description.sql`

### "Migration already applied"
→ Good! Your RLS is already deployed ✅

### "Permission denied"
→ Check GitHub repo access in Supabase settings
→ Re-authorize GitHub integration

---

## 📝 **Best Practices**

✅ **DO:**
- Commit migrations to version control
- Use descriptive commit messages
- Test migrations locally first
- Review migration before pushing
- Keep migrations immutable (never edit applied ones)

❌ **DON'T:**
- Edit already-applied migrations
- Delete migration files
- Rename applied migrations
- Skip migration testing

---

## 🎉 **What Happens After Push?**

1. **GitHub** receives your push
2. **Supabase** detects new migration files
3. **Database** applies migrations in order
4. **Policies** become active immediately
5. **Users** are protected by RLS

**Timeline:** ~30 seconds from push to live

---

## 📞 **Quick Commands**

```bash
# Commit and push migration
git add supabase/migrations/20260422180000_hierarchical_tenant_rls.sql
git commit -m "feat: Deploy hierarchical multi-tenant RLS"
git push origin main

# Check deployment status
supabase migration list --linked

# Verify in SQL Editor
# → Open Supabase Dashboard → SQL → Run verification queries
```

---

## ✅ **Success Criteria**

After push, you should see:

- ✅ Green checkmark in GitHub commit
- ✅ Migration marked as APPLIED in Supabase
- ✅ 3 helper functions in `auth` schema
- ✅ 60+ RLS policies on public tables
- ✅ No errors in Supabase logs

---

**Ready to push? Run the commands and let me know the result!** 🚀
