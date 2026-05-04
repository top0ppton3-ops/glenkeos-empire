-- ================================================================
-- GLENKEOS HIERARCHICAL MULTI-TENANT RLS POLICIES
-- Corporate Parent (glenkeos) + Brand Children (chic-on-chain, ghetto-eats, goldkey)
-- ================================================================

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Get user's primary tenant from JWT
CREATE OR REPLACE FUNCTION auth.user_tenant_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'tenant_id',
    'public' -- default for non-authenticated or missing metadata
  );
$$ LANGUAGE SQL STABLE;

-- Check if user has corporate access (can see all brands)
CREATE OR REPLACE FUNCTION auth.has_corporate_access()
RETURNS BOOLEAN AS $$
  SELECT 
    (auth.jwt() -> 'app_metadata' ->> 'tenant_access') LIKE '%glenkeos%'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'tenant_id') = 'glenkeos';
$$ LANGUAGE SQL STABLE;

-- Get customer_id from authenticated user
CREATE OR REPLACE FUNCTION auth.customer_id()
RETURNS TEXT AS $$
  SELECT customer_id 
  FROM public.customers 
  WHERE cognito_sub = auth.uid()::text
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ================================================================
-- CUSTOMERS (Owner-based: users own their own customer record)
-- ================================================================

DROP POLICY IF EXISTS customers_select ON public.customers;
DROP POLICY IF EXISTS customers_insert ON public.customers;
DROP POLICY IF EXISTS customers_update ON public.customers;
DROP POLICY IF EXISTS customers_delete ON public.customers;

CREATE POLICY customers_select ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    cognito_sub = auth.uid()::text -- Customer sees their own record
    OR auth.has_corporate_access() -- Corporate admin sees all
  );

CREATE POLICY customers_insert ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    cognito_sub = auth.uid()::text -- Can only create for self
  );

CREATE POLICY customers_update ON public.customers
  FOR UPDATE
  TO authenticated
  USING (cognito_sub = auth.uid()::text)
  WITH CHECK (cognito_sub = auth.uid()::text);

CREATE POLICY customers_delete ON public.customers
  FOR DELETE
  TO authenticated
  USING (
    cognito_sub = auth.uid()::text
    OR auth.has_corporate_access()
  );

-- ================================================================
-- CUSTOMER_ADDRESSES (Owner-based via customer_id)
-- ================================================================

DROP POLICY IF EXISTS customer_addresses_select ON public.customer_addresses;
DROP POLICY IF EXISTS customer_addresses_insert ON public.customer_addresses;
DROP POLICY IF EXISTS customer_addresses_update ON public.customer_addresses;
DROP POLICY IF EXISTS customer_addresses_delete ON public.customer_addresses;

CREATE POLICY customer_addresses_select ON public.customer_addresses
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.customer_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY customer_addresses_insert ON public.customer_addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.customer_id());

CREATE POLICY customer_addresses_update ON public.customer_addresses
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.customer_id())
  WITH CHECK (customer_id = auth.customer_id());

CREATE POLICY customer_addresses_delete ON public.customer_addresses
  FOR DELETE
  TO authenticated
  USING (customer_id = auth.customer_id());

-- ================================================================
-- ORDERS (Hybrid: owner-based for customers + tenant-based for staff)
-- ================================================================

DROP POLICY IF EXISTS orders_select ON public.orders;
DROP POLICY IF EXISTS orders_insert ON public.orders;
DROP POLICY IF EXISTS orders_update ON public.orders;
DROP POLICY IF EXISTS orders_delete ON public.orders;

CREATE POLICY orders_select ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.customer_id() -- Customer sees their orders
    OR tenant_id = auth.user_tenant_id() -- Brand staff sees their tenant's orders
    OR auth.has_corporate_access() -- Corporate sees all
  );

CREATE POLICY orders_insert ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.customer_id() -- Customers create their own orders
    OR tenant_id = auth.user_tenant_id() -- Staff creates for their tenant
    OR auth.has_corporate_access()
  );

