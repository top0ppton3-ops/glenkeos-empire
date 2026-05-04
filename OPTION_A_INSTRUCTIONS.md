# OPTION A: DROP & REBUILD — FAST RESET

**Time**: 2-5 minutes  
**Data Loss**: ✅ ALL DATA DESTROYED  
**Use When**: Dev/test only, no production data

---

## ⚠️ WARNING

**This destroys ALL data in your database.**

Only proceed if:
- ✅ This is a dev/test environment
- ✅ You have no production data
- ✅ You're okay losing everything

---

## 🚀 EXECUTE OPTION A (2 Steps)

### STEP 1: Drop Everything (30 seconds)

1. Open Supabase SQL Editor:  
   https://supabase.com/dashboard/project/beswluhdxaphtitaovly/sql/new

2. Open this file in GitHub:  
   https://github.com/top0ppton3-ops/glenkeos-empire/blob/master/OPTION_A_RESET.sql

3. Copy entire SQL file

4. Paste into Supabase SQL editor

5. Click **Run**

6. Wait for: `✅ All tables, types, and functions dropped`

---

### STEP 2: Rebuild from Migrations (1-2 minutes)

After Step 1 completes, run each migration **in order**:

#### Migration 1: Extensions
```sql
-- Copy from: supabase/migrations/20260504010000_enable_extensions.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "http";
```

#### Migration 2: Base Schema
```sql
-- Copy from: supabase/migrations/20260504020000_base_schema.sql
-- (user_roles table)
```

#### Migration 3: Support Ticketing
```sql
-- Copy from: supabase/migrations/20260504030001_support_ticketing.sql
-- (support_tickets, support_messages tables)
```

#### Migration 4: Assignments
```sql
-- Copy from: supabase/migrations/20260504030002_assignments.sql
-- (assignments table)
```

#### Migration 5: Notifications
```sql
-- Copy from: supabase/migrations/20260504030003_notifications.sql
-- (notifications table)
```

#### Migration 6: Delivery Engine
```sql
-- Copy from: supabase/migrations/20260504030004_delivery_engine.sql
-- (delivery_zones, deliveries tables)
```

#### Migration 7: Pricing Engine
```sql
-- Copy from: supabase/migrations/20260504030005_pricing_engine.sql
-- (pricing_rules table)
```

#### Migration 8: Order Snapshotting
```sql
-- Copy from: supabase/migrations/20260504030006_order_snapshotting.sql
-- (order snapshots)
```

#### Migration 9: Payments Complete
```sql
-- Copy from: supabase/migrations/20260504050001_payments_complete.sql
-- (payment_methods, payments, refunds, ledger_entries tables)
```

#### Migration 10: Menu & Bookings
```sql
-- Copy from: supabase/migrations/20260504060001_menu_options_and_bookings.sql
-- (menu items, categories, options, bookings tables)
```

---

## 🔧 FASTER METHOD: Run All At Once

Instead of running 10 migrations separately, combine them:

1. Create new SQL file in Supabase dashboard

2. Copy all migrations in order:
   ```
   20260504010000_enable_extensions.sql
   20260504020000_base_schema.sql
   20260504030001_support_ticketing.sql
   20260504030002_assignments.sql
   20260504030003_notifications.sql
   20260504030004_delivery_engine.sql
   20260504030005_pricing_engine.sql
   20260504030006_order_snapshotting.sql
   20260504050001_payments_complete.sql
   20260504060001_menu_options_and_bookings.sql
   ```

3. Paste all into one SQL file

4. Run once

---

## ✅ VERIFICATION

After all migrations run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should show **31 tables**:
- assignments
- bookings
- brands
- customers
- deliveries
- delivery_zones
- ledger_entries
- locations
- menu_categories
- menu_item_options
- menu_items
- menu_options
- notifications
- order_items
- order_snapshots
- orders
- payment_methods
- payments
- pricing_rules
- refunds
- support_messages
- support_tickets
- user_roles
- ... and more

---

## 📊 RESULT

**Before Option A**:
- Tables: Mixed schema
- Migrations: 4/10 deployed
- Conflicts: Yes

**After Option A**:
- Tables: 31 clean tables
- Migrations: 10/10 deployed
- Conflicts: None
- Data: Empty (fresh start)

---

## 🎯 EXECUTION CHECKLIST

- [ ] 1. Confirm this is dev/test (not production)
- [ ] 2. Confirm okay to lose all data
- [ ] 3. Run OPTION_A_RESET.sql to drop everything
- [ ] 4. Run all 10 migrations in order
- [ ] 5. Verify 31 tables exist
- [ ] 6. Test basic queries

**Total Time**: 2-5 minutes  
**Complexity**: Low  
**Data Loss**: 100%

---

## 🔗 QUICK LINKS

**Supabase SQL Editor**:  
https://supabase.com/dashboard/project/beswluhdxaphtitaovly/sql/new

**GitHub Migrations Folder**:  
https://github.com/top0ppton3-ops/glenkeos-empire/tree/master/supabase/migrations

**Reset SQL File**:  
https://github.com/top0ppton3-ops/glenkeos-empire/blob/master/OPTION_A_RESET.sql

---

**Status**: Ready to execute  
**Method**: Option A (DROP & REBUILD)  
**Time**: 2-5 minutes  
**Next**: Run OPTION_A_RESET.sql in Supabase dashboard
