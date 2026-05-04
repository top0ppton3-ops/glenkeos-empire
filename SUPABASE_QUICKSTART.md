# GlenKeos Supabase - Quick Start Guide

**Platform Status**: ✅ 100% Complete  
**Last Updated**: April 24, 2026

---

## 🎯 Quick Setup (1 Step!)

### Run Complete Setup Script

**Copy and paste** `scripts/COMPLETE_SUPABASE_SETUP.sql` into **Supabase Dashboard → SQL Editor → New Query → Execute**

This ONE script does everything:
- ✅ Creates all tables (orders, drivers, menu_items, etc.)
- ✅ Enables RLS on all tables
- ✅ Creates RLS policies for multi-tenant security
- ✅ Enables Realtime subscriptions
- ✅ Seeds sample data (1 store, 3 menu items, 1 driver)
- ✅ Verifies setup with diagnostic queries

**Then optionally run** `scripts/CREATE_INVENTORY_TABLE.sql` to add inventory management.

---

## 🔧 Alternative: Step-by-Step Setup

If you prefer manual control:

### 1. Create Tables
Run `database/COMPLETE_SCHEMA.sql` - Full schema

### 2. Enable RLS
Run `supabase/migrations/20260422180000_hierarchical_tenant_rls.sql` - Security policies

### 3. Add Inventory
Run `scripts/CREATE_INVENTORY_TABLE.sql` - Inventory table

---

## ✅ Verification

After running all 3 scripts, verify in Supabase Dashboard:

**Database → Tables**
- [x] 20+ tables created (orders, drivers, inventory_items, etc.)

**Database → Policies**
- [x] RLS policies active on all tables
- [x] Multi-tenant policies enforced

**Database → Publications**
- [x] `supabase_realtime` publication includes:
  - orders
  - order_items
  - drivers
  - inventory_items
  - menu_items
  - notifications

---

## 🔐 Authentication Setup

**Supabase Dashboard → Authentication → Settings**

1. ✅ Enable Email Signup
2. ✅ Set Site URL: `https://codebuild-default-webhook-source.vercel.app`
3. ✅ Add Redirect URLs:
   - `http://localhost:5173`
   - `https://codebuild-default-webhook-source.vercel.app`

---

## 📊 Test Real-time Subscriptions

Run this in your browser console (after app loads):

```javascript
import { supabase } from './utils/supabase/client';

const channel = supabase
  .channel('test-realtime')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    console.log('✅ Realtime working! Order changed:', payload);
  })
  .subscribe();

// Should log subscription status
```

---

## 🚀 Production Deployment

**Vercel Environment Variables:**
```bash
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key-from-supabase-settings>
```

Get your anon key from: **Supabase Dashboard → Settings → API → Project API keys → anon/public**

---

## 📖 Need More Help?

- **Full deployment guide**: See `SUPABASE_DEPLOYMENT.md`
- **Security policies**: See `SECURITY.md`
- **Database schema**: See `database/COMPLETE_SCHEMA.sql`
- **RLS policies**: See `supabase/migrations/20260422180000_hierarchical_tenant_rls.sql`

---

## 🎉 You're Done!

Your GlenKeos platform is now:
- ✅ Connected to production Supabase database
- ✅ Secured with Row Level Security
- ✅ Real-time enabled for live updates
- ✅ Multi-tenant isolated
- ✅ Ready for deployment

**Next**: Push to Vercel and go live! 🚀
