-- Migration: 004_create_drivers
-- Description: Create drivers table with real-time tracking
-- Version: 1.0.0

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,

    -- Driver information
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'OFFLINE' CHECK (status IN (
        'ONLINE', 'OFFLINE', 'BUSY', 'ON_BREAK', 'INACTIVE'
    )),

    -- Vehicle information
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN (
        'CAR', 'BIKE', 'MOTORCYCLE', 'SCOOTER', 'WALK'
    )),
    vehicle_make TEXT,
    vehicle_model TEXT,
    vehicle_year INTEGER,
    vehicle_license_plate TEXT,
    vehicle_color TEXT,

    -- Location tracking
    location_latitude NUMERIC(10, 8),
    location_longitude NUMERIC(11, 8),
    location_accuracy NUMERIC(8, 2),
    location_last_updated TIMESTAMPTZ,

    -- Performance metrics
    total_deliveries INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) CHECK (rating >= 0 AND rating <= 5),
    total_ratings INTEGER DEFAULT 0,
    on_time_percentage NUMERIC(5, 2) CHECK (on_time_percentage >= 0 AND on_time_percentage <= 100),

    -- Current assignment
    current_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_drivers_store_id ON drivers(store_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_store_status ON drivers(store_id, status);
CREATE INDEX idx_drivers_current_order ON drivers(current_order_id) WHERE current_order_id IS NOT NULL;
CREATE INDEX idx_drivers_location ON drivers(location_latitude, location_longitude) WHERE location_latitude IS NOT NULL;

-- Spatial index for location queries (if PostGIS is available)
-- CREATE INDEX idx_drivers_location_spatial ON drivers USING gist (ST_MakePoint(location_longitude, location_latitude));

-- Comments
COMMENT ON TABLE drivers IS 'Delivery drivers with real-time tracking and metrics';
COMMENT ON COLUMN drivers.status IS 'Current driver status for assignment routing';
COMMENT ON COLUMN drivers.location_latitude IS 'GPS latitude (updated in real-time)';
COMMENT ON COLUMN drivers.location_longitude IS 'GPS longitude (updated in real-time)';
COMMENT ON COLUMN drivers.rating IS 'Average rating from customer feedback (0-5)';

-- Trigger for updated_at
CREATE TRIGGER drivers_updated_at_trigger
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update location timestamp
CREATE OR REPLACE FUNCTION update_driver_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.location_latitude IS DISTINCT FROM OLD.location_latitude
       OR NEW.location_longitude IS DISTINCT FROM OLD.location_longitude THEN
        NEW.location_last_updated = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER drivers_location_timestamp_trigger
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_location_timestamp();
