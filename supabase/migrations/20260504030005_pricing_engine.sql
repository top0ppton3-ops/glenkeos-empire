-- Pricing Engine
-- Server-side pricing calculation (Frontend NEVER calculates prices)

-- Pricing Rules Table
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id TEXT,
  location_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'happy_hour', 'time_window', 'day_of_week', 'surge', 'discount'
  modifier_type TEXT NOT NULL, -- 'percentage', 'absolute'
  modifier_value DECIMAL(10, 2) NOT NULL,
  start_time TIME,
  end_time TIME,
  days TEXT[], -- ['monday', 'tuesday', ...]
  applies_to TEXT NOT NULL DEFAULT 'all', -- 'all', 'category', 'item'
  target_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promotions Table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id TEXT,
  location_id UUID,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'percentage', 'absolute', 'bogo', 'free_delivery'
  value DECIMAL(10, 2) NOT NULL,
  min_subtotal DECIMAL(10, 2),
  max_uses INTEGER,
  max_uses_per_user INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  loyalty_tier_required TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promo Usage Tracking
CREATE TABLE promo_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_id UUID NOT NULL REFERENCES promotions(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pricing_rules_brand ON pricing_rules(brand_id);
CREATE INDEX idx_pricing_rules_location ON pricing_rules(location_id);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(active);
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_active ON promotions(active);
CREATE INDEX idx_promo_usage_user ON promo_usage(user_id);
CREATE INDEX idx_promo_usage_promo ON promo_usage(promo_id);

-- RLS Policies
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_usage ENABLE ROW LEVEL SECURITY;

-- Managers can manage pricing rules for their locations
CREATE POLICY "Managers manage location pricing rules"
ON pricing_rules FOR ALL
USING (
  location_id IN (
    SELECT id FROM locations WHERE manager_id = auth.uid()
  )
);

-- Corporate can manage brand-level pricing rules
CREATE POLICY "Corporate manages brand pricing rules"
ON pricing_rules FOR ALL
USING (
  brand_id IS NOT NULL AND location_id IS NULL
  AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'corporate'
  )
);

-- Managers can manage promotions for their locations
CREATE POLICY "Managers manage location promotions"
ON promotions FOR ALL
USING (
  location_id IN (
    SELECT id FROM locations WHERE manager_id = auth.uid()
  )
);

-- Corporate can manage brand-level promotions
CREATE POLICY "Corporate manages brand promotions"
ON promotions FOR ALL
USING (
  brand_id IS NOT NULL AND location_id IS NULL
  AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'corporate'
  )
);

-- Users can see active promotions
CREATE POLICY "Users see active promotions"
ON promotions FOR SELECT
USING (active = true);

