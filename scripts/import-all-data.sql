-- ===========================================================================
-- GLENKEOS COMPLETE DATA IMPORT
-- Imports all JSON data into Supabase database
-- Run this AFTER creating the schema (0001_complete_schema.sql)
-- ===========================================================================

-- ===========================================================================
-- STORES DATA (8 complete locations)
-- ===========================================================================

-- Chic-on-Chain Stores
INSERT INTO stores (store_id, brand_id, store_name, store_type, address, city, state, postal_code, country, latitude, longitude, phone, email, operating_hours, active) VALUES
('store-coc-001', 'COC', 'Chic-on-Chain Downtown LA', 'FLAGSHIP', '633 W 5th Street, Suite 1100', 'Los Angeles', 'CA', '90071', 'USA', 34.0498, -118.2580, '+1 (213) 555-0001', 'downtown@chiconchain.com', '{"mon": "11:00-22:00", "tue": "11:00-22:00", "wed": "11:00-22:00", "thu": "11:00-22:00", "fri": "11:00-23:00", "sat": "12:00-23:00", "sun": "12:00-21:00"}', true),
('store-coc-002', 'COC', 'Chic-on-Chain Beverly Hills', 'PREMIUM', '9500 Wilshire Boulevard', 'Beverly Hills', 'CA', '90212', 'USA', 34.0670, -118.4005, '+1 (310) 555-0002', 'beverlyhills@chiconchain.com', '{"mon": "10:00-22:00", "tue": "10:00-22:00", "wed": "10:00-22:00", "thu": "10:00-22:00", "fri": "10:00-23:00", "sat": "10:00-23:00", "sun": "11:00-21:00"}', true),
('store-coc-003', 'COC', 'Chic-on-Chain Santa Monica', 'STANDARD', '1453 Third Street Promenade', 'Santa Monica', 'CA', '90401', 'USA', 34.0154, -118.4965, '+1 (310) 555-0003', 'santamonica@chiconchain.com', '{"mon": "11:00-21:00", "tue": "11:00-21:00", "wed": "11:00-21:00", "thu": "11:00-21:00", "fri": "11:00-22:00", "sat": "10:00-22:00", "sun": "10:00-20:00"}', true);

-- Ghetto Eats Stores
INSERT INTO stores (store_id, brand_id, store_name, store_type, address, city, state, postal_code, country, latitude, longitude, phone, email, operating_hours, active) VALUES
('store-ge-001', 'GE', 'Ghetto Eats Central LA', 'FLAGSHIP', '1234 S Central Avenue', 'Los Angeles', 'CA', '90021', 'USA', 34.0259, -118.2545, '+1 (213) 555-1001', 'central@ghettoeats.com', '{"mon": "00:00-23:59", "tue": "00:00-23:59", "wed": "00:00-23:59", "thu": "00:00-23:59", "fri": "00:00-23:59", "sat": "00:00-23:59", "sun": "00:00-23:59"}', true),
('store-ge-002', 'GE', 'Ghetto Eats USC Campus', 'CAMPUS', '3667 S Figueroa Street', 'Los Angeles', 'CA', '90007', 'USA', 34.0223, -118.2852, '+1 (213) 555-1002', 'usc@ghettoeats.com', '{"mon": "10:00-02:00", "tue": "10:00-02:00", "wed": "10:00-02:00", "thu": "10:00-03:00", "fri": "10:00-03:00", "sat": "11:00-03:00", "sun": "11:00-02:00"}', true),
('store-ge-003', 'GE', 'Ghetto Eats UCLA', 'CAMPUS', '10920 Weyburn Avenue', 'Los Angeles', 'CA', '90024', 'USA', 34.0623, -118.4455, '+1 (310) 555-1003', 'ucla@ghettoeats.com', '{"mon": "10:00-02:00", "tue": "10:00-02:00", "wed": "10:00-02:00", "thu": "10:00-03:00", "fri": "10:00-03:00", "sat": "11:00-03:00", "sun": "11:00-02:00"}', true);

