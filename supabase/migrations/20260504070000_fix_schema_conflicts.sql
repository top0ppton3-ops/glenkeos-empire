-- Fix Schema Conflicts (Option B: ALTER TABLE)
-- Production-safe migrations to align existing tables with expected schema

-- ============================================
-- FIX: customers table
-- ============================================
DO $$
BEGIN
  -- Add user_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_customers_user_id ON customers(user_id);
  END IF;

  -- Add email if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'email'
  ) THEN
    ALTER TABLE customers ADD COLUMN email TEXT;
  END IF;

  -- Add other standard columns if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'phone'
  ) THEN
    ALTER TABLE customers ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE customers ADD COLUMN first_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE customers ADD COLUMN last_name TEXT;
  END IF;
END $$;

-- ============================================
-- FIX: brands table
-- ============================================
DO $$
BEGIN
  -- Add slug if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brands' AND column_name = 'slug'
  ) THEN
    ALTER TABLE brands ADD COLUMN slug TEXT;
    -- Generate slugs from names for existing records
    UPDATE brands SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
    -- Add unique constraint
    ALTER TABLE brands ADD CONSTRAINT brands_slug_key UNIQUE(slug);
  END IF;

  -- Add parent_brand_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brands' AND column_name = 'parent_brand_id'
  ) THEN
    ALTER TABLE brands ADD COLUMN parent_brand_id TEXT REFERENCES brands(id);
  END IF;

  -- Add is_active if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brands' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE brands ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============================================
-- FIX: locations table
-- ============================================
DO $$
BEGIN
  -- Add address fields if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'address_line1'
  ) THEN
    ALTER TABLE locations ADD COLUMN address_line1 TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'address_line2'
  ) THEN
    ALTER TABLE locations ADD COLUMN address_line2 TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'city'
  ) THEN
    ALTER TABLE locations ADD COLUMN city TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'state'
  ) THEN
    ALTER TABLE locations ADD COLUMN state TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE locations ADD COLUMN zip_code TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'country'
  ) THEN
    ALTER TABLE locations ADD COLUMN country TEXT DEFAULT 'US';
  END IF;

  -- Add other fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'slug'
  ) THEN
    ALTER TABLE locations ADD COLUMN slug TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'phone'
  ) THEN
    ALTER TABLE locations ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'email'
  ) THEN
    ALTER TABLE locations ADD COLUMN email TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE locations ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'brand_id'
  ) THEN
    ALTER TABLE locations ADD COLUMN brand_id TEXT REFERENCES brands(id);
  END IF;
END $$;

-- ============================================
-- FIX: notifications table
-- ============================================
DO $$
BEGIN
  -- Add user_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN user_id UUID REFERENCES auth.users(id);
    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
  END IF;

  -- Add role if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'role'
  ) THEN
    ALTER TABLE notifications ADD COLUMN role TEXT;
  END IF;

  -- Add type if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'type'
  ) THEN
    ALTER TABLE notifications ADD COLUMN type TEXT;
  END IF;

  -- Add other standard notification fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'title'
  ) THEN
    ALTER TABLE notifications ADD COLUMN title TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'message'
  ) THEN
    ALTER TABLE notifications ADD COLUMN message TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'payload'
  ) THEN
    ALTER TABLE notifications ADD COLUMN payload JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================
-- FIX: payments table
-- ============================================
DO $$
BEGIN
  -- Add user_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN user_id UUID REFERENCES auth.users(id);
    CREATE INDEX idx_payments_user_id ON payments(user_id);
  END IF;

  -- Add order_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'order_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN order_id UUID;
  END IF;

  -- Add payment_method_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'payment_method_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN payment_method_id UUID REFERENCES payment_methods(id);
  END IF;

  -- Add amount if missing (in cents)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'amount'
  ) THEN
    ALTER TABLE payments ADD COLUMN amount INTEGER;
  END IF;

  -- Add currency if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'currency'
  ) THEN
    ALTER TABLE payments ADD COLUMN currency TEXT DEFAULT 'USD';
  END IF;

  -- Add status if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'status'
  ) THEN
    ALTER TABLE payments ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  -- Add provider if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'provider'
  ) THEN
    ALTER TABLE payments ADD COLUMN provider TEXT;
  END IF;

  -- Add provider_reference if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'provider_reference'
  ) THEN
    ALTER TABLE payments ADD COLUMN provider_reference TEXT;
  END IF;

  -- Add provider_raw if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'provider_raw'
  ) THEN
    ALTER TABLE payments ADD COLUMN provider_raw JSONB;
  END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
COMMENT ON MIGRATION IS 'Option B: ALTER TABLE migrations to fix schema conflicts without data loss';
