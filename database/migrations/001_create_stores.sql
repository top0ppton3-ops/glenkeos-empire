-- Migration: 001_create_stores
-- Description: Create stores table with full address support and operating hours
-- Version: 1.0.0

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT,

    -- Address fields
    address_street TEXT NOT NULL,
    address_city TEXT NOT NULL,
    address_state TEXT NOT NULL,
    address_zip TEXT NOT NULL,
    address_country TEXT NOT NULL DEFAULT 'USA',

    -- Contact information
    phone TEXT,
    email TEXT,

    -- Operating configuration
    timezone TEXT DEFAULT 'America/New_York',
    operating_hours JSONB DEFAULT '{}',

    -- Status
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_stores_brand ON stores(brand) WHERE brand IS NOT NULL;
CREATE INDEX idx_stores_city_state ON stores(address_city, address_state);
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_created_at ON stores(created_at);

-- Full-text search index on name
CREATE INDEX idx_stores_name_search ON stores USING gin(to_tsvector('english', name));

-- Comments for documentation
COMMENT ON TABLE stores IS 'Physical store locations in the GlenKeos ecosystem';
COMMENT ON COLUMN stores.brand IS 'Brand identifier (Ghetto Eats, Greek Royal Cuisine, etc.)';
COMMENT ON COLUMN stores.operating_hours IS 'JSON object with day-of-week keys and open/close times';
COMMENT ON COLUMN stores.status IS 'Store operational status';

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stores_updated_at_trigger
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
