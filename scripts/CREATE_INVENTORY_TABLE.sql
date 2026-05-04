-- ================================================================
-- Create inventory_items Table for GlenKeos
-- Run this in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- CREATE TABLE: inventory_items
-- ================================================================

CREATE TABLE IF NOT EXISTS public.inventory_items (
    item_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    store_id VARCHAR(50) NOT NULL REFERENCES public.stores(store_id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20) NOT NULL DEFAULT 'units',
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    threshold_low DECIMAL(10, 2) NOT NULL DEFAULT 10,
    threshold_critical DECIMAL(10, 2) NOT NULL DEFAULT 5,
    unit_cost DECIMAL(10, 2),
    supplier VARCHAR(200),
    last_restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- CREATE INDEXES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_inventory_store ON public.inventory_items(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_low ON public.inventory_items(store_id, quantity) WHERE quantity <= threshold_low;

-- ================================================================
-- ENABLE RLS
-- ================================================================

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- CREATE RLS POLICIES
-- ================================================================

DROP POLICY IF EXISTS inventory_items_select ON public.inventory_items;
DROP POLICY IF EXISTS inventory_items_insert ON public.inventory_items;
DROP POLICY IF EXISTS inventory_items_update ON public.inventory_items;
DROP POLICY IF EXISTS inventory_items_delete ON public.inventory_items;

-- SELECT: Staff can see inventory for their stores, customers can see availability
CREATE POLICY inventory_items_select ON public.inventory_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.store_id = inventory_items.store_id
      AND (
        s.tenant_id = COALESCE(auth.jwt() -> 'app_metadata' ->> 'tenant_id', 'public')
        OR (auth.jwt() -> 'app_metadata' ->> 'tenant_access') LIKE '%glenkeos%'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'customer'
      )
    )
  );

-- INSERT: Only staff/corporate can add inventory items
CREATE POLICY inventory_items_insert ON public.inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.store_id = inventory_items.store_id
      AND (
        s.tenant_id = COALESCE(auth.jwt() -> 'app_metadata' ->> 'tenant_id', 'public')
        OR (auth.jwt() -> 'app_metadata' ->> 'tenant_access') LIKE '%glenkeos%'
      )
    )
  );

-- UPDATE: Only staff/corporate can update inventory
CREATE POLICY inventory_items_update ON public.inventory_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.store_id = inventory_items.store_id
      AND (
        s.tenant_id = COALESCE(auth.jwt() -> 'app_metadata' ->> 'tenant_id', 'public')
        OR (auth.jwt() -> 'app_metadata' ->> 'tenant_access') LIKE '%glenkeos%'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.store_id = inventory_items.store_id
      AND (
        s.tenant_id = COALESCE(auth.jwt() -> 'app_metadata' ->> 'tenant_id', 'public')
        OR (auth.jwt() -> 'app_metadata' ->> 'tenant_access') LIKE '%glenkeos%'
      )
    )
  );

-- DELETE: Only corporate can delete inventory items
CREATE POLICY inventory_items_delete ON public.inventory_items
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'tenant_access') LIKE '%glenkeos%');

-- ================================================================
-- ENABLE REALTIME
-- ================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;

-- ================================================================
-- SEED SAMPLE DATA (Optional - for testing)
-- ================================================================

-- Get first store ID for seeding
DO $$
DECLARE
  first_store_id VARCHAR(50);
BEGIN
  SELECT store_id INTO first_store_id FROM public.stores LIMIT 1;

  IF first_store_id IS NOT NULL THEN
    -- Insert sample inventory items
    INSERT INTO public.inventory_items (
      store_id, sku, item_name, category, unit, quantity,
      threshold_low, threshold_critical, unit_cost
    ) VALUES
      (first_store_id, 'CHICK-001', 'Organic Chicken Breast', 'Protein', 'kg', 50.00, 10.00, 5.00, 8.99),
      (first_store_id, 'LETTUCE-001', 'Romaine Lettuce', 'Produce', 'kg', 25.50, 5.00, 2.00, 3.49),
      (first_store_id, 'TOMATO-001', 'Cherry Tomatoes', 'Produce', 'kg', 15.00, 5.00, 2.00, 4.99),
      (first_store_id, 'CHEESE-001', 'Cheddar Cheese', 'Dairy', 'kg', 30.00, 8.00, 3.00, 12.99),
      (first_store_id, 'BREAD-001', 'Artisan Bread Rolls', 'Bakery', 'units', 100, 20, 10, 0.89),
      (first_store_id, 'OIL-001', 'Olive Oil', 'Pantry', 'liters', 45.00, 10.00, 5.00, 15.99)
    ON CONFLICT (item_id) DO NOTHING;

    RAISE NOTICE 'Sample inventory items created for store: %', first_store_id;
  ELSE
    RAISE NOTICE 'No stores found - skipping sample data';
  END IF;
END $$;

-- ================================================================
-- VERIFY TABLE CREATED
-- ================================================================

SELECT
  table_schema,
  table_name,
  (SELECT COUNT(*) FROM public.inventory_items) as row_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'inventory_items';

-- ================================================================
-- VERIFY RLS ENABLED
-- ================================================================

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'inventory_items';

-- ================================================================
-- VERIFY REALTIME ENABLED
-- ================================================================

SELECT
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'inventory_items';

-- ================================================================
-- SUCCESS!
-- ================================================================
-- Expected results:
-- 1. Table created with 6 sample items (if store exists)
-- 2. RLS enabled (rowsecurity = true)
-- 3. Realtime enabled (appears in pg_publication_tables)
-- ================================================================
