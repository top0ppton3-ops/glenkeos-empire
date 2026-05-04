-- ================================================================
-- Add tenant_id column to orders table
-- Run this in Supabase SQL Editor if orders table is missing tenant_id
-- ================================================================

-- Check if column exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'tenant_id'
  ) THEN
    -- Add tenant_id column
    ALTER TABLE public.orders ADD COLUMN tenant_id VARCHAR(50);

    -- Set default value for existing rows (use store's tenant_id)
    UPDATE public.orders o
    SET tenant_id = s.tenant_id
    FROM public.stores s
    WHERE o.store_id = s.store_id
      AND o.tenant_id IS NULL;

    -- Make it NOT NULL after backfilling
    ALTER TABLE public.orders ALTER COLUMN tenant_id SET NOT NULL;

    -- Add index
    CREATE INDEX IF NOT EXISTS idx_orders_tenant ON public.orders(tenant_id);

    RAISE NOTICE 'tenant_id column added to orders table';
  ELSE
    RAISE NOTICE 'tenant_id column already exists in orders table';
  END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name = 'tenant_id';

-- Show sample data
SELECT order_id, customer_id, store_id, tenant_id, status
FROM public.orders
LIMIT 5;