-- Core Pricing Engine RPC: resolve_menu
-- Returns menu items with effective prices after applying pricing rules
CREATE OR REPLACE FUNCTION resolve_menu(
  p_brand_id TEXT,
  p_location_id UUID
)
RETURNS TABLE (
  item_id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  base_price DECIMAL,
  effective_price DECIMAL,
  available BOOLEAN,
  dietary_tags TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- In production, this would:
  -- 1. Get all menu items for brand
  -- 2. Apply location overrides
  -- 3. Apply pricing rules (brand-level then location-level)
  -- 4. Check sold-out status
  -- 5. Return resolved menu with effective prices

  -- Mock implementation for now
  RETURN QUERY
  SELECT
    gen_random_uuid() as item_id,
    'Sample Item' as name,
    'Description' as description,
    'Main' as category,
    10.00::DECIMAL as base_price,
    10.00::DECIMAL as effective_price,
    true as available,
    ARRAY['vegetarian']::TEXT[] as dietary_tags;
END;
$$;

-- Core Pricing Engine RPC: resolve_pricing
-- Calculates final order total with all discounts, fees, and taxes
CREATE OR REPLACE FUNCTION resolve_pricing(
  p_cart JSONB,
  p_user_id UUID,
  p_location_id UUID,
  p_promo_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  subtotal DECIMAL,
  promo_discount DECIMAL,
  loyalty_discount DECIMAL,
  delivery_fee DECIMAL,
  service_fee DECIMAL,
  tax DECIMAL,
  total DECIMAL,
  promo_code_applied TEXT,
  loyalty_points_earned INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subtotal DECIMAL := 0;
  v_promo_discount DECIMAL := 0;
  v_loyalty_discount DECIMAL := 0;
  v_delivery_fee DECIMAL := 0;
  v_service_fee DECIMAL := 0;
  v_tax DECIMAL := 0;
  v_total DECIMAL := 0;
  v_promo_code_applied TEXT := NULL;
  v_loyalty_points_earned INTEGER := 0;
  v_promo RECORD;
  v_cart_item JSONB;
BEGIN
  -- Calculate subtotal from cart
  FOR v_cart_item IN SELECT * FROM jsonb_array_elements(p_cart)
  LOOP
    v_subtotal := v_subtotal + ((v_cart_item->>'price')::DECIMAL * (v_cart_item->>'quantity')::INTEGER);
  END LOOP;

  -- Apply promo code if provided
  IF p_promo_code IS NOT NULL THEN
    SELECT * INTO v_promo
    FROM promotions
    WHERE code = p_promo_code
    AND active = true
    AND start_date <= NOW()
    AND end_date >= NOW()
    AND (min_subtotal IS NULL OR v_subtotal >= min_subtotal)
    LIMIT 1;

    IF v_promo IS NOT NULL THEN
      -- Check usage limits
      IF (v_promo.max_uses IS NULL OR v_promo.uses_count < v_promo.max_uses) AND
         (v_promo.max_uses_per_user IS NULL OR
          (SELECT COUNT(*) FROM promo_usage WHERE promo_id = v_promo.id AND user_id = p_user_id) < v_promo.max_uses_per_user)
      THEN
        IF v_promo.type = 'percentage' THEN
          v_promo_discount := v_subtotal * (v_promo.value / 100);
        ELSIF v_promo.type = 'absolute' THEN
          v_promo_discount := v_promo.value;
        END IF;
        v_promo_code_applied := p_promo_code;
      END IF;
    END IF;
  END IF;

  -- Apply loyalty discount (mock - in production, fetch loyalty tier)
  -- v_loyalty_discount := v_subtotal * 0.05; -- 5% for VIP tier

  -- Calculate fees
  v_delivery_fee := 5.99; -- Mock - in production, use resolve_delivery
  v_service_fee := v_subtotal * 0.05; -- 5% service fee

  -- Calculate tax (mock - 8.5%)
  v_tax := (v_subtotal - v_promo_discount - v_loyalty_discount + v_delivery_fee + v_service_fee) * 0.085;

  -- Calculate total
  v_total := v_subtotal - v_promo_discount - v_loyalty_discount + v_delivery_fee + v_service_fee + v_tax;

  -- Calculate loyalty points earned (1 point per dollar)
  v_loyalty_points_earned := FLOOR(v_subtotal);

  RETURN QUERY
  SELECT
    v_subtotal,
    v_promo_discount,
    v_loyalty_discount,
    v_delivery_fee,
    v_service_fee,
    v_tax,
    v_total,
    v_promo_code_applied,
    v_loyalty_points_earned;
END;
$$;

-- Validate promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_user_id UUID,
  p_subtotal DECIMAL
)
RETURNS TABLE (
  valid BOOLEAN,
  promo_id UUID,
  discount_type TEXT,
  discount_value DECIMAL,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo RECORD;
  v_user_uses INTEGER;
BEGIN
  -- Find promo
  SELECT * INTO v_promo
  FROM promotions
  WHERE code = p_code
  AND active = true;

  -- Not found
  IF v_promo IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'Invalid promo code'::TEXT;
    RETURN;
  END IF;

  -- Check date range
  IF v_promo.start_date > NOW() THEN
    RETURN QUERY SELECT false, v_promo.id, NULL::TEXT, NULL::DECIMAL, 'Promo not started yet'::TEXT;
    RETURN;
  END IF;

  IF v_promo.end_date < NOW() THEN
    RETURN QUERY SELECT false, v_promo.id, NULL::TEXT, NULL::DECIMAL, 'Promo expired'::TEXT;
    RETURN;
  END IF;

  -- Check min subtotal
  IF v_promo.min_subtotal IS NOT NULL AND p_subtotal < v_promo.min_subtotal THEN
    RETURN QUERY SELECT false, v_promo.id, NULL::TEXT, NULL::DECIMAL,
      'Minimum order of $' || v_promo.min_subtotal || ' required'::TEXT;
    RETURN;
  END IF;

  -- Check max uses
  IF v_promo.max_uses IS NOT NULL AND v_promo.uses_count >= v_promo.max_uses THEN
    RETURN QUERY SELECT false, v_promo.id, NULL::TEXT, NULL::DECIMAL, 'Promo usage limit reached'::TEXT;
    RETURN;
  END IF;

  -- Check per-user limit
  IF v_promo.max_uses_per_user IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_uses
    FROM promo_usage
    WHERE promo_id = v_promo.id AND user_id = p_user_id;

    IF v_user_uses >= v_promo.max_uses_per_user THEN
      RETURN QUERY SELECT false, v_promo.id, NULL::TEXT, NULL::DECIMAL, 'You have already used this promo'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Valid!
  RETURN QUERY SELECT true, v_promo.id, v_promo.type, v_promo.value, 'Valid'::TEXT;
END;
$$;

-- Record promo usage
CREATE OR REPLACE FUNCTION record_promo_usage(
  p_promo_id UUID,
  p_user_id UUID,
  p_order_id UUID,
  p_discount_amount DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert usage record
  INSERT INTO promo_usage (promo_id, user_id, order_id, discount_amount)
  VALUES (p_promo_id, p_user_id, p_order_id, p_discount_amount);

  -- Increment uses count
  UPDATE promotions
  SET uses_count = uses_count + 1
  WHERE id = p_promo_id;
END;
$$;