-- GoldKey Stores
INSERT INTO stores (store_id, brand_id, store_name, store_type, address, city, state, postal_code, country, latitude, longitude, phone, email, operating_hours, active) VALUES
('store-gk-001', 'GK', 'GoldKey Concierge HQ', 'CONCIERGE_HQ', '1999 Avenue of the Stars, Suite 1100', 'Los Angeles', 'CA', '90067', 'USA', 34.0574, -118.4160, '+1 (310) 555-2001', 'concierge@goldkey.com', '{"mon": "00:00-23:59", "tue": "00:00-23:59", "wed": "00:00-23:59", "thu": "00:00-23:59", "fri": "00:00-23:59", "sat": "00:00-23:59", "sun": "00:00-23:59"}', true),
('store-gk-002', 'GK', 'GoldKey Newport Beach', 'ULTRA_PREMIUM', '1000 Newport Center Drive', 'Newport Beach', 'CA', '92660', 'USA', 33.6153, -117.8729, '+1 (949) 555-2002', 'newportbeach@goldkey.com', '{"mon": "09:00-21:00", "tue": "09:00-21:00", "wed": "09:00-21:00", "thu": "09:00-21:00", "fri": "09:00-22:00", "sat": "09:00-22:00", "sun": "10:00-20:00"}', true);

-- ===========================================================================
-- MENU ITEMS (12+ complete items with nutrition)
-- ===========================================================================

INSERT INTO menu_items (item_id, brand_id, item_name, description, category, base_price, prep_time_minutes, active, allergens, nutritional_info, customization_options) VALUES
-- Chic-on-Chain Menu
('item-coc-001', 'COC', 'Signature Fried Chicken', 'Our award-winning fried chicken with 11 secret herbs and spices', 'ENTREES', 1495, 15, true,
  '["wheat", "soy", "eggs"]'::jsonb,
  '{"calories": 580, "protein": 42, "carbs": 28, "fat": 32, "sodium": 1240, "fiber": 2}'::jsonb,
  '{"spice_level": ["mild", "medium", "hot", "extra_hot"], "sides": ["coleslaw", "mac_cheese", "fries", "biscuit"]}'::jsonb),

('item-coc-002', 'COC', 'Chicken Tender Platter', '4 hand-breaded chicken tenders with choice of sauce', 'ENTREES', 1295, 12, true,
  '["wheat", "soy", "eggs"]'::jsonb,
  '{"calories": 520, "protein": 38, "carbs": 32, "fat": 24, "sodium": 980, "fiber": 1}'::jsonb,
  '{"sauce": ["honey_mustard", "bbq", "ranch", "buffalo"], "count": [4, 6, 8, 12]}'::jsonb),

('item-coc-003', 'COC', 'Premium Chicken Sandwich', 'Crispy chicken breast with lettuce, tomato, and signature sauce', 'SANDWICHES', 1195, 10, true,
  '["wheat", "soy", "eggs"]'::jsonb,
  '{"calories": 680, "protein": 35, "carbs": 52, "fat": 35, "sodium": 1180, "fiber": 3}'::jsonb,
  '{"bread": ["brioche", "wheat", "gluten_free"], "toppings": ["lettuce", "tomato", "pickles", "onions", "cheese"]}'::jsonb),

-- Ghetto Eats Menu
('item-ge-001', 'GE', 'Classic Street Taco', 'Authentic street-style taco with your choice of meat', 'TACOS', 395, 5, true,
  '["gluten"]'::jsonb,
  '{"calories": 220, "protein": 18, "carbs": 22, "fat": 8, "sodium": 420, "fiber": 3}'::jsonb,
  '{"meat": ["carne_asada", "chicken", "carnitas", "al_pastor"], "toppings": ["cilantro", "onions", "salsa", "guacamole"]}'::jsonb),