CREATE POLICY orders_update ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  )
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY orders_delete ON public.orders
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access()); -- Only corporate can delete

-- ================================================================
-- ORDER_ITEMS (Linked to orders, inherit order access)
-- ================================================================

DROP POLICY IF EXISTS order_items_select ON public.order_items;
DROP POLICY IF EXISTS order_items_insert ON public.order_items;
DROP POLICY IF EXISTS order_items_update ON public.order_items;
DROP POLICY IF EXISTS order_items_delete ON public.order_items;

CREATE POLICY order_items_select ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_id = order_items.order_id
      AND (
        o.customer_id = auth.customer_id()
        OR o.tenant_id = auth.user_tenant_id()
        OR auth.has_corporate_access()
      )
    )
  );

CREATE POLICY order_items_insert ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_id = order_items.order_id
      AND (
        o.customer_id = auth.customer_id()
        OR o.tenant_id = auth.user_tenant_id()
        OR auth.has_corporate_access()
      )
    )
  );

CREATE POLICY order_items_update ON public.order_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_id = order_items.order_id
      AND (o.tenant_id = auth.user_tenant_id() OR auth.has_corporate_access())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_id = order_items.order_id
      AND (o.tenant_id = auth.user_tenant_id() OR auth.has_corporate_access())
    )
  );

CREATE POLICY order_items_delete ON public.order_items
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- PAYMENTS (Linked to orders via customer)
-- ================================================================

DROP POLICY IF EXISTS payments_select ON public.payments;
DROP POLICY IF EXISTS payments_insert ON public.payments;
DROP POLICY IF EXISTS payments_update ON public.payments;
DROP POLICY IF EXISTS payments_delete ON public.payments;

CREATE POLICY payments_select ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.customer_id()
    OR tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY payments_insert ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.customer_id()
    OR tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY payments_update ON public.payments
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  )
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY payments_delete ON public.payments
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- DRIVERS (Tenant-scoped + self-access)
-- ================================================================

DROP POLICY IF EXISTS drivers_select ON public.drivers;
DROP POLICY IF EXISTS drivers_insert ON public.drivers;
DROP POLICY IF EXISTS drivers_update ON public.drivers;
DROP POLICY IF EXISTS drivers_delete ON public.drivers;

CREATE POLICY drivers_select ON public.drivers
  FOR SELECT
  TO authenticated
  USING (
    driver_id = auth.uid()::text -- Driver sees own record
    OR tenant_id = auth.user_tenant_id() -- Brand staff sees their drivers
    OR auth.has_corporate_access()
  );

CREATE POLICY drivers_insert ON public.drivers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY drivers_update ON public.drivers
  FOR UPDATE
  TO authenticated
  USING (
    driver_id = auth.uid()::text -- Driver updates own record
    OR tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  )
  WITH CHECK (
    driver_id = auth.uid()::text
    OR tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY drivers_delete ON public.drivers
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- DRIVER_LOCATIONS (Tenant-scoped)
-- ================================================================

DROP POLICY IF EXISTS driver_locations_select ON public.driver_locations;
DROP POLICY IF EXISTS driver_locations_insert ON public.driver_locations;
DROP POLICY IF EXISTS driver_locations_update ON public.driver_locations;
DROP POLICY IF EXISTS driver_locations_delete ON public.driver_locations;

CREATE POLICY driver_locations_select ON public.driver_locations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.driver_id = driver_locations.driver_id
      AND (
        d.driver_id = auth.uid()::text
        OR d.tenant_id = auth.user_tenant_id()
        OR auth.has_corporate_access()
      )
    )
  );

CREATE POLICY driver_locations_insert ON public.driver_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.driver_id = driver_locations.driver_id
      AND (d.driver_id = auth.uid()::text OR auth.has_corporate_access())
    )
  );

