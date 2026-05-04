-- ================================================================
-- GlenKeos Complete Supabase Setup
-- Run this ONCE in Supabase SQL Editor to set up everything
-- ================================================================

-- This combines:
-- 1. Full database schema (tables, indexes, constraints)
-- 2. RLS policies (multi-tenant security)
-- 3. Realtime configuration
-- 4. Sample data

-- ================================================================
-- PART 1: CREATE TABLES
-- ================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Stores table (required first for foreign keys)
CREATE TABLE IF NOT EXISTS public.stores (
    store_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    store_name VARCHAR(200) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_tenant ON public.stores(tenant_id);

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    customer_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cognito_sub VARCHAR(100) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_cognito_sub ON public.customers(cognito_sub);

-- Orders table (WITH tenant_id)
CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id VARCHAR(50) NOT NULL,
    store_id VARCHAR(50) REFERENCES public.stores(store_id),
    tenant_id VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING',
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    delivery_address JSONB,
    customer_info JSONB,
    driver_id VARCHAR(50),
    estimated_delivery_time VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON public.orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- Drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
    id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'OFFLINE',
    driver_type VARCHAR(50) DEFAULT 'HUMAN',
    rating DECIMAL(3, 2) DEFAULT 4.5,
    risk_score DECIMAL(5, 2) DEFAULT 0,
    on_time_rate DECIMAL(3, 2) DEFAULT 0.95,
    completion_rate DECIMAL(3, 2) DEFAULT 0.98,
    current_location JSONB,
    vehicle_info JSONB,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_tenant ON public.drivers(tenant_id);

-- Menu items table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_tenant ON public.menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON public.menu_items(is_active);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id VARCHAR(50),
    order_id VARCHAR(50) REFERENCES public.orders(id),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_customer ON public.notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_order ON public.notifications(order_id);

-- ================================================================
-- PART 2: ENABLE RLS
-- ================================================================

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PART 3: CREATE RLS HELPER FUNCTIONS
-- ================================================================

CREATE OR REPLACE FUNCTION auth.user_tenant_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'tenant_id',
    'public'
  );
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.has_corporate_access()
RETURNS BOOLEAN AS $$
  SELECT
    (auth.jwt() -> 'app_metadata' ->> 'tenant_access') LIKE '%glenkeos%'
    OR (auth.jwt() -> 'app_metadata' ->> 'tenant_id') = 'glenkeos';
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.customer_id()
RETURNS TEXT AS $$
  SELECT customer_id
  FROM public.customers
  WHERE cognito_sub = auth.uid()::text
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ================================================================
-- PART 4: CREATE RLS POLICIES
-- ================================================================

-- Orders policies
DROP POLICY IF EXISTS orders_select ON public.orders;
CREATE POLICY orders_select ON public.orders
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.customer_id()
    OR tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

DROP POLICY IF EXISTS orders_insert ON public.orders;
CREATE POLICY orders_insert ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (true); -- Allow all authenticated users to create orders

DROP POLICY IF EXISTS orders_update ON public.orders;
CREATE POLICY orders_update ON public.orders
  FOR UPDATE TO authenticated
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

-- Order items policies
DROP POLICY IF EXISTS order_items_select ON public.order_items;
CREATE POLICY order_items_select ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (
        o.customer_id = auth.customer_id()
        OR o.tenant_id = auth.user_tenant_id()
        OR auth.has_corporate_access()
      )
    )
  );

DROP POLICY IF EXISTS order_items_insert ON public.order_items;
CREATE POLICY order_items_insert ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Drivers policies
DROP POLICY IF EXISTS drivers_select ON public.drivers;
CREATE POLICY drivers_select ON public.drivers
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()::text
    OR tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

-- Menu items policies
DROP POLICY IF EXISTS menu_items_select ON public.menu_items;
CREATE POLICY menu_items_select ON public.menu_items
  FOR SELECT TO authenticated
  USING (true); -- All users can view menu items

-- Customers policies
DROP POLICY IF EXISTS customers_select ON public.customers;
CREATE POLICY customers_select ON public.customers
  FOR SELECT TO authenticated
  USING (
    cognito_sub = auth.uid()::text
    OR auth.has_corporate_access()
  );

DROP POLICY IF EXISTS customers_insert ON public.customers;
CREATE POLICY customers_insert ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (cognito_sub = auth.uid()::text);

-- Stores policies
DROP POLICY IF EXISTS stores_select ON public.stores;
CREATE POLICY stores_select ON public.stores
  FOR SELECT TO authenticated
  USING (true); -- All users can view stores

-- ================================================================
-- PART 5: ENABLE REALTIME
-- ================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ================================================================
-- PART 6: SEED SAMPLE DATA
-- ================================================================

-- Insert sample store
INSERT INTO public.stores (store_id, store_name, address, city, state, zip, tenant_id)
VALUES ('store_001', 'Chic on Chain - Downtown', '123 Main St', 'New York', 'NY', '10001', 'chic-on-chain')
ON CONFLICT (store_id) DO NOTHING;

-- Insert sample menu items
INSERT INTO public.menu_items (id, tenant_id, name, description, category, price, is_active)
VALUES
  ('menu_001', 'chic-on-chain', 'Truffle Burger', 'Wagyu beef with truffle aioli', 'Entrees', 24.99, true),
  ('menu_002', 'chic-on-chain', 'Lobster Mac & Cheese', 'Fresh lobster with three-cheese sauce', 'Entrees', 32.99, true),
  ('menu_003', 'chic-on-chain', 'Caesar Salad', 'Romaine, parmesan, house-made croutons', 'Salads', 14.99, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample driver
INSERT INTO public.drivers (id, name, phone, email, status, tenant_id)
VALUES ('driver_001', 'John Driver', '555-0100', 'driver@coc.internal', 'ONLINE', 'chic-on-chain')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- PART 7: VERIFY SETUP
-- ================================================================

-- Check tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('orders', 'order_items', 'drivers', 'menu_items', 'stores', 'customers')
ORDER BY table_name;

-- Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'drivers', 'menu_items')
ORDER BY tablename;

-- Check realtime enabled
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Check sample data
SELECT 'Stores' as table_name, COUNT(*)::text as count FROM public.stores
UNION ALL
SELECT 'Menu Items', COUNT(*)::text FROM public.menu_items
UNION ALL
SELECT 'Drivers', COUNT(*)::text FROM public.drivers;

-- ================================================================
-- SETUP COMPLETE!
-- ================================================================
SELECT '✅ GlenKeos Supabase setup complete!' as status;
