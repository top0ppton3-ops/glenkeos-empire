-- Migration: 005_create_staff
-- Description: Create staff and staff_roles tables with RBAC
-- Version: 1.0.0

CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic information
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,

    -- Security
    password_hash TEXT,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN (
        'ACTIVE', 'INACTIVE', 'SUSPENDED'
    )),

    -- Access tracking
    last_login TIMESTAMPTZ,
    last_login_ip TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Staff roles junction table
CREATE TABLE staff_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN (
        'SUPER_ADMIN',
        'COMPLIANCE_OFFICER',
        'RISK_MANAGER',
        'STORE_MANAGER',
        'ASSISTANT_MANAGER',
        'KITCHEN_MANAGER',
        'KITCHEN_STAFF',
        'CASHIER',
        'DISPATCHER',
        'DRIVER_COORDINATOR',
        'CUSTOMER_SERVICE',
        'INVENTORY_MANAGER',
        'VIEWER'
    )),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by UUID REFERENCES staff(id) ON DELETE SET NULL,

    CONSTRAINT unique_staff_role UNIQUE (staff_id, role)
);

-- Staff-to-store access mapping
CREATE TABLE staff_store_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by UUID REFERENCES staff(id) ON DELETE SET NULL,

    CONSTRAINT unique_staff_store UNIQUE (staff_id, store_id)
);

-- Indexes for staff
CREATE UNIQUE INDEX idx_staff_email ON staff(LOWER(email));
CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_staff_created_at ON staff(created_at DESC);

-- Indexes for staff_roles
CREATE INDEX idx_staff_roles_staff_id ON staff_roles(staff_id);
CREATE INDEX idx_staff_roles_role ON staff_roles(role);

-- Indexes for staff_store_access
CREATE INDEX idx_staff_store_access_staff_id ON staff_store_access(staff_id);
CREATE INDEX idx_staff_store_access_store_id ON staff_store_access(store_id);

-- Comments
COMMENT ON TABLE staff IS 'Staff members with authentication and RBAC';
COMMENT ON TABLE staff_roles IS 'Role assignments for staff (many-to-many)';
COMMENT ON TABLE staff_store_access IS 'Store access permissions for staff';
COMMENT ON COLUMN staff.mfa_enabled IS 'Whether multi-factor authentication is enabled';
COMMENT ON COLUMN staff_roles.role IS 'One of 13 granular roles in the system';

-- Triggers
CREATE TRIGGER staff_updated_at_trigger
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION reset_failed_logins()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_login IS DISTINCT FROM OLD.last_login THEN
        NEW.failed_login_attempts = 0;
        NEW.locked_until = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER staff_reset_failed_logins_trigger
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION reset_failed_logins();