CREATE POLICY driver_locations_update ON public.driver_locations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.driver_id = driver_locations.driver_id
      AND (d.driver_id = auth.uid()::text OR auth.has_corporate_access())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.driver_id = driver_locations.driver_id
      AND (d.driver_id = auth.uid()::text OR auth.has_corporate_access())
    )
  );

CREATE POLICY driver_locations_delete ON public.driver_locations
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- STAFF (Tenant-scoped + self-access)
-- ================================================================

DROP POLICY IF EXISTS staff_select ON public.staff;
DROP POLICY IF EXISTS staff_insert ON public.staff;
DROP POLICY IF EXISTS staff_update ON public.staff;
DROP POLICY IF EXISTS staff_delete ON public.staff;

CREATE POLICY staff_select ON public.staff
  FOR SELECT
  TO authenticated
  USING (
    staff_id = auth.uid()::text
    OR tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY staff_insert ON public.staff
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY staff_update ON public.staff
  FOR UPDATE
  TO authenticated
  USING (
    staff_id = auth.uid()::text
    OR tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  )
  WITH CHECK (
    staff_id = auth.uid()::text
    OR tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY staff_delete ON public.staff
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- SHIFTS (Tenant-scoped via staff)
-- ================================================================

DROP POLICY IF EXISTS shifts_select ON public.shifts;
DROP POLICY IF EXISTS shifts_insert ON public.shifts;
DROP POLICY IF EXISTS shifts_update ON public.shifts;
DROP POLICY IF EXISTS shifts_delete ON public.shifts;

CREATE POLICY shifts_select ON public.shifts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.staff_id = shifts.staff_id
      AND (
        s.staff_id = auth.uid()::text
        OR s.tenant_id = auth.user_tenant_id()
        OR auth.has_corporate_access()
      )
    )
  );

CREATE POLICY shifts_insert ON public.shifts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.staff_id = shifts.staff_id
      AND (s.tenant_id = auth.user_tenant_id() OR auth.has_corporate_access())
    )
  );

CREATE POLICY shifts_update ON public.shifts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.staff_id = shifts.staff_id
      AND (
        s.staff_id = auth.uid()::text
        OR s.tenant_id = auth.user_tenant_id()
        OR auth.has_corporate_access()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.staff_id = shifts.staff_id
      AND (s.tenant_id = auth.user_tenant_id() OR auth.has_corporate_access())
    )
  );

CREATE POLICY shifts_delete ON public.shifts
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- LOYALTY_ACCOUNTS (Owner-based via customer)
-- ================================================================

DROP POLICY IF EXISTS loyalty_accounts_select ON public.loyalty_accounts;
DROP POLICY IF EXISTS loyalty_accounts_insert ON public.loyalty_accounts;
DROP POLICY IF EXISTS loyalty_accounts_update ON public.loyalty_accounts;
DROP POLICY IF EXISTS loyalty_accounts_delete ON public.loyalty_accounts;

CREATE POLICY loyalty_accounts_select ON public.loyalty_accounts
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.customer_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY loyalty_accounts_insert ON public.loyalty_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.customer_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY loyalty_accounts_update ON public.loyalty_accounts
  FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.customer_id()
    OR auth.has_corporate_access()
  )
  WITH CHECK (
    customer_id = auth.customer_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY loyalty_accounts_delete ON public.loyalty_accounts
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- LOYALTY_TRANSACTIONS (Owner-based via customer)
-- ================================================================

DROP POLICY IF EXISTS loyalty_transactions_select ON public.loyalty_transactions;
DROP POLICY IF EXISTS loyalty_transactions_insert ON public.loyalty_transactions;
DROP POLICY IF EXISTS loyalty_transactions_update ON public.loyalty_transactions;
DROP POLICY IF EXISTS loyalty_transactions_delete ON public.loyalty_transactions;

CREATE POLICY loyalty_transactions_select ON public.loyalty_transactions
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.customer_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY loyalty_transactions_insert ON public.loyalty_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.customer_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY loyalty_transactions_update ON public.loyalty_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.has_corporate_access());

