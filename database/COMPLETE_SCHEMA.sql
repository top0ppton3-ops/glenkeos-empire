-- ================================================================
-- GLENKEOS COMPLETE DATABASE SCHEMA
-- Fortune-500 Grade Multi-Tenant Architecture
-- PostgreSQL 14+
-- ================================================================

-- ================================================================
-- EXTENSIONS
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ================================================================
-- ENUM TYPES
-- ================================================================

CREATE TYPE store_status AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED');
CREATE TYPE order_status AS ENUM ('PENDING', 'ACCEPTED', 'IN_PREP', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'AUTHORIZED', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE driver_status AS ENUM ('AVAILABLE', 'ASSIGNED', 'EN_ROUTE', 'DELIVERING', 'OFFLINE');
CREATE TYPE staff_role AS ENUM ('COOK', 'CASHIER', 'MANAGER', 'DRIVER', 'ADMIN');
CREATE TYPE shift_status AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE notification_channel AS ENUM ('EMAIL', 'SMS', 'PUSH');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'DELIVERED');

-- ================================================================
-- TABLE: brands
-- ================================================================

CREATE TABLE brands (
    brand_id VARCHAR(50) PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL,
    brand_tier VARCHAR(10) NOT NULL CHECK (brand_tier IN ('B1', 'B2', 'B3')),
    description TEXT,
    logo_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brands_active ON brands(active);

-- ================================================================
-- TABLE: stores
-- ================================================================

CREATE TABLE stores (
    store_id VARCHAR(50) PRIMARY KEY,
    brand_id VARCHAR(50) NOT NULL REFERENCES brands(brand_id),
    store_name VARCHAR(200) NOT NULL,
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(100),
    status store_status NOT NULL DEFAULT 'ACTIVE',
    hours JSONB, -- Operating hours
    features JSONB, -- Dine-in, drive-thru, delivery, etc.
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stores_brand ON stores(brand_id);
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_tenant ON stores(tenant_id);
CREATE INDEX idx_stores_location ON stores USING gist(ll_to_earth(latitude::float8, longitude::float8)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ================================================================
-- TABLE: customers
-- ================================================================

CREATE TABLE customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    cognito_sub VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    preferences JSONB DEFAULT '{}'::jsonb,
    marketing_opt_in BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_cognito_sub ON customers(cognito_sub);
CREATE INDEX idx_customers_active ON customers(active);

-- ================================================================
-- TABLE: customer_addresses
-- ================================================================

CREATE TABLE customer_addresses (
    address_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    label VARCHAR(50), -- 'Home', 'Work', etc.
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    delivery_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_addresses_customer ON customer_addresses(customer_id);

-- ================================================================
-- TABLE: rewards_accounts
-- ================================================================

CREATE TABLE rewards_accounts (
    account_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    points_balance INTEGER NOT NULL DEFAULT 0,
    lifetime_points INTEGER NOT NULL DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'STANDARD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_rewards_customer ON rewards_accounts(customer_id);

-- ================================================================
-- TABLE: referrals
-- ================================================================

CREATE TABLE referrals (
    referral_id VARCHAR(50) PRIMARY KEY,
    referrer_customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    referred_customer_id VARCHAR(50) REFERENCES customers(customer_id),
    referral_code VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, EXPIRED
    reward_points INTEGER,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_customer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- ================================================================
-- TABLE: inventory_items
-- ================================================================

CREATE TABLE inventory_items (
    item_id VARCHAR(50) PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20) NOT NULL, -- 'kg', 'units', 'liters'
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    threshold_low DECIMAL(10, 2) NOT NULL,
    threshold_critical DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(10, 2),
    supplier VARCHAR(200),
    last_restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_store ON inventory_items(store_id);
CREATE INDEX idx_inventory_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_low ON inventory_items(store_id, quantity) WHERE quantity <= threshold_low;

-- ================================================================
-- TABLE: menu_items
-- ================================================================

CREATE TABLE menu_items (
    menu_item_id VARCHAR(50) PRIMARY KEY,
    brand_id VARCHAR(50) NOT NULL REFERENCES brands(brand_id),
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    calories INTEGER,
    allergens TEXT[],
    available BOOLEAN DEFAULT true,
    preparation_time_minutes INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_brand ON menu_items(brand_id);
CREATE INDEX idx_menu_category ON menu_items(category);
CREATE INDEX idx_menu_available ON menu_items(available);

-- ================================================================
-- TABLE: orders
-- ================================================================

CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id),
    order_number VARCHAR(20) NOT NULL UNIQUE,
    order_type VARCHAR(20) NOT NULL, -- DINE_IN, PICKUP, DELIVERY
    status order_status NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    tip DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_id VARCHAR(50),
    delivery_address_id VARCHAR(50) REFERENCES customer_addresses(address_id),
    special_instructions TEXT,
    estimated_prep_time INTEGER, -- minutes
    estimated_delivery_time INTEGER, -- minutes
    accepted_at TIMESTAMPTZ,
    prep_started_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    out_for_delivery_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_tenant ON orders(tenant_id);

-- ================================================================
-- TABLE: order_items
-- ================================================================

CREATE TABLE order_items (
    order_item_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    menu_item_id VARCHAR(50) NOT NULL REFERENCES menu_items(menu_item_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    customizations JSONB DEFAULT '{}'::jsonb,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ================================================================
-- TABLE: order_status_history
-- ================================================================

CREATE TABLE order_status_history (
    history_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    from_status order_status,
    to_status order_status NOT NULL,
    changed_by VARCHAR(50),
    reason_code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_history_order ON order_status_history(order_id);
CREATE INDEX idx_order_history_created ON order_status_history(created_at DESC);

-- ================================================================
-- TABLE: payments
-- ================================================================

CREATE TABLE payments (
    payment_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id),
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL, -- PAYPAL, CARD, APPLE_PAY, GOOGLE_PAY
    status payment_status NOT NULL DEFAULT 'PENDING',
    paypal_order_id VARCHAR(100),
    paypal_capture_id VARCHAR(100),
    payer_email VARCHAR(255),
    payer_name VARCHAR(200),
    transaction_fee DECIMAL(10, 2),
    net_amount DECIMAL(10, 2),
    authorized_at TIMESTAMPTZ,
    captured_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_paypal_order ON payments(paypal_order_id);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);

-- ================================================================
-- TABLE: refunds
-- ================================================================

CREATE TABLE refunds (
    refund_id VARCHAR(50) PRIMARY KEY,
    payment_id VARCHAR(50) NOT NULL REFERENCES payments(payment_id),
    amount DECIMAL(10, 2) NOT NULL,
    reason VARCHAR(200),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
    paypal_refund_id VARCHAR(100),
    processed_at TIMESTAMPTZ,
    created_by VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refunds_payment ON refunds(payment_id);

-- ================================================================
-- TABLE: drivers
-- ================================================================

CREATE TABLE drivers (
    driver_id VARCHAR(50) PRIMARY KEY,
    cognito_sub VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    license_expiry DATE,
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(20),
    status driver_status NOT NULL DEFAULT 'OFFLINE',
    current_location POINT,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    total_deliveries INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_active ON drivers(active);
CREATE INDEX idx_drivers_tenant ON drivers(tenant_id);

-- ================================================================
-- TABLE: driver_assignments
-- ================================================================

CREATE TABLE driver_assignments (
    assignment_id VARCHAR(50) PRIMARY KEY,
    driver_id VARCHAR(50) NOT NULL REFERENCES drivers(driver_id),
    order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    distance_km DECIMAL(10, 2),
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_driver_assignments_driver ON driver_assignments(driver_id);
CREATE INDEX idx_driver_assignments_order ON driver_assignments(order_id);

-- ================================================================
-- TABLE: driver_locations
-- ================================================================

CREATE TABLE driver_locations (
    location_id VARCHAR(50) PRIMARY KEY,
    driver_id VARCHAR(50) NOT NULL REFERENCES drivers(driver_id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy_meters INTEGER,
    speed_kmh DECIMAL(5, 2),
    heading INTEGER, -- 0-359 degrees
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_driver_locations_driver ON driver_locations(driver_id);
CREATE INDEX idx_driver_locations_recorded ON driver_locations(recorded_at DESC);

-- ================================================================
-- TABLE: staff
-- ================================================================

CREATE TABLE staff (
    staff_id VARCHAR(50) PRIMARY KEY,
    cognito_sub VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role staff_role NOT NULL,
    store_id VARCHAR(50) REFERENCES stores(store_id),
    hire_date DATE,
    hourly_rate DECIMAL(10, 2),
    permissions JSONB DEFAULT '{}'::jsonb,
    active BOOLEAN DEFAULT true,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_store ON staff(store_id);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_active ON staff(active);
CREATE INDEX idx_staff_tenant ON staff(tenant_id);

-- ================================================================
-- TABLE: shifts
-- ================================================================

CREATE TABLE shifts (
    shift_id VARCHAR(50) PRIMARY KEY,
    staff_id VARCHAR(50) NOT NULL REFERENCES staff(staff_id),
    store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id),
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status shift_status NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shifts_staff ON shifts(staff_id);
CREATE INDEX idx_shifts_store ON shifts(store_id);
CREATE INDEX idx_shifts_scheduled ON shifts(scheduled_start, scheduled_end);

-- ================================================================
-- TABLE: events
-- ================================================================

CREATE TABLE events (
    event_id VARCHAR(50) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_source VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(50),
    aggregate_type VARCHAR(50),
    payload JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    correlation_id VARCHAR(50),
    causation_id VARCHAR(50),
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_source ON events(event_source);
CREATE INDEX idx_events_aggregate ON events(aggregate_type, aggregate_id);
CREATE INDEX idx_events_correlation ON events(correlation_id);
CREATE INDEX idx_events_created ON events(created_at DESC);
CREATE INDEX idx_events_tenant ON events(tenant_id);

-- ================================================================
-- TABLE: audit_logs
-- ================================================================

CREATE TABLE audit_logs (
    audit_id VARCHAR(50) PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, STATUS_CHANGE
    actor_id VARCHAR(50),
    actor_type VARCHAR(20), -- CUSTOMER, STAFF, SYSTEM
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);

-- ================================================================
-- TABLE: policies
-- ================================================================

CREATE TABLE policies (
    policy_id VARCHAR(50) PRIMARY KEY,
    policy_name VARCHAR(200) NOT NULL,
    policy_type VARCHAR(50) NOT NULL, -- OPERATIONAL, COMPLIANCE, SECURITY, DATA_RETENTION
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, ACTIVE, ARCHIVED
    effective_date DATE,
    expiry_date DATE,
    approved_by VARCHAR(50),
    approved_at TIMESTAMPTZ,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policies_type ON policies(policy_type);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_tenant ON policies(tenant_id);

-- ================================================================
-- TABLE: risk_events
-- ================================================================

CREATE TABLE risk_events (
    risk_id VARCHAR(50) PRIMARY KEY,
    risk_type VARCHAR(50) NOT NULL, -- OPERATIONAL, FINANCIAL, COMPLIANCE, SECURITY
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    affected_entity_type VARCHAR(50),
    affected_entity_id VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN, INVESTIGATING, MITIGATED, CLOSED
    assigned_to VARCHAR(50),
    mitigation_plan TEXT,
    resolved_at TIMESTAMPTZ,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_events_type ON risk_events(risk_type);
CREATE INDEX idx_risk_events_severity ON risk_events(severity);
CREATE INDEX idx_risk_events_status ON risk_events(status);
CREATE INDEX idx_risk_events_tenant ON risk_events(tenant_id);

-- ================================================================
-- TABLE: compliance_events
-- ================================================================

CREATE TABLE compliance_events (
    compliance_id VARCHAR(50) PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    regulation VARCHAR(100), -- GDPR, CCPA, PCI-DSS, SOX
    description TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'LOGGED', -- LOGGED, REVIEWED, RESOLVED
    reviewed_by VARCHAR(50),
    reviewed_at TIMESTAMPTZ,
    evidence JSONB,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compliance_type ON compliance_events(event_type);
CREATE INDEX idx_compliance_regulation ON compliance_events(regulation);
CREATE INDEX idx_compliance_status ON compliance_events(status);
CREATE INDEX idx_compliance_tenant ON compliance_events(tenant_id);

-- ================================================================
-- TABLE: metrics
-- ================================================================

CREATE TABLE metrics (
    metric_id VARCHAR(50) PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- REVENUE, OPERATIONAL, CUSTOMER, COMPLIANCE
    value DECIMAL(15, 2) NOT NULL,
    unit VARCHAR(20),
    dimensions JSONB DEFAULT '{}'::jsonb, -- store_id, brand_id, etc.
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_metrics_name ON metrics(metric_name);
CREATE INDEX idx_metrics_type ON metrics(metric_type);
CREATE INDEX idx_metrics_period ON metrics(period_start, period_end);
CREATE INDEX idx_metrics_tenant ON metrics(tenant_id);

-- ================================================================
-- TABLE: notifications
-- ================================================================

CREATE TABLE notifications (
    notification_id VARCHAR(50) PRIMARY KEY,
    recipient_id VARCHAR(50) NOT NULL, -- customer_id or staff_id
    recipient_type VARCHAR(20) NOT NULL, -- CUSTOMER, STAFF
    channel notification_channel NOT NULL,
    template VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    status notification_status NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rewards_accounts_updated_at BEFORE UPDATE ON rewards_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risk_events_updated_at BEFORE UPDATE ON risk_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order status history trigger
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (
            history_id,
            order_id,
            from_status,
            to_status,
            created_at
        ) VALUES (
            'hist_' || gen_random_uuid()::text,
            NEW.order_id,
            OLD.status,
            NEW.status,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_change_trigger
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();

-- ================================================================
-- INITIAL DATA
-- ================================================================

-- Insert default brand
INSERT INTO brands (brand_id, brand_name, brand_tier, description, active) VALUES
('chic-on-chain', 'Chic-on-Chain', 'B1', 'Premium fast-casual chicken restaurant', true);

-- ================================================================
-- VIEWS
-- ================================================================

-- Active orders view
CREATE VIEW v_active_orders AS
SELECT 
    o.*,
    c.email as customer_email,
    c.first_name || ' ' || c.last_name as customer_name,
    s.store_name,
    p.status as payment_status
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN stores s ON o.store_id = s.store_id
LEFT JOIN payments p ON o.payment_id = p.payment_id
WHERE o.status NOT IN ('COMPLETED', 'CANCELLED');

-- Store inventory summary
CREATE VIEW v_store_inventory_summary AS
SELECT 
    store_id,
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE quantity <= threshold_critical) as critical_items,
    COUNT(*) FILTER (WHERE quantity <= threshold_low AND quantity > threshold_critical) as low_items,
    SUM(quantity * unit_cost) as total_inventory_value
FROM inventory_items
GROUP BY store_id;

-- Daily revenue summary
CREATE VIEW v_daily_revenue AS
SELECT 
    DATE(created_at) as date,
    store_id,
    COUNT(*) as total_orders,
    SUM(total) as gross_revenue,
    SUM(tax) as total_tax,
    SUM(total - tax) as net_revenue
FROM orders
WHERE status = 'COMPLETED'
GROUP BY DATE(created_at), store_id;

-- ================================================================
-- GRANTS (adjust based on your user roles)
-- ================================================================

-- Grant permissions to application user (create this user separately)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO glenkeos_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO glenkeos_app;

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON TABLE brands IS 'Brand definitions for multi-brand support';
COMMENT ON TABLE stores IS 'Physical store locations';
COMMENT ON TABLE customers IS 'Customer accounts';
COMMENT ON TABLE orders IS 'Customer orders with full lifecycle tracking';
COMMENT ON TABLE payments IS 'Payment transactions via PayPal and other methods';
COMMENT ON TABLE events IS 'Event sourcing log for system events';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for compliance';
COMMENT ON TABLE metrics IS 'Pre-aggregated metrics for dashboards';
