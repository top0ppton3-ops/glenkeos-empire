-- ================================================================
-- GLENKEOS DATABASE SEED DATA
-- Complete Fortune 500 test data for all 3 brands
-- ================================================================

-- Insert Brands
INSERT INTO brands (brand_id, name, slug, description, active, created_at) VALUES
('BRAND-GHETTO-EATS', 'Ghetto Eats', 'ghetto-eats', 'Urban food delivery and restaurant operations', true, NOW()),
('BRAND-GOLDKEY', 'GoldKey', 'goldkey', 'Luxury concierge and event services', true, NOW()),
('BRAND-CHIC-ON-CHAIN', 'Chic-on-Chain', 'chic-on-chain', 'Fashion and lifestyle brand', true, NOW())
ON CONFLICT (brand_id) DO NOTHING;

-- Insert Stores (Locations)
INSERT INTO stores (store_id, brand_id, name, address, city, state, zip, phone, active, created_at) VALUES
('STORE-GE-001', 'BRAND-GHETTO-EATS', 'Ghetto Eats Downtown', '123 Main St', 'Los Angeles', 'CA', '90001', '(213) 555-0100', true, NOW()),
('STORE-GE-002', 'BRAND-GHETTO-EATS', 'Ghetto Eats Westside', '456 West Blvd', 'Los Angeles', 'CA', '90025', '(310) 555-0200', true, NOW()),
('STORE-GK-001', 'BRAND-GOLDKEY', 'GoldKey LA Headquarters', '789 Luxury Ave', 'Beverly Hills', 'CA', '90210', '(310) 555-0300', true, NOW()),
('STORE-CC-001', 'BRAND-CHIC-ON-CHAIN', 'Chic-on-Chain Flagship', '321 Fashion Blvd', 'Los Angeles', 'CA', '90048', '(323) 555-0400', true, NOW())
ON CONFLICT (store_id) DO NOTHING;

-- Insert Products (Menu Items for Ghetto Eats)
INSERT INTO products (product_id, brand_id, store_id, name, description, price, currency, category, active, sold_out, visible_from, visible_to, tags, created_at) VALUES
-- Wings
('PROD-GE-001', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'Hot Wings 10pc', 'Spicy wings with fries', 14.99, 'USD', 'Wings', true, false, '16:00', '02:00', ARRAY['spicy', 'popular'], NOW()),
('PROD-GE-002', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'Hot Wings 20pc', 'Spicy wings with fries and drink', 24.99, 'USD', 'Wings', true, false, '16:00', '02:00', ARRAY['spicy', 'popular'], NOW()),
('PROD-GE-003', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'BBQ Wings 10pc', 'BBQ glazed wings with fries', 14.99, 'USD', 'Wings', true, false, '16:00', '02:00', ARRAY['bbq'], NOW()),
-- Burgers
('PROD-GE-004', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'Classic Burger', 'Beef patty, lettuce, tomato, cheese', 9.99, 'USD', 'Burgers', true, false, '00:00', '23:59', ARRAY['classic'], NOW()),
('PROD-GE-005', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'Double Burger', 'Two beef patties, cheese, bacon', 13.99, 'USD', 'Burgers', true, false, '00:00', '23:59', ARRAY['popular'], NOW()),
('PROD-GE-006', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'Veggie Burger', 'Plant-based patty, avocado, sprouts', 11.99, 'USD', 'Burgers', true, false, '00:00', '23:59', ARRAY['vegetarian'], NOW()),
-- Sides
('PROD-GE-007', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'Loaded Fries', 'Fries with cheese, bacon, sour cream', 7.99, 'USD', 'Sides', true, false, '00:00', '23:59', ARRAY['popular'], NOW()),
('PROD-GE-008', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'Mac n Cheese', 'Creamy mac and cheese', 6.99, 'USD', 'Sides', true, false, '00:00', '23:59', ARRAY[], NOW()),
('PROD-GE-009', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'Onion Rings', 'Crispy beer-battered onion rings', 5.99, 'USD', 'Sides', true, false, '00:00', '23:59', ARRAY[], NOW()),
-- Drinks
('PROD-GE-010', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'Soda (Large)', 'Coca-Cola, Sprite, or Fanta', 2.99, 'USD', 'Drinks', true, false, '00:00', '23:59', ARRAY[], NOW()),
('PROD-GE-011', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'Lemonade (Large)', 'Fresh squeezed lemonade', 3.99, 'USD', 'Drinks', true, false, '00:00', '23:59', ARRAY['fresh'], NOW()),
-- Desserts
('PROD-GE-012', 'BRAND-GHETTO-EATS', 'STORE-GE-001', 'Chocolate Cake', 'Rich chocolate cake slice', 5.99, 'USD', 'Desserts', true, false, '12:00', '23:59', ARRAY[], NOW())
ON CONFLICT (product_id) DO NOTHING;

