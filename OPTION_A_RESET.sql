-- OPTION A: DROP EVERYTHING & REBUILD
-- WARNING: This destroys ALL data in the database
-- Only use in dev/test environments

-- ============================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ============================================

-- Drop tables in correct order (reverse of dependencies)
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS order_snapshots CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_item_options CASCADE;
DROP TABLE IF EXISTS menu_options CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS pricing_rules CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;
DROP TABLE IF EXISTS support_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS assignment_status CASCADE;
DROP TYPE IF EXISTS assignment_type CASCADE;
DROP TYPE IF EXISTS support_status CASCADE;
DROP TYPE IF EXISTS support_priority CASCADE;
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS prevent_ledger_modification() CASCADE;
DROP FUNCTION IF EXISTS add_payment_method_card(UUID, TEXT, TEXT, TEXT, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS create_payment_intent(UUID, UUID, INTEGER, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS capture_payment(UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS get_user_payment_methods(UUID) CASCADE;
DROP FUNCTION IF EXISTS set_default_payment_method(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS create_refund(UUID, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS complete_refund(UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS create_ticket(UUID, UUID, TEXT, UUID, TEXT, TEXT, support_priority, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_ticket_messages(UUID) CASCADE;
DROP FUNCTION IF EXISTS add_ticket_message(UUID, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS assign_ticket(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS resolve_ticket(UUID) CASCADE;
DROP FUNCTION IF EXISTS assign_staff_to_order(UUID, UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS assign_driver_to_delivery(UUID, UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_staff_assignments(UUID, assignment_status) CASCADE;
DROP FUNCTION IF EXISTS update_assignment_status(UUID, assignment_status) CASCADE;
DROP FUNCTION IF EXISTS release_assignment(UUID) CASCADE;
DROP FUNCTION IF EXISTS reassign_assignment(UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS resolve_delivery(TEXT, TEXT, UUID) CASCADE;

-- ============================================
-- CONFIRMATION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ All tables, types, and functions dropped';
  RAISE NOTICE '📋 Next: Run all migrations in order';
  RAISE NOTICE '⚠️  All data has been destroyed';
END $$;
