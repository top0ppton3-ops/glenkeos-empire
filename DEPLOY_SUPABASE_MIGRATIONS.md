# 🚀 DEPLOY SUPABASE MIGRATIONS

## 📍 Backend: https://beswluhdxaphtitaovly.supabase.co

---

## ✅ CRITICAL RLS POLICY DEPLOYMENT

### Step 1: Open Supabase SQL Editor
👉 https://supabase.com/dashboard/project/beswluhdxaphtitaovly/sql/new

### Step 2: Copy Migration SQL
**File:** `/PASTE_INTO_SUPABASE_SQL_EDITOR.sql`

This contains your **694-line hierarchical tenant RLS policy** ✅

### Step 3: Paste & Execute
1. Copy ALL contents from the file
2. Paste into SQL Editor
3. Click **RUN**
4. Wait for "Success" message

---

## 📋 WHAT THIS DEPLOYS

✅ **Multi-tenant RLS Policies**
- Corporate-level isolation
- Brand-level isolation  
- Store-level isolation
- Employee hierarchical access

✅ **Security Functions**
- JWT token validation
- Role-based access control
- Tenant boundary enforcement

✅ **Database Schema**
- All tables with proper constraints
- Indexes for performance
- Foreign key relationships

✅ **Edge Function Permissions**
- Service role access
- API endpoint security
- Webhook authentication

---

## 🔧 VERIFY DEPLOYMENT

After running the migration:

### 1. Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 2. Check RLS Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Test Authentication
- Try corporate login
- Verify JWT contains tenant_id
- Check brand access isolation

---

## 🎯 REQUIRED FOR PRODUCTION

**Before your site works properly:**
- [ ] Deploy RLS migration (this file)
- [ ] Test corporate login
- [ ] Test brand isolation
- [ ] Verify Edge Functions respond
- [ ] Check PayPal webhook

---

## 🚀 DEPLOY NOW

**👉 https://supabase.com/dashboard/project/beswluhdxaphtitaovly/sql/new**

**Then:**
1. Open `/PASTE_INTO_SUPABASE_SQL_EDITOR.sql`
2. Copy ALL (694 lines)
3. Paste into SQL Editor
4. Click **RUN**
5. Wait for success ✅

---

## ✅ AFTER SUCCESSFUL DEPLOYMENT

You'll have:
- ✅ Full multi-tenant security
- ✅ Hierarchical access control
- ✅ Corporate → Brand → Store isolation
- ✅ JWT-based authentication
- ✅ Production-ready database

---

**DO THIS FIRST BEFORE TESTING YOUR SITE!** 🎯
