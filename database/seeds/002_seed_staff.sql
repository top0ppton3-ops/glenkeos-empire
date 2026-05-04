-- Seed: 002_seed_staff
-- Description: Seed sample staff with various roles
-- Version: 1.0.0

-- Super Admin
INSERT INTO staff (id, name, email, status) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'System Administrator', 'admin@glenkeos.com', 'ACTIVE');

INSERT INTO staff_roles (staff_id, role) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'SUPER_ADMIN');

-- Compliance Officer
INSERT INTO staff (id, name, email, status) VALUES
('650e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', 'sarah.johnson@glenkeos.com', 'ACTIVE');

INSERT INTO staff_roles (staff_id, role) VALUES
('650e8400-e29b-41d4-a716-446655440002', 'COMPLIANCE_OFFICER');

-- Store Manager
INSERT INTO staff (id, name, email, phone, status) VALUES
('650e8400-e29b-41d4-a716-446655440003', 'Marcus Williams', 'marcus.williams@ghettoeats.com', '+14045551101', 'ACTIVE');

INSERT INTO staff_roles (staff_id, role) VALUES
('650e8400-e29b-41d4-a716-446655440003', 'STORE_MANAGER');

INSERT INTO staff_store_access (staff_id, store_id, granted_by) VALUES
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001'); -- Downtown store

-- Kitchen Manager
INSERT INTO staff (id, name, email, phone, status) VALUES
('650e8400-e29b-41d4-a716-446655440004', 'James Chen', 'james.chen@ghettoeats.com', '+14045551102', 'ACTIVE');

INSERT INTO staff_roles (staff_id, role) VALUES
('650e8400-e29b-41d4-a716-446655440004', 'KITCHEN_MANAGER');

INSERT INTO staff_store_access (staff_id, store_id, granted_by) VALUES
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003');

-- Dispatcher
INSERT INTO staff (id, name, email, phone, status) VALUES
('650e8400-e29b-41d4-a716-446655440005', 'Angela Martinez', 'angela.martinez@glenkeos.com', '+14045551103', 'ACTIVE');

INSERT INTO staff_roles (staff_id, role) VALUES
('650e8400-e29b-41d4-a716-446655440005', 'DISPATCHER');

INSERT INTO staff_store_access (staff_id, store_id, granted_by) VALUES
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001'),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001');

-- Inventory Manager
INSERT INTO staff (id, name, email, status) VALUES
('650e8400-e29b-41d4-a716-446655440006', 'David Lee', 'david.lee@ghettoeats.com', 'ACTIVE');

INSERT INTO staff_roles (staff_id, role) VALUES
('650e8400-e29b-41d4-a716-446655440006', 'INVENTORY_MANAGER');

INSERT INTO staff_store_access (staff_id, store_id, granted_by) VALUES
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003'),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001');