('item-ge-002', 'GE', 'Loaded Burrito', 'Massive burrito packed with rice, beans, cheese, and your choice of protein', 'BURRITOS', 995, 8, true,
  '["gluten", "dairy"]'::jsonb,
  '{"calories": 920, "protein": 42, "carbs": 98, "fat": 38, "sodium": 1680, "fiber": 12}'::jsonb,
  '{"protein": ["chicken", "steak", "carnitas", "veggie"], "style": ["regular", "wet", "dry"], "extras": ["guacamole", "sour_cream", "cheese"]}'::jsonb),

('item-ge-003', 'GE', 'Crispy Chicken Wings', '10 wings tossed in your favorite sauce', 'WINGS', 1295, 15, true,
  '["wheat", "soy"]'::jsonb,
  '{"calories": 850, "protein": 72, "carbs": 18, "fat": 58, "sodium": 2240, "fiber": 0}'::jsonb,
  '{"sauce": ["buffalo", "bbq", "honey_garlic", "teriyaki", "dry_rub"], "count": [10, 20, 30, 50]}'::jsonb),

('item-ge-004', 'GE', 'Breakfast Burrito', 'Eggs, cheese, potatoes, and your choice of meat wrapped in a flour tortilla', 'BREAKFAST', 895, 6, true,
  '["gluten", "eggs", "dairy"]'::jsonb,
  '{"calories": 680, "protein": 32, "carbs": 54, "fat": 36, "sodium": 1280, "fiber": 4}'::jsonb,
  '{"meat": ["bacon", "sausage", "chorizo", "ham"], "add_ons": ["avocado", "salsa", "sour_cream"]}'::jsonb),

-- GoldKey Menu (Ultra-Premium)
('item-gk-001', 'GK', 'Wagyu Beef Slider Trio', 'Three A5 Wagyu sliders with truffle aioli and microgreens', 'APPETIZERS', 4500, 20, true,
  '["wheat", "eggs", "dairy"]'::jsonb,
  '{"calories": 720, "protein": 45, "carbs": 28, "fat": 48, "sodium": 980, "fiber": 2}'::jsonb,
  '{"doneness": ["rare", "medium_rare", "medium"], "extras": ["truffle_butter", "foie_gras"]}'::jsonb),

('item-gk-002', 'GK', 'Lobster Roll Deluxe', 'Fresh Maine lobster in butter-toasted roll with lemon aioli', 'ENTREES', 6500, 15, true,
  '["shellfish", "wheat", "eggs"]'::jsonb,
  '{"calories": 580, "protein": 38, "carbs": 42, "fat": 24, "sodium": 1120, "fiber": 1}'::jsonb,
  '{"style": ["cold", "warm"], "bread": ["brioche", "sourdough"], "extras": ["caviar", "truffle"]}'::jsonb),

('item-gk-003', 'GK', 'Omakase Nigiri Selection', 'Chef''s selection of 8 premium nigiri pieces', 'ENTREES', 8500, 25, true,
  '["fish", "soy"]'::jsonb,
  '{"calories": 420, "protein": 52, "carbs": 38, "fat": 8, "sodium": 820, "fiber": 2}'::jsonb,
  '{"sake_pairing": true, "extra_pieces": [2, 4, 6]}'::jsonb),

-- Shared/Popular Items
('item-shared-001', 'GE', 'Sweet Potato Fries', 'Crispy sweet potato fries with chipotle mayo', 'SIDES', 495, 8, true,
  '["none"]'::jsonb,
  '{"calories": 380, "protein": 4, "carbs": 52, "fat": 18, "sodium": 420, "fiber": 5}'::jsonb,
  '{"size": ["regular", "large"], "dipping_sauce": ["chipotle_mayo", "garlic_aioli", "ketchup"]}'::jsonb),

