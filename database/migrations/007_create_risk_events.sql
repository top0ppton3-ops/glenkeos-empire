-- Migration: 007_create_risk_events
-- Description: Create risk_events table for risk monitoring
-- Version: 1.0.0

CREATE TABLE risk_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Severity and status
    severity TEXT NOT NULL CHECK (severity IN (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    )),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
        'OPEN', 'IN_REVIEW', 'MITIGATED', 'RESOLVED', 'ESCALATED'
    )),
    category TEXT NOT NULL CHECK (category IN (
        'FRAUD',
        'FOOD_SAFETY',
        'OPERATIONAL',
        'FINANCIAL',
        'REPUTATIONAL',
        'COMPLIANCE',
        'SECURITY',
        'OTHER'
    )),

    -- Related entity
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'order', 'store', 'driver', 'staff', 'customer', 'inventory'
    )),
    entity_id TEXT NOT NULL,

    -- Description
    title TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Risk indicators (flexible JSONB structure)
    indicators JSONB DEFAULT '[]',

    -- Mitigation tracking
    mitigation_steps JSONB DEFAULT '[]',

    -- Ownership
    detected_by TEXT, -- System or staff ID
    assigned_to UUID REFERENCES staff(id) ON DELETE SET NULL,
    resolved_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Risk event comments/notes
CREATE TABLE risk_event_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_event_id UUID NOT NULL REFERENCES risk_events(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES staff(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for risk_events
CREATE INDEX idx_risk_events_severity ON risk_events(severity);
CREATE INDEX idx_risk_events_status ON risk_events(status);
CREATE INDEX idx_risk_events_category ON risk_events(category);
CREATE INDEX idx_risk_events_severity_status ON risk_events(severity, status);
CREATE INDEX idx_risk_events_entity_type ON risk_events(entity_type);
CREATE INDEX idx_risk_events_entity_id ON risk_events(entity_id);
CREATE INDEX idx_risk_events_entity ON risk_events(entity_type, entity_id);
CREATE INDEX idx_risk_events_assigned_to ON risk_events(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_risk_events_created_at ON risk_events(created_at DESC);
CREATE INDEX idx_risk_events_updated_at ON risk_events(updated_at DESC);
CREATE INDEX idx_risk_events_open ON risk_events(severity, status) WHERE status IN ('OPEN', 'IN_REVIEW', 'ESCALATED');

-- Full-text search on title and description
CREATE INDEX idx_risk_events_search ON risk_events USING gin(
    to_tsvector('english', title || ' ' || description)
);

-- Indexes for risk_event_notes
CREATE INDEX idx_risk_event_notes_risk_event_id ON risk_event_notes(risk_event_id);
CREATE INDEX idx_risk_event_notes_author_id ON risk_event_notes(author_id);
CREATE INDEX idx_risk_event_notes_created_at ON risk_event_notes(created_at DESC);

-- Comments
COMMENT ON TABLE risk_events IS 'Risk monitoring and mitigation tracking';
COMMENT ON COLUMN risk_events.indicators IS 'Array of risk indicator objects with type, value, threshold';
COMMENT ON COLUMN risk_events.mitigation_steps IS 'Array of mitigation action objects with action, assignedTo, status, completedAt';
COMMENT ON TABLE risk_event_notes IS 'Timeline of notes and comments on risk events';

-- Triggers
CREATE TRIGGER risk_events_updated_at_trigger
    BEFORE UPDATE ON risk_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set resolved_at when status changes to RESOLVED
CREATE OR REPLACE FUNCTION set_risk_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'RESOLVED' AND OLD.status != 'RESOLVED' AND NEW.resolved_at IS NULL THEN
        NEW.resolved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER risk_events_resolved_at_trigger
    BEFORE UPDATE ON risk_events
    FOR EACH ROW
    EXECUTE FUNCTION set_risk_resolved_at();
