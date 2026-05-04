-- Seed: 001_seed_stores
-- Description: Seed sample stores across different brands
-- Version: 1.0.0

-- Ghetto Eats locations
INSERT INTO stores (id, name, brand, address_street, address_city, address_state, address_zip, address_country, phone, email, status, timezone, operating_hours) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Ghetto Eats - Downtown', 'Ghetto Eats', '123 Main Street', 'Atlanta', 'GA', '30303', 'USA', '+14045551001', 'downtown@ghettoeats.com', 'ACTIVE', 'America/New_York',
'{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "12:00", "close": "23:00"}, "sunday": {"open": "12:00", "close": "21:00"}}'::jsonb),

('550e8400-e29b-41d4-a716-446655440002', 'Ghetto Eats - Midtown', 'Ghetto Eats', '456 Peachtree Ave', 'Atlanta', 'GA', '30308', 'USA', '+14045551002', 'midtown@ghettoeats.com', 'ACTIVE', 'America/New_York',
'{"monday": {"open": "11:00", "close": "22:00"}, "tuesday": {"open": "11:00", "close": "22:00"}, "wednesday": {"open": "11:00", "close": "22:00"}, "thursday": {"open": "11:00", "close": "22:00"}, "friday": {"open": "11:00", "close": "23:00"}, "saturday": {"open": "12:00", "close": "23:00"}, "sunday": {"open": "12:00", "close": "21:00"}}'::jsonb),

-- Greek Royal Cuisine locations
('550e8400-e29b-41d4-a716-446655440003', 'Greek Royal Cuisine - Buckhead', 'Greek Royal Cuisine', '789 Royal Blvd', 'Atlanta', 'GA', '30305', 'USA', '+14045551003', 'buckhead@greekroyalcuisine.com', 'ACTIVE', 'America/New_York',
'{"monday": {"open": "11:30", "close": "22:30"}, "tuesday": {"open": "11:30", "close": "22:30"}, "wednesday": {"open": "11:30", "close": "22:30"}, "thursday": {"open": "11:30", "close": "22:30"}, "friday": {"open": "11:30", "close": "23:30"}, "saturday": {"open": "17:00", "close": "23:30"}, "sunday": {"open": "17:00", "close": "22:00"}}'::jsonb);

-- Add more stores in MAINTENANCE status for testing
INSERT INTO stores (id, name, brand, address_street, address_city, address_state, address_zip, address_country, status) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Ghetto Eats - East Side (Under Renovation)', 'Ghetto Eats', '321 East Ave', 'Atlanta', 'GA', '30312', 'USA', 'MAINTENANCE');
