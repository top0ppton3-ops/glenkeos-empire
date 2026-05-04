-- Migration: 006_create_policies
-- Description: Create policies table with versioning support
-- Version: 1.0.0

CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Policy identification
    name TEXT NOT NULL,
    version TEXT NOT NULL, -- Semantic version (X.Y.Z)
    category TEXT NOT NULL CHECK (category IN (
        'DATA_PRIVACY',
        'FOOD_SAFETY',
        'HEALTH_REGULATIONS',
        'LABOR_COMPLIANCE',
        'FINANCIAL_CONTROLS',
        'OPERATIONAL_STANDARDS',
        'SECURITY',
        'OTHER'
    )),

    -- Content
    content TEXT NOT NULL, -- Full policy text or markdown
    summary TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'ACTIVE', 'ARCHIVED', 'DEPRECATED'
    )),

    -- Lifecycle
    effective_date TIMESTAMPTZ NOT NULL,
    expiration_date TIMESTAMPTZ,

    -- Approval
    approved_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,

    -- Versioning
    previous_version_id UUID REFERENCES policies(id) ON DELETE SET NULL,

    -- Tags for searchability
    tags TEXT[] DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint: one active version per name
    CONSTRAINT unique_active_policy UNIQUE (name, version)
);

-- Policy acknowledgments tracking
CREATE TABLE policy_acknowledgments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,

    CONSTRAINT unique_policy_staff_ack UNIQUE (policy_id, staff_id)
);

-- Indexes for policies
CREATE INDEX idx_policies_name ON policies(name);
CREATE INDEX idx_policies_category ON policies(category);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_name_category ON policies(name, category);
CREATE INDEX idx_policies_effective_date ON policies(effective_date);
CREATE INDEX idx_policies_updated_at ON policies(updated_at DESC);
CREATE INDEX idx_policies_tags ON policies USING gin(tags);
CREATE INDEX idx_policies_active ON policies(status) WHERE status = 'ACTIVE';

-- Full-text search on name, summary, content
CREATE INDEX idx_policies_search ON policies USING gin(
    to_tsvector('english', name || ' ' || COALESCE(summary, '') || ' ' || content)
);

-- Indexes for policy_acknowledgments
CREATE INDEX idx_policy_acks_policy_id ON policy_acknowledgments(policy_id);
CREATE INDEX idx_policy_acks_staff_id ON policy_acknowledgments(staff_id);
CREATE INDEX idx_policy_acks_acknowledged_at ON policy_acknowledgments(acknowledged_at DESC);

-- Comments
COMMENT ON TABLE policies IS 'Governance and compliance policies with versioning';
COMMENT ON COLUMN policies.version IS 'Semantic version (X.Y.Z) for policy versioning';
COMMENT ON COLUMN policies.previous_version_id IS 'Link to previous version for audit trail';
COMMENT ON TABLE policy_acknowledgments IS 'Staff acknowledgment tracking for policies';

-- Triggers
CREATE TRIGGER policies_updated_at_trigger
    BEFORE UPDATE ON policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set approved_at when status changes to ACTIVE
CREATE OR REPLACE FUNCTION set_policy_approved_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ACTIVE' AND OLD.status != 'ACTIVE' AND NEW.approved_at IS NULL THEN
        NEW.approved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER policies_approved_at_trigger
    BEFORE UPDATE ON policies
    FOR EACH ROW
    EXECUTE FUNCTION set_policy_approved_at();
