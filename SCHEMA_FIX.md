# DATABASE SCHEMA CONFLICTS — LINE THEM UP

Below are the three options, each written as:

• When to use it  
• What it does  
• Exact commands  
• Risks  
• Who approves  
• Time to complete

This is the real deal, not examples.

---

## 1️⃣ OPTION A — DROP EVERYTHING & REBUILD (FASTEST)

**Use when:**

• No production data  
• Only dev/test environment  
• Schema is badly broken  
• Migrations missing or out of order

**What it does:**

• Deletes all tables  
• Rebuilds DB from migrations  
• Guarantees perfect schema alignment

**Commands:**

```bash
supabase db reset
supabase db push
```

**Risks:**

• All data is lost  
• Only safe in non-production

**Approval needed:**

• Lead engineer only

**Time to complete:**

• 2–5 minutes

---

## 2️⃣ OPTION B — ALTER TABLE MIGRATIONS (SAFEST)

**Use when:**

• Production data exists  
• Only a few schema differences  
• You cannot lose data  
• You need surgical fixes

**What it does:**

• Creates migrations that modify existing tables  
• No data loss  
• Safest for live systems

**Commands:**

Create migration:

```bash
supabase migration new fix-schema
```

Add ALTER statements inside:

**Add missing column:**

```sql
ALTER TABLE orders ADD COLUMN brand_id UUID;
```

**Fix wrong type:**

```sql
ALTER TABLE payments ALTER COLUMN amount TYPE INT USING amount::INT;
```

**Add missing FK:**

```sql
ALTER TABLE payments 
ADD CONSTRAINT payments_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES orders(id);
```

Apply:

```bash
supabase db push
```

**Risks:**

• Must be precise  
• Requires senior engineer review

**Approval needed:**

• Lead engineer + PM

**Time to complete:**

• 30–90 minutes

---

## 3️⃣ OPTION C — EXPORT → RESET → REIMPORT (BALANCED)

**Use when:**

• You have important data  
• Schema is too broken for Option B  
• You need a clean schema AND preserved data

**What it does:**

• Exports data  
• Resets DB  
• Rebuilds schema  
• Reimports data into correct structure

**Commands:**

Export data:

```bash
supabase db dump --data-only > data.sql
```

Reset DB:

```bash
supabase db reset
```

Run migrations:

```bash
supabase db push
```

Reimport data:

```bash
psql < data.sql
```

**Risks:**

• Import errors if schema changed too much  
• Requires engineer to fix row-by-row issues

**Approval needed:**

• Lead engineer  
• PM  
• Founder (you)

**Time to complete:**

• 1–3 hours

---

## THE TEAM PLAYBOOK — EXACT STEPS THEY FOLLOW

**Step 1 — Run diff**

```bash
supabase db diff
```

**Step 2 — Categorize conflicts**

• Missing tables → A or C  
• Missing columns → B  
• Wrong types → B  
• Wrong constraints → B  
• Entire domain missing → A or C  
• Must preserve data → C

**Step 3 — Choose A, B, or C**

(Use the lined-up rules above.)

**Step 4 — Execute the option**

(Use the commands above.)

**Step 5 — Verify**

```bash
supabase db diff
```

Must return no differences.

---

## CURRENT STATUS (GlenKeos Empire)

**Deployed Migrations:**

✅ 20260504010000_enable_extensions.sql  
✅ 20260504020000_base_schema.sql (user_roles)  
✅ 20260504030001_support_ticketing.sql  
✅ 20260504030002_assignments.sql

**Pending Migrations (Schema Conflicts):**

⏸ 20260504030003_notifications.sql  
⏸ 20260504030004_delivery_engine.sql  
⏸ 20260504030005_pricing_engine.sql  
⏸ 20260504030006_order_snapshotting.sql  
⏸ 20260504050001_payments_complete.sql  
⏸ 20260504060001_menu_options_and_bookings.sql

**Conflicting Tables:**

• `customers` - different columns (missing user_id)  
• `brands` - different columns (missing slug)  
• `locations` - different columns (missing address fields)  
• `notifications` - different columns (missing user_id)  
• `payments` - different columns (missing user_id)

**Recommended Action:**

**Option B** (ALTER TABLE) for production  
**Option A** (RESET) for dev/test only

---

## EXECUTION CHECKLIST

- [ ] Run `supabase db diff` to see exact conflicts
- [ ] Choose Option A, B, or C based on criteria
- [ ] Get approval (see approval matrix above)
- [ ] Execute commands in order
- [ ] Run `supabase db diff` again to verify
- [ ] Test critical flows (payments, orders)
- [ ] Document what was changed

---

**Last Updated:** May 4, 2026  
**Supabase Project:** beswluhdxaphtitaovly  
**Status:** 4/10 migrations deployed, 6 pending