('item-shared-002', 'COC', 'Mac & Cheese Bowl', 'Creamy three-cheese mac and cheese', 'SIDES', 695, 5, true,
  '["wheat", "dairy"]'::jsonb,
  '{"calories": 520, "protein": 18, "carbs": 48, "fat": 28, "sodium": 920, "fiber": 2}'::jsonb,
  '{"size": ["small", "regular", "large"], "add_ons": ["bacon", "jalape\u00f1os", "breadcrumbs"]}'::jsonb);

-- ===========================================================================
-- DRIVERS (65 total: 45 humans, 12 robots, 8 carts)
-- ===========================================================================

-- Human Drivers (Sample of 10, you can add more)
INSERT INTO drivers (driver_id, driver_name, driver_type, phone, email, vehicle_type, vehicle_license, background_check_status, active) VALUES
('driver-h-001', 'Marcus Johnson', 'HUMAN', '+1 (213) 555-3001', 'marcus.j@glenkeos.com', 'CAR', 'CA-7XYZ123', 'APPROVED', true),
('driver-h-002', 'Sarah Chen', 'HUMAN', '+1 (310) 555-3002', 'sarah.c@glenkeos.com', 'CAR', 'CA-8ABC456', 'APPROVED', true),
('driver-h-003', 'James Rodriguez', 'HUMAN', '+1 (213) 555-3003', 'james.r@glenkeos.com', 'MOTORCYCLE', 'CA-9DEF789', 'APPROVED', true),
('driver-h-004', 'Emily Wilson', 'HUMAN', '+1 (310) 555-3004', 'emily.w@glenkeos.com', 'CAR', 'CA-1GHI234', 'APPROVED', true),
('driver-h-005', 'David Kim', 'HUMAN', '+1 (213) 555-3005', 'david.k@glenkeos.com', 'BICYCLE', NULL, 'APPROVED', true),
('driver-h-006', 'Lisa Martinez', 'HUMAN', '+1 (310) 555-3006', 'lisa.m@glenkeos.com', 'CAR', 'CA-2JKL567', 'APPROVED', true),
('driver-h-007', 'Michael Brown', 'HUMAN', '+1 (213) 555-3007', 'michael.b@glenkeos.com', 'CAR', 'CA-3MNO890', 'APPROVED', true),
('driver-h-008', 'Jessica Lee', 'HUMAN', '+1 (310) 555-3008', 'jessica.l@glenkeos.com', 'MOTORCYCLE', 'CA-4PQR123', 'APPROVED', true),
('driver-h-009', 'Robert Taylor', 'HUMAN', '+1 (213) 555-3009', 'robert.t@glenkeos.com', 'CAR', 'CA-5STU456', 'APPROVED', true),
('driver-h-010', 'Amanda Garcia', 'HUMAN', '+1 (310) 555-3010', 'amanda.g@glenkeos.com', 'BICYCLE', NULL, 'APPROVED', true);

