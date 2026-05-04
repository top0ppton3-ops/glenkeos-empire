-- Order Snapshotting
-- Immutable JSONB snapshots of menu items frozen at order time
-- Ensures order integrity even if menu changes

-- Add snapshot column to orders table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'items_snapshot'
  ) THEN
    ALTER TABLE orders ADD COLUMN items_snapshot JSONB NOT NULL DEFAULT '[]';
  END IF;
END $$;

-- Add snapshot column to order_items (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'item_snapshot'
  ) THEN
    ALTER TABLE order_items ADD COLUMN item_snapshot JSONB NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- Create index for snapshot queries
CREATE INDEX IF NOT EXISTS idx_orders_items_snapshot ON orders USING GIN (items_snapshot);

-- Function to create order with snapshot
CREATE OR REPLACE FUNCTION create_order_with_snapshot(
  p_customer_id UUID,
  p_tenant_id UUID,
  p_location_id UUID,
  p_items JSONB,
  p_pricing JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- Create order with items snapshot
  INSERT INTO orders (
    customer_id,
    tenant_id,
    location_id,
    items_snapshot,
    status,
    subtotal,
    total,
    created_at
  )
  VALUES (
    p_customer_id,
    p_tenant_id,
    p_location_id,
    p_items,
    'pending',
    (p_pricing->>'subtotal')::DECIMAL,
    (p_pricing->>'total')::DECIMAL,
    NOW()
  )
  RETURNING order_id INTO v_order_id;

  -- Create order_items with individual snapshots
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      menu_item_id,
      item_snapshot,
      quantity,
      price
    )
    VALUES (
      v_order_id,
      (v_item->>'item_id')::UUID,
      v_item,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::DECIMAL
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- Function to get order with snapshots
CREATE OR REPLACE FUNCTION get_order_with_snapshots(p_order_id UUID)
RETURNS TABLE (
  order_id UUID,
  customer_id UUID,
  tenant_id UUID,
  location_id UUID,
  status TEXT,
  items_snapshot JSONB,
  subtotal DECIMAL,
  total DECIMAL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.order_id,
    o.customer_id,
    o.tenant_id,
    o.location_id,
    o.status,
    o.items_snapshot,
    o.subtotal,
    o.total,
    o.created_at,
    o.updated_at
  FROM orders o
  WHERE o.order_id = p_order_id;
END;
$$;

-- Trigger to ensure snapshots are immutable
CREATE OR REPLACE FUNCTION prevent_snapshot_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.items_snapshot IS DISTINCT FROM NEW.items_snapshot THEN
    RAISE EXCEPTION 'Order snapshots are immutable and cannot be modified';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_orders_snapshot_change
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION prevent_snapshot_modification();

-- Comment explaining the snapshot architecture
COMMENT ON COLUMN orders.items_snapshot IS 'Immutable JSONB snapshot of all menu items at order time. Preserves pricing, options, and item details even if menu changes.';
COMMENT ON COLUMN order_items.item_snapshot IS 'Immutable JSONB snapshot of individual menu item at order time.';
