-- Migration: 010_add_foreign_key_constraints
-- Description: Add missing foreign key constraints that require tables to exist first
-- Version: 1.0.0

-- Add driver_id FK to orders (requires drivers table)
-- Already handled in 002_create_orders.sql

-- Add current_order_id FK to drivers (requires orders table)
-- Already handled in 004_create_drivers.sql

-- Add compliance_verified_by FK to orders (requires staff table)
-- Already handled in 002_create_orders.sql

-- Create index for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_orders_compliance_verified_by
    ON orders(compliance_verified_by) WHERE compliance_verified_by IS NOT NULL;

-- Add comments for cross-table relationships
COMMENT ON COLUMN orders.driver_id IS 'FK to drivers table - assigned delivery driver';
COMMENT ON COLUMN orders.compliance_verified_by IS 'FK to staff table - staff who verified compliance';
COMMENT ON COLUMN drivers.current_order_id IS 'FK to orders table - currently assigned order';