-- Insert Sample Users (for testing)
INSERT INTO users (user_id, email, role, name, phone, active, created_at) VALUES
-- Customers
('USER-CUST-001', 'customer1@test.com', 'CUSTOMER', 'John Customer', '(213) 555-1001', true, NOW()),
('USER-CUST-002', 'customer2@test.com', 'CUSTOMER', 'Jane Doe', '(213) 555-1002', true, NOW()),
-- Employees (Drivers)
('USER-EMP-001', 'driver1@glenkeos.com', 'EMPLOYEE', 'Mike Driver', '(213) 555-2001', true, NOW()),
('USER-EMP-002', 'driver2@glenkeos.com', 'EMPLOYEE', 'Sarah Driver', '(213) 555-2002', true, NOW()),
-- Managers
('USER-MGR-001', 'manager1@glenkeos.com', 'MANAGER', 'Tom Manager', '(213) 555-3001', true, NOW()),
-- Corporate
('USER-CORP-001', 'corporate@glenkeos.com', 'CORPORATE', 'Alice Executive', '(213) 555-4001', true, NOW()),
-- Admin
('USER-ADMIN-001', 'admin@glenkeos.com', 'ADMIN', 'System Admin', '(213) 555-5001', true, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Insert Drivers
INSERT INTO drivers (driver_id, user_id, name, phone, email, status, vehicle_type, license_plate, rating, total_deliveries, created_at) VALUES
('DRIVER-001', 'USER-EMP-001', 'Mike Driver', '(213) 555-2001', 'driver1@glenkeos.com', 'ACTIVE', 'Car', 'ABC1234', 4.8, 150, NOW()),
('DRIVER-002', 'USER-EMP-002', 'Sarah Driver', '(213) 555-2002', 'driver2@glenkeos.com', 'ACTIVE', 'Motorcycle', 'XYZ5678', 4.9, 200, NOW())
ON CONFLICT (driver_id) DO NOTHING;

-- Insert Sample Orders
INSERT INTO orders (order_id, customer_id, store_id, brand_id, status, order_type, subtotal, tax, delivery_fee, tip, total, delivery_address, estimated_ready_time, created_at) VALUES
('ORD-001', 'USER-CUST-001', 'STORE-GE-001', 'BRAND-GHETTO-EATS', 'DELIVERED', 'DELIVERY', 29.97, 2.40, 5.99, 5.00, 43.36, '{"street": "123 Test St", "city": "Los Angeles", "state": "CA", "zip": "90001"}', NOW() + INTERVAL '30 minutes', NOW() - INTERVAL '2 hours'),
('ORD-002', 'USER-CUST-002', 'STORE-GE-001', 'BRAND-GHETTO-EATS', 'OUT_FOR_DELIVERY', 'DELIVERY', 24.98, 2.00, 5.99, 3.00, 35.97, '{"street": "456 Main Ave", "city": "Los Angeles", "state": "CA", "zip": "90025"}', NOW() + INTERVAL '15 minutes', NOW() - INTERVAL '30 minutes'),
('ORD-003', 'USER-CUST-001', 'STORE-GE-001', 'BRAND-GHETTO-EATS', 'PREPARING', 'DELIVERY', 14.99, 1.20, 5.99, 2.00, 24.18, '{"street": "123 Test St", "city": "Los Angeles", "state": "CA", "zip": "90001"}', NOW() + INTERVAL '25 minutes', NOW() - INTERVAL '10 minutes')
ON CONFLICT (order_id) DO NOTHING;

-- Insert Order Items
INSERT INTO order_items (item_id, order_id, product_id, product_name, quantity, unit_price, subtotal, created_at) VALUES
('ITEM-001', 'ORD-001', 'PROD-GE-001', 'Hot Wings 10pc', 1, 14.99, 14.99, NOW() - INTERVAL '2 hours'),
('ITEM-002', 'ORD-001', 'PROD-GE-004', 'Classic Burger', 1, 9.99, 9.99, NOW() - INTERVAL '2 hours'),
('ITEM-003', 'ORD-001', 'PROD-GE-007', 'Loaded Fries', 1, 7.99, 7.99, NOW() - INTERVAL '2 hours'),
('ITEM-004', 'ORD-002', 'PROD-GE-002', 'Hot Wings 20pc', 1, 24.99, 24.99, NOW() - INTERVAL '30 minutes'),
('ITEM-005', 'ORD-003', 'PROD-GE-001', 'Hot Wings 10pc', 1, 14.99, 14.99, NOW() - INTERVAL '10 minutes')
ON CONFLICT (item_id) DO NOTHING;

-- Insert GoldKey Bookings
INSERT INTO goldkey_bookings (booking_id, customer_id, service_type, package_tier, date, start_time, end_time, pickup_location, party_size, preferences, status, estimated_price, created_at) VALUES
('GK-BOOK-001', 'USER-CUST-001', 'black_truck', 'premium', '2026-05-10', '21:00', '02:00', '123 Test St, Los Angeles, CA', 6, '{"music": "hip-hop", "vibe": "luxury"}', 'CONFIRMED', 750.00, NOW()),
('GK-BOOK-002', 'USER-CUST-002', 'pool_party', 'elite', '2026-05-15', '15:00', '23:00', 'Private Venue, Beverly Hills, CA', 50, '{"theme": "summer vibes", "catering": "yes"}', 'PENDING_REVIEW', 5000.00, NOW())
ON CONFLICT (booking_id) DO NOTHING;

-- Success message
SELECT 'Seed data successfully inserted!' AS message;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_orders FROM orders;
SELECT COUNT(*) AS total_goldkey_bookings FROM goldkey_bookings;
