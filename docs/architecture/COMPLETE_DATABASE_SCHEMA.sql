-- ============================================================================
-- GLENKEOS ENTERPRISE PLATFORM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Version: 1.0.0-enterprise
-- Date: April 24, 2026
-- Architecture: Multi-tenant with hard isolation + corporate override
-- Database: PostgreSQL 15+ (Supabase)
-- Security: Row-Level Security (RLS) enabled on all tables
-- Realtime: WebSocket subscriptions on critical operational tables
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query performance monitoring
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Text search optimization
CREATE EXTENSION IF NOT EXISTS "postgis";        -- Geospatial (future: delivery zones)

-- ============================================================================
-- SECTION 2: HELPER FUNCTIONS (For RLS)
-- ============================================================================

-- Get current user's tenant_id from JWT token
CREATE OR REPLACE FUNCTION auth.user_tenant_id()
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')::VARCHAR(50);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has SUPER_ADMIN role (corporate override)
CREATE OR REPLACE FUNCTION auth.has_corporate_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'role' = 'SUPER_ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current user's ID from JWT token
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current user's role from JWT token
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- SECTION 3: CORE TABLES
-- ============================================================================

-- --------------------------------
-- 3.1 Stores Table
-- --------------------------------
CREATE TABLE IF NOT EXISTS public.stores (
  store_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(50) NOT NULL CHECK (brand IN ('chic-on-chain', 'ghetto-eats', 'goldkey')),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  location GEOGRAPHY(POINT), -- PostGIS for geospatial queries
  opening_hours JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.stores IS 'Physical store locations for all three brands';
COMMENT ON COLUMN public.stores.tenant_id IS 'Tenant isolation: each store is a tenant';
COMMENT ON COLUMN public.stores.brand IS 'Brand affiliation: chic-on-chain, ghetto-eats, goldkey';
COMMENT ON COLUMN public.stores.location IS 'PostGIS geography for delivery radius calculations';

-- Indices for stores
CREATE INDEX idx_stores_tenant_id ON public.stores(tenant_id);
CREATE INDEX idx_stores_brand ON public.stores(brand);
CREATE INDEX idx_stores_active ON public.stores(is_active) WHERE is_active = true;
CREATE INDEX idx_stores_location ON public.stores USING GIST(location); -- Geospatial index

-- --------------------------------
-- 3.2 Customers Table
-- --------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  customer_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id VARCHAR(50) NOT NULL,
  user_id UUID, -- References auth.users (Supabase Auth)
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  delivery_addresses JSONB DEFAULT '[]'::jsonb, -- Array of address objects
  payment_methods JSONB DEFAULT '[]'::jsonb,    -- Array of payment method IDs
  preferences JSONB DEFAULT '{}'::jsonb,         -- Dietary preferences, favorites, etc.
  loyalty_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.customers IS 'Customer profiles across all brands';
COMMENT ON COLUMN public.customers.user_id IS 'Links to auth.users for authentication';
COMMENT ON COLUMN public.customers.delivery_addresses IS 'JSON array of saved delivery addresses';
COMMENT ON COLUMN public.customers.loyalty_points IS 'GoldKey loyalty program points';

-- Indices for customers
CREATE INDEX idx_customers_tenant_id ON public.customers(tenant_id);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_active ON public.customers(is_active) WHERE is_active = true;

-- --------------------------------
-- 3.3 Menu Items Table
-- --------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
  item_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id VARCHAR(50) NOT NULL,
  store_id VARCHAR(50) REFERENCES public.stores(store_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'entree', 'appetizer', 'dessert', 'beverage'
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10, 2) CHECK (cost >= 0), -- COGS for margin calculation
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  dietary_tags JSONB DEFAULT '[]'::jsonb, -- ['vegetarian', 'gluten-free', etc.]
  prep_time_minutes INTEGER, -- Kitchen prep time estimate
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.menu_items IS 'Menu items available at each store';
COMMENT ON COLUMN public.menu_items.cost IS 'Cost of goods sold (COGS) for margin analysis';
COMMENT ON COLUMN public.menu_items.dietary_tags IS 'Array of dietary restriction tags';

-- Indices for menu_items
CREATE INDEX idx_menu_items_tenant_id ON public.menu_items(tenant_id);
CREATE INDEX idx_menu_items_store_id ON public.menu_items(store_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category);
CREATE INDEX idx_menu_items_available ON public.menu_items(is_available) WHERE is_available = true;

-- --------------------------------
-- 3.4 Inventory Items Table
-- --------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_items (
  item_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id VARCHAR(50) NOT NULL,
  store_id VARCHAR(50) REFERENCES public.stores(store_id) ON DELETE CASCADE,
  menu_item_id VARCHAR(50) REFERENCES public.menu_items(item_id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reorder_threshold INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  unit_cost DECIMAL(10, 2),
  last_restock_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.inventory_items IS 'Real-time inventory tracking per store';
COMMENT ON COLUMN public.inventory_items.reorder_threshold IS 'Auto-order trigger point';
COMMENT ON COLUMN public.inventory_items.reorder_quantity IS 'Standard reorder amount';

-- Indices for inventory_items
CREATE INDEX idx_inventory_tenant_id ON public.inventory_items(tenant_id);
CREATE INDEX idx_inventory_store_id ON public.inventory_items(store_id);
CREATE INDEX idx_inventory_low_stock ON public.inventory_items(quantity) WHERE quantity < reorder_threshold;

-- --------------------------------
-- 3.5 Orders Table (CRITICAL)
-- --------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id VARCHAR(50) NOT NULL,
  customer_id VARCHAR(50) REFERENCES public.customers(customer_id) ON DELETE SET NULL,
  store_id VARCHAR(50) REFERENCES public.stores(store_id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable order number
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED'
  )),
  order_type VARCHAR(50) DEFAULT 'DELIVERY' CHECK (order_type IN ('DELIVERY', 'PICKUP', 'DINE_IN')),
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  tip_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (payment_status IN (
    'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'
  )),
  payment_method VARCHAR(50), -- 'paypal', 'stripe', 'cash'
  payment_id VARCHAR(255), -- External payment processor ID
  delivery_address JSONB,
  delivery_instructions TEXT,
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  driver_id VARCHAR(50), -- References drivers table
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.orders IS 'All customer orders across all brands';
COMMENT ON COLUMN public.orders.order_number IS 'Human-readable order number (e.g. GE-2024-00001)';
COMMENT ON COLUMN public.orders.status IS 'Order lifecycle status';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment processing status';

-- Indices for orders (PERFORMANCE CRITICAL)
CREATE INDEX idx_orders_tenant_id ON public.orders(tenant_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_store_id ON public.orders(store_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_driver_id ON public.orders(driver_id) WHERE driver_id IS NOT NULL;
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC); -- For recent orders queries
CREATE INDEX idx_orders_order_number ON public.orders(order_number); -- For lookups

-- --------------------------------
-- 3.6 Order Items Table
-- --------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id VARCHAR(50) NOT NULL,
  order_id VARCHAR(50) REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id VARCHAR(50) REFERENCES public.menu_items(item_id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  customizations JSONB DEFAULT '{}'::jsonb, -- 'no onions', 'extra cheese', etc.
  preparation_status VARCHAR(50) DEFAULT 'PENDING' CHECK (preparation_status IN (
    'PENDING', 'PREPARING', 'READY', 'SERVED'
  )),
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.order_items IS 'Line items for each order';
COMMENT ON COLUMN public.order_items.customizations IS 'Customer customization requests';
COMMENT ON COLUMN public.order_items.preparation_status IS 'Kitchen prep status for KDS';

-- Indices for order_items
CREATE INDEX idx_order_items_tenant_id ON public.order_items(tenant_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON public.order_items(menu_item_id);
CREATE INDEX idx_order_items_prep_status ON public.order_items(preparation_status);

-- --------------------------------
-- 3.7 Drivers Table
-- --------------------------------
CREATE TABLE IF NOT EXISTS public.drivers (
  driver_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id VARCHAR(50) NOT NULL,
  user_id UUID, -- References auth.users
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  vehicle_type VARCHAR(50), -- 'car', 'bike', 'scooter'
  license_plate VARCHAR(20),
  current_location GEOGRAPHY(POINT), -- Real-time location tracking
  is_active BOOLEAN DEFAULT true,
  is_online BOOLEAN DEFAULT false, -- Currently available for deliveries
  rating DECIMAL(3, 2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
  total_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.drivers IS 'Delivery driver fleet across all stores';
COMMENT ON COLUMN public.drivers.current_location IS 'Real-time GPS location for dispatch optimization';
COMMENT ON COLUMN public.drivers.is_online IS 'Available for new delivery assignments';

-- Indices for drivers
CREATE INDEX idx_drivers_tenant_id ON public.drivers(tenant_id);
CREATE INDEX idx_drivers_online ON public.drivers(is_online) WHERE is_online = true;
CREATE INDEX idx_drivers_location ON public.drivers USING GIST(current_location);

-- --------------------------------
-- 3.8 Notifications Table
-- --------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id VARCHAR(50) NOT NULL,
  recipient_id VARCHAR(50) NOT NULL, -- customer_id, driver_id, or user_id
  recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('CUSTOMER', 'DRIVER', 'STAFF', 'ADMIN')),
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'ORDER_CONFIRMED', 'ORDER_READY', 'DRIVER_ASSIGNED', 'OUT_FOR_DELIVERY',
    'DELIVERED', 'CANCELLED', 'PAYMENT_RECEIVED', 'LOW_INVENTORY', 'SYSTEM_ALERT'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb, -- Additional context (order_id, etc.)
  is_read BOOLEAN DEFAULT false,
  sent_via JSONB DEFAULT '[]'::jsonb, -- ['email', 'sms', 'push', 'in-app']
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'All platform notifications across channels';
COMMENT ON COLUMN public.notifications.sent_via IS 'Delivery channels used';
COMMENT ON COLUMN public.notifications.data IS 'Contextual data for notification';

-- Indices for notifications
CREATE INDEX idx_notifications_tenant_id ON public.notifications(tenant_id);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, recipient_type);
CREATE INDEX idx_notifications_unread ON public.notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- --------------------------------
-- 3.9 Compliance Audit Log Table (IMMUTABLE)
-- --------------------------------
CREATE TABLE IF NOT EXISTS public.compliance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'PAYMENT', etc.
  entity_type VARCHAR(100) NOT NULL, -- 'order', 'customer', 'user', etc.
  entity_id VARCHAR(50) NOT NULL,
  actor_id VARCHAR(50) NOT NULL, -- Who performed the action
  actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('USER', 'SYSTEM', 'API', 'CRON')),
  actor_role VARCHAR(50), -- SUPER_ADMIN, MANAGER, etc.
  changes JSONB NOT NULL, -- { before: {...}, after: {...} }
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

  -- IMMUTABLE: No updates or deletes allowed (SOC 2 / GDPR requirement)
  CHECK (timestamp IS NOT NULL)
);

COMMENT ON TABLE public.compliance_audit_log IS 'IMMUTABLE audit trail for compliance (SOC 2, GDPR, PCI-DSS)';
COMMENT ON COLUMN public.compliance_audit_log.changes IS 'Before/after state for data changes';
COMMENT ON COLUMN public.compliance_audit_log.actor_type IS 'Who/what triggered the action';

-- Trigger to prevent updates/deletes on audit log
CREATE OR REPLACE FUNCTION prevent_audit_log_modifications()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Compliance audit log is immutable. Updates and deletes are not allowed.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_updates
  BEFORE UPDATE OR DELETE ON public.compliance_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modifications();

-- Indices for compliance_audit_log
CREATE INDEX idx_audit_log_tenant_id ON public.compliance_audit_log(tenant_id);
CREATE INDEX idx_audit_log_entity ON public.compliance_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON public.compliance_audit_log(actor_id);
CREATE INDEX idx_audit_log_timestamp ON public.compliance_audit_log(tenant_id, timestamp DESC); -- Compliance queries
CREATE INDEX idx_audit_log_action ON public.compliance_audit_log(action);

-- ============================================================================
-- SECTION 4: ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audit_log ENABLE ROW LEVEL SECURITY;

-- --------------------------------
-- RLS Policies: Stores
-- --------------------------------
CREATE POLICY stores_tenant_isolation ON public.stores
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY stores_insert_policy ON public.stores
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

-- --------------------------------
-- RLS Policies: Customers
-- --------------------------------
CREATE POLICY customers_tenant_isolation ON public.customers
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
    OR user_id = auth.user_id() -- Customers can see their own data
  );

CREATE POLICY customers_insert_policy ON public.customers
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

-- --------------------------------
-- RLS Policies: Menu Items
-- --------------------------------
CREATE POLICY menu_items_tenant_isolation ON public.menu_items
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY menu_items_insert_policy ON public.menu_items
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

-- --------------------------------
-- RLS Policies: Inventory Items
-- --------------------------------
CREATE POLICY inventory_tenant_isolation ON public.inventory_items
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY inventory_insert_policy ON public.inventory_items
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

-- --------------------------------
-- RLS Policies: Orders (CRITICAL)
-- --------------------------------
CREATE POLICY orders_tenant_isolation ON public.orders
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY orders_insert_policy ON public.orders
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

-- --------------------------------
-- RLS Policies: Order Items
-- --------------------------------
CREATE POLICY order_items_tenant_isolation ON public.order_items
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY order_items_insert_policy ON public.order_items
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

-- --------------------------------
-- RLS Policies: Drivers
-- --------------------------------
CREATE POLICY drivers_tenant_isolation ON public.drivers
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY drivers_insert_policy ON public.drivers
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

-- --------------------------------
-- RLS Policies: Notifications
-- --------------------------------
CREATE POLICY notifications_tenant_isolation ON public.notifications
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY notifications_insert_policy ON public.notifications
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

-- --------------------------------
-- RLS Policies: Compliance Audit Log
-- --------------------------------
CREATE POLICY audit_log_tenant_isolation ON public.compliance_audit_log
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY audit_log_insert_policy ON public.compliance_audit_log
  FOR INSERT
  WITH CHECK (true); -- All authenticated users can write audit logs

-- ============================================================================
-- SECTION 5: REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable Realtime on critical operational tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

-- ============================================================================
-- SECTION 6: PERFORMANCE VIEWS
-- ============================================================================

-- View: Active Orders Summary (for operations dashboard)
CREATE OR REPLACE VIEW public.active_orders_summary AS
SELECT
  o.id,
  o.order_number,
  o.tenant_id,
  o.status,
  o.total_amount,
  o.created_at,
  c.first_name || ' ' || c.last_name AS customer_name,
  s.name AS store_name,
  d.first_name || ' ' || d.last_name AS driver_name
FROM public.orders o
LEFT JOIN public.customers c ON o.customer_id = c.customer_id
LEFT JOIN public.stores s ON o.store_id = s.store_id
LEFT JOIN public.drivers d ON o.driver_id = d.driver_id
WHERE o.status NOT IN ('DELIVERED', 'CANCELLED');

-- View: Low Stock Items (for inventory alerts)
CREATE OR REPLACE VIEW public.low_stock_items AS
SELECT
  i.item_id,
  i.tenant_id,
  i.store_id,
  s.name AS store_name,
  m.name AS menu_item_name,
  i.quantity,
  i.reorder_threshold,
  i.reorder_quantity
FROM public.inventory_items i
JOIN public.stores s ON i.store_id = s.store_id
LEFT JOIN public.menu_items m ON i.menu_item_id = m.item_id
WHERE i.quantity < i.reorder_threshold;

-- View: Driver Fleet Status
CREATE OR REPLACE VIEW public.driver_fleet_status AS
SELECT
  d.driver_id,
  d.tenant_id,
  d.first_name || ' ' || d.last_name AS driver_name,
  d.is_online,
  d.rating,
  d.total_deliveries,
  COUNT(o.id) AS active_deliveries
FROM public.drivers d
LEFT JOIN public.orders o ON d.driver_id = o.driver_id
  AND o.status IN ('IN_DELIVERY')
WHERE d.is_active = true
GROUP BY d.driver_id, d.tenant_id, d.first_name, d.last_name, d.is_online, d.rating, d.total_deliveries;

-- ============================================================================
-- SECTION 7: AUTOMATED TRIGGERS
-- ============================================================================

-- Trigger: Update timestamps on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Log all order changes to audit log
CREATE OR REPLACE FUNCTION log_order_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.compliance_audit_log (
    tenant_id,
    action,
    entity_type,
    entity_id,
    actor_id,
    actor_type,
    actor_role,
    changes,
    timestamp
  ) VALUES (
    COALESCE(NEW.tenant_id, OLD.tenant_id),
    TG_OP, -- 'INSERT', 'UPDATE', 'DELETE'
    'order',
    COALESCE(NEW.id, OLD.id),
    auth.user_id()::text,
    'USER',
    auth.user_role(),
    jsonb_build_object(
      'before', to_jsonb(OLD),
      'after', to_jsonb(NEW)
    ),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_order_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_changes();

-- ============================================================================
-- SECTION 8: SEED DATA (OPTIONAL - Run in separate script)
-- ============================================================================

-- This section is intentionally left commented out.
-- Seed data should be run via scripts/COMPLETE_SUPABASE_SETUP.sql
-- to avoid accidental data insertion during schema migrations.

-- ============================================================================
-- SECTION 9: GRANTS & PERMISSIONS
-- ============================================================================

-- Grant usage on public schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table access to authenticated role (Supabase handles this via RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon; -- Public read access (filtered by RLS)

-- Grant access to views
GRANT SELECT ON public.active_orders_summary TO authenticated;
GRANT SELECT ON public.low_stock_items TO authenticated;
GRANT SELECT ON public.driver_fleet_status TO authenticated;

-- ============================================================================
-- SCHEMA VERSION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT NOW(),
  description TEXT
);

INSERT INTO public.schema_migrations (version, description)
VALUES ('1.0.0-enterprise', 'Initial enterprise schema with multi-tenancy, RLS, and compliance')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Next Steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Run scripts/COMPLETE_SUPABASE_SETUP.sql for seed data
-- 3. Configure Realtime subscriptions in Supabase dashboard
-- 4. Set environment variables in Vercel
-- 5. Deploy Edge Functions to Supabase
-- ============================================================================
