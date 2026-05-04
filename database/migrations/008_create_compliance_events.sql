-- Migration: 008_create_compliance_events
-- Description: Create compliance_events table (immutable audit trail)
-- Version: 1.0.0

CREATE TABLE compliance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Event classification
    event_type TEXT NOT NULL CHECK (event_type IN (
        'ORDER_CREATED',
        'ORDER_STATUS_CHANGED',
        'INVENTORY_CHANGED',
        'POLICY_UPDATED',
        'RISK_EVENT_CREATED',
        'RISK_EVENT_UPDATED',
        'ROLE_CHANGED',
        'STAFF_CREATED',
        'STAFF_UPDATED',
        'DRIVER_STATUS_CHANGED',
        'ACCESS_GRANTED',
        'ACCESS_REVOKED',
        'DATA_EXPORTED',
        'SYSTEM_CONFIG_CHANGED'
    )),

    -- Actor (who triggered the event)
    actor_id TEXT NOT NULL, -- Staff ID, customer ID, or system identifier
    actor_type TEXT NOT NULL CHECK (actor_type IN (
        'STAFF', 'SYSTEM', 'API', 'CUSTOMER'
    )),

    -- Affected entity
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'order', 'store', 'driver', 'staff', 'policy', 'riskEvent', 'inventoryItem', 'customer'
    )),
    entity_id TEXT NOT NULL,

    -- Description
    action TEXT NOT NULL, -- Human-readable description

    -- Event-specific data (immutable)
    metadata JSONB DEFAULT '{}',

    -- Request context
    ip_address INET,
    user_agent TEXT,

    -- Timestamp (immutable)
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Immutability marker
    immutable BOOLEAN DEFAULT TRUE NOT NULL
);

-- Prevent updates and deletes on compliance_events (immutable audit trail)
CREATE OR REPLACE FUNCTION prevent_compliance_event_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'compliance_events are immutable and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_compliance_event_updates
    BEFORE UPDATE ON compliance_events
    FOR EACH ROW
    EXECUTE FUNCTION prevent_compliance_event_modification();

CREATE TRIGGER prevent_compliance_event_deletes
    BEFORE DELETE ON compliance_events
    FOR EACH ROW
    EXECUTE FUNCTION prevent_compliance_event_modification();

-- Indexes for compliance_events
CREATE INDEX idx_compliance_events_event_type ON compliance_events(event_type);
CREATE INDEX idx_compliance_events_actor_id ON compliance_events(actor_id);
CREATE INDEX idx_compliance_events_actor_type ON compliance_events(actor_type);
CREATE INDEX idx_compliance_events_entity_type ON compliance_events(entity_type);
CREATE INDEX idx_compliance_events_entity_id ON compliance_events(entity_id);
CREATE INDEX idx_compliance_events_entity ON compliance_events(entity_type, entity_id);
CREATE INDEX idx_compliance_events_timestamp ON compliance_events(timestamp DESC);
CREATE INDEX idx_compliance_events_actor_timestamp ON compliance_events(actor_id, timestamp DESC);

-- JSONB index for metadata queries
CREATE INDEX idx_compliance_events_metadata ON compliance_events USING gin(metadata);

-- Composite index for common audit queries
CREATE INDEX idx_compliance_events_audit ON compliance_events(event_type, actor_id, timestamp DESC);

-- Comments
COMMENT ON TABLE compliance_events IS 'Immutable audit trail for all compliance-relevant actions';
COMMENT ON COLUMN compliance_events.event_type IS 'Type of compliance event (14 types)';
COMMENT ON COLUMN compliance_events.metadata IS 'Event-specific immutable data';
COMMENT ON COLUMN compliance_events.immutable IS 'Marker field - all events are immutable';

-- Trigger to ensure timestamp is always set to NOW() on insert
CREATE OR REPLACE FUNCTION ensure_compliance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.timestamp = NOW();
    NEW.immutable = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compliance_events_timestamp_trigger
    BEFORE INSERT ON compliance_events
    FOR EACH ROW
    EXECUTE FUNCTION ensure_compliance_timestamp();
