-- ================================================================
-- GlenKeos - Final Supabase Setup Script
-- Run this in Supabase SQL Editor after schema is deployed
-- ================================================================

-- ================================================================
-- STEP 1: Enable RLS on all tables (if not already enabled)
-- ================================================================

-- Note: inventory_items must be created first via CREATE_INVENTORY_TABLE.sql

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- STEP 2: Enable Realtime for critical tables
-- ================================================================

-- Note: inventory_items realtime is enabled in CREATE_INVENTORY_TABLE.sql

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ================================================================
-- STEP 3: Verify publication configuration
-- ================================================================

SELECT pubname, puballtables, pubinsert, pubupdate, pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- ================================================================
-- STEP 4: Verify tables in publication
-- ================================================================

SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ================================================================
-- STEP 5: Verify RLS is enabled
-- ================================================================

SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'drivers', 'inventory_items', 'menu_items')
ORDER BY tablename;

-- ================================================================
-- Expected Output:
-- ================================================================
-- Step 3 should show:
--   pubname = supabase_realtime
--   puballtables = false
--   pubinsert = true, pubupdate = true, pubdelete = true
--
-- Step 4 should show all 6 tables (orders, order_items, drivers, inventory_items, menu_items, notifications)
--
-- Step 5 should show all tables with rowsecurity = true
-- ================================================================

-- ================================================================
-- SUCCESS INDICATORS:
-- ================================================================
-- ✅ All tables have rowsecurity = true
-- ✅ supabase_realtime publication includes 6 critical tables
-- ✅ No errors when running this script
-- ================================================================
