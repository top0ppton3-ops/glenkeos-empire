-- Migration: 003_create_inventory
-- Description: Create inventory_items table with threshold tracking
-- Version: 1.0.0

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,

    -- Item identification
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'INGREDIENT', 'PACKAGING', 'SUPPLY', 'BEVERAGE', 'OTHER'
    )),

    -- Quantity tracking
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit TEXT NOT NULL CHECK (unit IN (
        'UNIT', 'LBS', 'OZ', 'KG', 'G', 'L', 'ML', 'GAL'
    )),
    threshold NUMERIC(10, 2) NOT NULL DEFAULT 0,
    reorder_quantity NUMERIC(10, 2),

    -- Status
    status TEXT NOT NULL DEFAULT 'IN_STOCK' CHECK (status IN (
        'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED'
    )),

    -- Supplier information
    supplier_id TEXT,
    supplier_name TEXT,
    supplier_contact_email TEXT,
    supplier_contact_phone TEXT,

    -- Cost tracking
    unit_cost NUMERIC(10, 2),
    currency TEXT DEFAULT 'USD',

    -- Tracking
    last_restocked TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint: one SKU per store
    CONSTRAINT unique_store_sku UNIQUE (store_id, sku)
);

-- Indexes
CREATE INDEX idx_inventory_store_id ON inventory_items(store_id);
CREATE INDEX idx_inventory_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_store_sku ON inventory_items(store_id, sku);
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_inventory_status ON inventory_items(status);
CREATE INDEX idx_inventory_low_stock ON inventory_items(store_id) WHERE status IN ('LOW_STOCK', 'OUT_OF_STOCK');
CREATE INDEX idx_inventory_updated_at ON inventory_items(updated_at DESC);

-- Full-text search on name
CREATE INDEX idx_inventory_name_search ON inventory_items USING gin(to_tsvector('english', name));

-- Comments
COMMENT ON TABLE inventory_items IS 'Inventory tracking per store with threshold alerts';
COMMENT ON COLUMN inventory_items.threshold IS 'Reorder threshold - triggers LOW_STOCK when quantity falls below';
COMMENT ON COLUMN inventory_items.status IS 'Auto-calculated based on quantity vs threshold';

-- Trigger for updated_at
CREATE TRIGGER inventory_items_updated_at_trigger
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update status based on quantity
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity <= 0 THEN
        NEW.status = 'OUT_OF_STOCK';
    ELSIF NEW.quantity <= NEW.threshold THEN
        NEW.status = 'LOW_STOCK';
    ELSIF NEW.status != 'DISCONTINUED' THEN
        NEW.status = 'IN_STOCK';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_status_trigger
    BEFORE INSERT OR UPDATE OF quantity, threshold ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_status();
