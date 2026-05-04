-- Migration: 002_create_orders
-- Description: Create orders and order_items tables with complete lifecycle support
-- Version: 1.0.0

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,

    -- Customer information
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,

    -- Delivery information
    delivery_address_street TEXT NOT NULL,
    delivery_address_city TEXT NOT NULL,
    delivery_address_state TEXT NOT NULL,
    delivery_address_zip TEXT NOT NULL,
    delivery_address_country TEXT NOT NULL DEFAULT 'USA',
    delivery_instructions TEXT,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    estimated_delivery_time TIMESTAMPTZ,
    actual_delivery_time TIMESTAMPTZ,

    -- Order details
    status TEXT NOT NULL DEFAULT 'PLACED' CHECK (status IN (
        'PLACED', 'CONFIRMED', 'IN_PREP', 'READY', 'ASSIGNED',
        'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED'
    )),
    channel TEXT DEFAULT 'WEB',
    brand TEXT,

    -- Pricing
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tip NUMERIC(10, 2) DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,

    -- Risk scoring
    risk_score NUMERIC(5, 2),
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    risk_flags JSONB DEFAULT '[]',

    -- Compliance
    compliance_verified_at TIMESTAMPTZ,
    compliance_verified_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    compliance_notes TEXT,

    -- Timestamps
    placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Item details
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,

    -- Modifiers/customizations
    modifiers JSONB DEFAULT '[]',
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_driver_id ON orders(driver_id) WHERE driver_id IS NOT NULL;
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_store_status ON orders(store_id, status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_placed_at ON orders(placed_at DESC);
CREATE INDEX idx_orders_brand ON orders(brand) WHERE brand IS NOT NULL;
CREATE INDEX idx_orders_risk_level ON orders(risk_level) WHERE risk_level IN ('HIGH', 'CRITICAL');

-- Indexes for order_items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_sku ON order_items(sku);

-- Comments
COMMENT ON TABLE orders IS 'Customer orders with complete lifecycle tracking';
COMMENT ON COLUMN orders.status IS 'Current order status in the lifecycle';
COMMENT ON COLUMN orders.risk_score IS 'Calculated risk score (0-100)';
COMMENT ON COLUMN orders.risk_flags IS 'Array of risk indicator flags';

COMMENT ON TABLE order_items IS 'Line items for orders';
COMMENT ON COLUMN order_items.modifiers IS 'Array of modifier objects with name and price';

-- Trigger for updated_at
CREATE TRIGGER orders_updated_at_trigger
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update status timestamps
CREATE OR REPLACE FUNCTION update_order_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        CASE NEW.status
            WHEN 'CONFIRMED' THEN NEW.confirmed_at = NOW();
            WHEN 'READY' THEN NEW.ready_at = NOW();
            WHEN 'PICKED_UP' THEN NEW.picked_up_at = NOW();
            WHEN 'DELIVERED' THEN NEW.delivered_at = NOW();
            WHEN 'CANCELLED' THEN NEW.cancelled_at = NOW();
            ELSE NULL;
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_status_timestamps_trigger
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_status_timestamps();