CREATE POLICY loyalty_transactions_delete ON public.loyalty_transactions
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- NOTIFICATIONS (Owner-based via customer + order linkage)
-- ================================================================

DROP POLICY IF EXISTS notifications_select ON public.notifications;
DROP POLICY IF EXISTS notifications_insert ON public.notifications;
DROP POLICY IF EXISTS notifications_update ON public.notifications;
DROP POLICY IF EXISTS notifications_delete ON public.notifications;

CREATE POLICY notifications_select ON public.notifications
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.customer_id()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_id = notifications.order_id
      AND (o.tenant_id = auth.user_tenant_id() OR auth.has_corporate_access())
    )
    OR auth.has_corporate_access()
  );

CREATE POLICY notifications_insert ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.has_corporate_access()); -- Only system/corporate creates notifications

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.has_corporate_access())
  WITH CHECK (auth.has_corporate_access());

CREATE POLICY notifications_delete ON public.notifications
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- SECURITY_EVENTS (Corporate-only access)
-- ================================================================

DROP POLICY IF EXISTS security_events_select ON public.security_events;
DROP POLICY IF EXISTS security_events_insert ON public.security_events;
DROP POLICY IF EXISTS security_events_update ON public.security_events;
DROP POLICY IF EXISTS security_events_delete ON public.security_events;

CREATE POLICY security_events_select ON public.security_events
  FOR SELECT
  TO authenticated
  USING (auth.has_corporate_access());

CREATE POLICY security_events_insert ON public.security_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.has_corporate_access());

CREATE POLICY security_events_update ON public.security_events
  FOR UPDATE
  TO authenticated
  USING (auth.has_corporate_access())
  WITH CHECK (auth.has_corporate_access());

CREATE POLICY security_events_delete ON public.security_events
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- STORES (Tenant-scoped, read-only for customers)
-- ================================================================

DROP POLICY IF EXISTS stores_select ON public.stores;
DROP POLICY IF EXISTS stores_insert ON public.stores;
DROP POLICY IF EXISTS stores_update ON public.stores;
DROP POLICY IF EXISTS stores_delete ON public.stores;

CREATE POLICY stores_select ON public.stores
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'customer' -- Customers can browse stores
  );

CREATE POLICY stores_insert ON public.stores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY stores_update ON public.stores
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  )
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );

CREATE POLICY stores_delete ON public.stores
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- MENU_ITEMS (Brand-scoped, read-only for customers)
-- ================================================================

DROP POLICY IF EXISTS menu_items_select ON public.menu_items;
DROP POLICY IF EXISTS menu_items_insert ON public.menu_items;
DROP POLICY IF EXISTS menu_items_update ON public.menu_items;
DROP POLICY IF EXISTS menu_items_delete ON public.menu_items;

CREATE POLICY menu_items_select ON public.menu_items
  FOR SELECT
  TO authenticated
  USING (true); -- All authenticated users can browse menu items

CREATE POLICY menu_items_insert ON public.menu_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.has_corporate_access()); -- Only corporate can add menu items

CREATE POLICY menu_items_update ON public.menu_items
  FOR UPDATE
  TO authenticated
  USING (auth.has_corporate_access())
  WITH CHECK (auth.has_corporate_access());

CREATE POLICY menu_items_delete ON public.menu_items
  FOR DELETE
  TO authenticated
  USING (auth.has_corporate_access());

-- ================================================================
-- COMPLETION LOG
-- ================================================================

COMMENT ON FUNCTION auth.user_tenant_id IS 'Returns the authenticated user primary tenant_id from JWT app_metadata';
COMMENT ON FUNCTION auth.has_corporate_access IS 'Returns true if user has glenkeos parent tenant access';
COMMENT ON FUNCTION auth.customer_id IS 'Returns customer_id for authenticated customer users';

-- Migration complete!
-- Next step: Add app_metadata to user JWTs with tenant_id and tenant_access