-- Robot Drivers (All 12)
INSERT INTO drivers (driver_id, driver_name, driver_type, phone, email, vehicle_type, vehicle_license, background_check_status, active) VALUES
('driver-r-001', 'ROBO-UNIT-001', 'ROBOT', NULL, 'robot001@glenkeos.com', 'AUTONOMOUS', 'ROBO-001', 'N/A', true),
('driver-r-002', 'ROBO-UNIT-002', 'ROBOT', NULL, 'robot002@glenkeos.com', 'AUTONOMOUS', 'ROBO-002', 'N/A', true),
('driver-r-003', 'ROBO-UNIT-003', 'ROBOT', NULL, 'robot003@glenkeos.com', 'AUTONOMOUS', 'ROBO-003', 'N/A', true),
('driver-r-004', 'ROBO-UNIT-004', 'ROBOT', NULL, 'robot004@glenkeos.com', 'AUTONOMOUS', 'ROBO-004', 'N/A', true),
('driver-r-005', 'ROBO-UNIT-005', 'ROBOT', NULL, 'robot005@glenkeos.com', 'AUTONOMOUS', 'ROBO-005', 'N/A', true),
('driver-r-006', 'ROBO-UNIT-006', 'ROBOT', NULL, 'robot006@glenkeos.com', 'AUTONOMOUS', 'ROBO-006', 'N/A', true),
('driver-r-007', 'ROBO-UNIT-007', 'ROBOT', NULL, 'robot007@glenkeos.com', 'AUTONOMOUS', 'ROBO-007', 'N/A', true),
('driver-r-008', 'ROBO-UNIT-008', 'ROBOT', NULL, 'robot008@glenkeos.com', 'AUTONOMOUS', 'ROBO-008', 'N/A', true),
('driver-r-009', 'ROBO-UNIT-009', 'ROBOT', NULL, 'robot009@glenkeos.com', 'AUTONOMOUS', 'ROBO-009', 'N/A', true),
('driver-r-010', 'ROBO-UNIT-010', 'ROBOT', NULL, 'robot010@glenkeos.com', 'AUTONOMOUS', 'ROBO-010', 'N/A', true),
('driver-r-011', 'ROBO-UNIT-011', 'ROBOT', NULL, 'robot011@glenkeos.com', 'AUTONOMOUS', 'ROBO-011', 'N/A', true),
('driver-r-012', 'ROBO-UNIT-012', 'ROBOT', NULL, 'robot012@glenkeos.com', 'AUTONOMOUS', 'ROBO-012', 'N/A', true);

-- Cart Drivers (All 8)
INSERT INTO drivers (driver_id, driver_name, driver_type, phone, email, vehicle_type, vehicle_license, background_check_status, active) VALUES
('driver-c-001', 'CART-UNIT-001', 'CART', NULL, 'cart001@glenkeos.com', 'CART', 'CART-001', 'N/A', true),
('driver-c-002', 'CART-UNIT-002', 'CART', NULL, 'cart002@glenkeos.com', 'CART', 'CART-002', 'N/A', true),
('driver-c-003', 'CART-UNIT-003', 'CART', NULL, 'cart003@glenkeos.com', 'CART', 'CART-003', 'N/A', true),
('driver-c-004', 'CART-UNIT-004', 'CART', NULL, 'cart004@glenkeos.com', 'CART', 'CART-004', 'N/A', true),
('driver-c-005', 'CART-UNIT-005', 'CART', NULL, 'cart005@glenkeos.com', 'CART', 'CART-005', 'N/A', true),
('driver-c-006', 'CART-UNIT-006', 'CART', NULL, 'cart006@glenkeos.com', 'CART', 'CART-006', 'N/A', true),
('driver-c-007', 'CART-UNIT-007', 'CART', NULL, 'cart007@glenkeos.com', 'CART', 'CART-007', 'N/A', true),
('driver-c-008', 'CART-UNIT-008', 'CART', NULL, 'cart008@glenkeos.com', 'CART', 'CART-008', 'N/A', true);

-- ===========================================================================
-- COMPLIANCE RECORDS
-- ===========================================================================

INSERT INTO compliance_records (record_id, compliance_type, certification_name, status, score_percentage, issued_date, expiry_date, auditor, findings, remediation_plan) VALUES
('comp-001', 'SOC2_TYPE_II', 'SOC 2 Type II Certification', 'IN_REVIEW', 98.0, '2025-06-01', '2026-06-01', 'Deloitte Cyber',
  '{"critical": 0, "high": 2, "medium": 5, "low": 8}'::jsonb,
  '{"high": "Implement MFA for all admin accounts by Q2 2026", "medium": "Update password rotation policy to 60 days"}'::jsonb),

('comp-002', 'PCI_DSS', 'PCI DSS v4.0 Compliance', 'CERTIFIED', 100.0, '2025-03-15', '2026-03-15', 'PCI Security Standards Council',
  '{"critical": 0, "high": 0, "medium": 0, "low": 0}'::jsonb,
  '{}'::jsonb),

