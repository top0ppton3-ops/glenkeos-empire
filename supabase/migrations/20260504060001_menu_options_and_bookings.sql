-- Menu Options and Bookings
-- Completes the enterprise data model with menu customization and GoldKey bookings

-- ============================================
-- MENU OPTION GROUPS
-- ============================================
CREATE TABLE IF NOT EXISTS menu_option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_select INTEGER DEFAULT 0,
  max_select INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_option_groups_item ON menu_option_groups(item_id);
CREATE INDEX IF NOT EXISTS idx_menu_option_groups_sort ON menu_option_groups(item_id, sort_order);

COMMENT ON TABLE menu_option_groups IS 'Customization groups for menu items (Size, Add-ons, Extras, etc.)';
COMMENT ON COLUMN menu_option_groups.min_select IS 'Minimum number of options user must select';
COMMENT ON COLUMN menu_option_groups.max_select IS 'Maximum number of options user can select';

-- ============================================
-- MENU OPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS menu_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES menu_option_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_delta DECIMAL(10,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_options_group ON menu_options(group_id);
CREATE INDEX IF NOT EXISTS idx_menu_options_sort ON menu_options(group_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_options_available ON menu_options(available);

COMMENT ON TABLE menu_options IS 'Individual options within option groups (Small/Medium/Large, Extra Cheese, etc.)';
COMMENT ON COLUMN menu_options.price_delta IS 'Price adjustment (can be positive or negative)';

-- ============================================
-- ORDER ITEM OPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS order_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES menu_options(id),
  group_name_snapshot TEXT NOT NULL,
  option_name_snapshot TEXT NOT NULL,
  price_delta_snapshot DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_item_options_item ON order_item_options(order_item_id);

COMMENT ON TABLE order_item_options IS 'Immutable snapshot of selected options at order time';
COMMENT ON COLUMN order_item_options.group_name_snapshot IS 'Option group name frozen at order time';
COMMENT ON COLUMN order_item_options.option_name_snapshot IS 'Option name frozen at order time';

-- ============================================
-- BOOKINGS (GOLDKEY)
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  brand_id UUID NOT NULL,
  location_id UUID NOT NULL,
  service_id UUID,
  service_name TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  guest_count INTEGER DEFAULT 1,
  special_requests TEXT,
  price_snapshot JSONB NOT NULL DEFAULT '{}',
  assigned_staff_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_brand ON bookings(brand_id);
CREATE INDEX IF NOT EXISTS idx_bookings_location ON bookings(location_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_staff ON bookings(assigned_staff_id);

COMMENT ON TABLE bookings IS 'Service bookings for GoldKey luxury experiences';
COMMENT ON COLUMN bookings.service_id IS 'Type of service (massage, dining, spa, etc.)';
COMMENT ON COLUMN bookings.price_snapshot IS 'Immutable pricing snapshot at booking time';

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE menu_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Menu option groups: public read
CREATE POLICY "Public read menu option groups"
ON menu_option_groups FOR SELECT
USING (true);

CREATE POLICY "Staff manage menu option groups"
ON menu_option_groups FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('manager', 'corporate', 'executive')
  )
);

-- Menu options: public read
CREATE POLICY "Public read menu options"
ON menu_options FOR SELECT
USING (true);

CREATE POLICY "Staff manage menu options"
ON menu_options FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('manager', 'corporate', 'executive')
  )
);

-- Order item options: users view own
CREATE POLICY "Users view own order item options"
ON order_item_options FOR SELECT
USING (
  order_item_id IN (
    SELECT id FROM order_items WHERE order_id IN (
      SELECT order_id FROM orders WHERE customer_id = auth.uid()::text
    )
  )
);

CREATE POLICY "Service creates order item options"
ON order_item_options FOR INSERT
WITH CHECK (true);

-- Bookings: users manage own
CREATE POLICY "Users view own bookings"
ON bookings FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users create own bookings"
ON bookings FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own bookings"
ON bookings FOR UPDATE
USING (user_id = auth.uid());

-- Staff view/manage location bookings
CREATE POLICY "Staff view location bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('employee', 'manager', 'corporate', 'executive')
  )
);

CREATE POLICY "Staff manage location bookings"
ON bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('manager', 'corporate', 'executive')
  )
);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Create booking with validation
CREATE OR REPLACE FUNCTION create_booking(
  p_user_id UUID,
  p_brand_id UUID,
  p_location_id UUID,
  p_service_id UUID,
  p_service_name TEXT,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_guest_count INTEGER,
  p_special_requests TEXT,
  p_price_snapshot JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id UUID;
BEGIN
  -- Validate time slot
  IF p_start_time >= p_end_time THEN
    RAISE EXCEPTION 'End time must be after start time';
  END IF;

  -- Create booking
  INSERT INTO bookings (
    user_id,
    brand_id,
    location_id,
    service_id,
    service_name,
    start_time,
    end_time,
    status,
    guest_count,
    special_requests,
    price_snapshot
  )
  VALUES (
    p_user_id,
    p_brand_id,
    p_location_id,
    p_service_id,
    p_service_name,
    p_start_time,
    p_end_time,
    'pending',
    p_guest_count,
    p_special_requests,
    p_price_snapshot
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- Confirm booking
CREATE OR REPLACE FUNCTION confirm_booking(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bookings
  SET
    status = 'confirmed',
    confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_booking_id;
END;
$$;

-- Complete booking
CREATE OR REPLACE FUNCTION complete_booking(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bookings
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_booking_id;
END;
$$;

-- Cancel booking
CREATE OR REPLACE FUNCTION cancel_booking(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bookings
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_booking_id;
END;
$$;

-- Assign staff to booking
CREATE OR REPLACE FUNCTION assign_booking_staff(
  p_booking_id UUID,
  p_staff_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bookings
  SET
    assigned_staff_id = p_staff_id,
    updated_at = NOW()
  WHERE id = p_booking_id;
END;
$$;

-- Get user bookings
CREATE OR REPLACE FUNCTION get_user_bookings(
  p_user_id UUID,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  brand_id UUID,
  location_id UUID,
  service_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  guest_count INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.brand_id,
    b.location_id,
    b.service_name,
    b.start_time,
    b.end_time,
    b.status,
    b.guest_count,
    b.created_at
  FROM bookings b
  WHERE b.user_id = p_user_id
  AND (p_status IS NULL OR b.status = p_status)
  ORDER BY b.start_time DESC;
END;
$$;
