-- Delivery Engine
-- Logistics brain of the empire

-- Enums
CREATE TYPE delivery_status AS ENUM ('pending', 'assigned', 'picked_up', 'en_route', 'delivered', 'failed');

-- Delivery Zones Table
CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id TEXT NOT NULL,
  location_id UUID,
  name TEXT NOT NULL,
  polygon JSONB,
  base_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  per_mile_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deliveries Table
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  driver_id UUID REFERENCES auth.users(id),
  status delivery_status NOT NULL DEFAULT 'pending',
  eta TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_location JSONB,
  delivery_fee DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_delivery_zones_brand_location ON delivery_zones(brand_id, location_id);
CREATE INDEX idx_delivery_zones_active ON delivery_zones(active);
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- RLS Policies
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Managers can see/edit zones for their locations
CREATE POLICY "Managers manage location zones"
ON delivery_zones FOR ALL
USING (
  location_id IN (
    SELECT id FROM locations WHERE manager_id = auth.uid()
  )
);

-- Customers can see zones (for fee calculation)
CREATE POLICY "Customers see zones"
ON delivery_zones FOR SELECT
USING (active = true);

-- Drivers can see their own deliveries
CREATE POLICY "Drivers see own deliveries"
ON deliveries FOR SELECT
USING (auth.uid() = driver_id);

-- Drivers can update their own deliveries
CREATE POLICY "Drivers update own deliveries"
ON deliveries FOR UPDATE
USING (auth.uid() = driver_id);

-- Managers can see deliveries for their location
CREATE POLICY "Managers see location deliveries"
ON deliveries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM locations WHERE manager_id = auth.uid()
  )
);

-- Managers can create/update deliveries
CREATE POLICY "Managers manage deliveries"
ON deliveries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM locations WHERE manager_id = auth.uid()
  )
);

-- RPCs
CREATE OR REPLACE FUNCTION resolve_delivery(
  p_address TEXT,
  p_brand_id TEXT,
  p_location_id UUID
)
RETURNS TABLE (
  zone_id UUID,
  zone_name TEXT,
  base_fee DECIMAL,
  per_mile_fee DECIMAL,
  total_fee DECIMAL,
  estimated_eta TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_zone RECORD;
  v_distance_miles DECIMAL := 3.5; -- Mock distance calculation
BEGIN
  -- Find active zone for location
  -- In production, this would use PostGIS for polygon matching
  SELECT * INTO v_zone
  FROM delivery_zones
  WHERE brand_id = p_brand_id
  AND (location_id = p_location_id OR location_id IS NULL)
  AND active = true
  LIMIT 1;

  IF v_zone IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Calculate total fee
  RETURN QUERY
  SELECT
    v_zone.id,
    v_zone.name,
    v_zone.base_fee,
    v_zone.per_mile_fee,
    v_zone.base_fee + (v_zone.per_mile_fee * v_distance_miles),
    NOW() + INTERVAL '30 minutes';
END;
$$;

CREATE OR REPLACE FUNCTION create_delivery(
  p_order_id UUID,
  p_delivery_fee DECIMAL DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_delivery_id UUID;
BEGIN
  INSERT INTO deliveries (order_id, status, delivery_fee, eta)
  VALUES (p_order_id, 'pending', p_delivery_fee, NOW() + INTERVAL '30 minutes')
  RETURNING id INTO v_delivery_id;

  RETURN v_delivery_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_delivery_status(
  p_delivery_id UUID,
  p_status delivery_status,
  p_eta TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE deliveries
  SET
    status = p_status,
    eta = COALESCE(p_eta, eta),
    started_at = CASE WHEN p_status = 'en_route' AND started_at IS NULL THEN NOW() ELSE started_at END,
    completed_at = CASE WHEN p_status IN ('delivered', 'failed') AND completed_at IS NULL THEN NOW() ELSE completed_at END,
    updated_at = NOW()
  WHERE id = p_delivery_id;
END;
$$;

CREATE OR REPLACE FUNCTION assign_driver_to_delivery(
  p_delivery_id UUID,
  p_driver_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE deliveries
  SET driver_id = p_driver_id, status = 'assigned', updated_at = NOW()
  WHERE id = p_delivery_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_driver_deliveries(p_driver_id UUID)
RETURNS TABLE (
  id UUID,
  order_id UUID,
  driver_id UUID,
  status delivery_status,
  eta TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  delivery_fee DECIMAL,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.order_id, d.driver_id, d.status, d.eta, d.started_at, d.completed_at, d.delivery_fee, d.created_at
  FROM deliveries d
  WHERE d.driver_id = p_driver_id
  AND d.status IN ('assigned', 'picked_up', 'en_route')
  ORDER BY d.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION update_delivery_location(
  p_delivery_id UUID,
  p_latitude DECIMAL,
  p_longitude DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE deliveries
  SET
    last_location = jsonb_build_object(
      'latitude', p_latitude,
      'longitude', p_longitude,
      'timestamp', NOW()
    ),
    updated_at = NOW()
  WHERE id = p_delivery_id;
END;
$$;

-- Insert default delivery zones
INSERT INTO delivery_zones (brand_id, name, base_fee, per_mile_fee, active)
VALUES
  ('ghetto-eats', 'Downtown Zone', 4.99, 1.50, true),
  ('ghetto-eats', 'Suburban Zone', 3.99, 2.00, true),
  ('chic-on-chain', 'Downtown Zone', 5.99, 1.75, true),
  ('chic-on-chain', 'Suburban Zone', 4.99, 2.25, true),
  ('goldkey', 'Premium Zone', 0.00, 0.00, true);