('comp-003', 'GDPR', 'GDPR Data Privacy Compliance', 'CERTIFIED', 96.0, '2025-01-10', '2027-01-10', 'OneTrust Privacy Solutions',
  '{"critical": 0, "high": 1, "medium": 3, "low": 5}'::jsonb,
  '{"high": "Implement automated data retention policy", "medium": "Update privacy policy for California residents"}'::jsonb),

('comp-004', 'ISO_27001', 'ISO/IEC 27001:2022 Information Security', 'IN_PROGRESS', 78.0, NULL, NULL, 'BSI Group',
  '{"critical": 2, "high": 8, "medium": 12, "low": 15}'::jsonb,
  '{"critical": "Complete penetration testing and remediation", "high": "Implement SIEM solution for security monitoring"}'::jsonb);

-- ===========================================================================
-- STAFF (Sample operational staff)
-- ===========================================================================

INSERT INTO staff (staff_id, store_id, staff_name, role, email, phone, hire_date, hourly_rate, active) VALUES
-- Downtown LA Staff
('staff-001', 'store-coc-001', 'John Smith', 'STORE_MANAGER', 'john.smith@glenkeos.com', '+1 (213) 555-4001', '2024-01-15', 28.50, true),
('staff-002', 'store-coc-001', 'Maria Gonzalez', 'KITCHEN_MANAGER', 'maria.g@glenkeos.com', '+1 (213) 555-4002', '2024-02-01', 24.00, true),
('staff-003', 'store-coc-001', 'Kevin Lee', 'LINE_COOK', 'kevin.l@glenkeos.com', '+1 (213) 555-4003', '2024-03-10', 18.50, true),
('staff-004', 'store-coc-001', 'Sophia Martinez', 'CASHIER', 'sophia.m@glenkeos.com', '+1 (213) 555-4004', '2024-04-05', 16.50, true),

-- Beverly Hills Staff
('staff-005', 'store-coc-002', 'William Johnson', 'STORE_MANAGER', 'william.j@glenkeos.com', '+1 (310) 555-4005', '2024-01-20', 32.00, true),
('staff-006', 'store-coc-002', 'Isabella Chen', 'KITCHEN_MANAGER', 'isabella.c@glenkeos.com', '+1 (310) 555-4006', '2024-02-15', 26.50, true),

-- Central LA GE Staff
('staff-007', 'store-ge-001', 'Carlos Rodriguez', 'STORE_MANAGER', 'carlos.r@glenkeos.com', '+1 (213) 555-4007', '2024-01-10', 26.00, true),
('staff-008', 'store-ge-001', 'Ana Lopez', 'LINE_COOK', 'ana.l@glenkeos.com', '+1 (213) 555-4008', '2024-03-01', 17.50, true),

-- GoldKey HQ Staff
('staff-009', 'store-gk-001', 'Alexander Hamilton', 'CONCIERGE_MANAGER', 'alex.h@glenkeos.com', '+1 (310) 555-4009', '2024-01-05', 45.00, true),
('staff-010', 'store-gk-001', 'Victoria Sterling', 'EXECUTIVE_CHEF', 'victoria.s@glenkeos.com', '+1 (310) 555-4010', '2024-01-08', 55.00, true);

-- ===========================================================================
-- SUCCESS MESSAGE
-- ===========================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATA IMPORT COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Stores: 8 locations imported';
  RAISE NOTICE 'Menu Items: 12 items with full nutrition';
  RAISE NOTICE 'Drivers: 20 sample drivers (10 human, 12 robot, 8 cart)';
  RAISE NOTICE 'Compliance: 4 certification records';
  RAISE NOTICE 'Staff: 10 operational staff members';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Verify data in Table Editor';
  RAISE NOTICE '2. Add PayPal secrets to Edge Functions';
  RAISE NOTICE '3. Switch frontend from mock to real backend';
  RAISE NOTICE '========================================';
END $$;
