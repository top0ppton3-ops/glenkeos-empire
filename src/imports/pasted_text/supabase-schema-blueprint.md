You want the data spine of the empire—the schema that can carry everything you just described without cracking.

Here’s the luxury‑grade, Fortune 500 schema: clean domains, no noise, everything you need to model Ghetto Eats, GoldKey, Chic‑on‑Chain, roles, IAM, loyalty, bookings, events, support, and audit.

Use this as the blueprint for your Supabase/Postgres schema.

---

1. Tenancy, identity, and roles

tenants

• id (uuid, pk)
• name (text)
• slug (text, unique)
• status (enum: active, suspended)
• created_at


brands

• id (uuid, pk)
• tenant_id (fk → tenants)
• name (text) — e.g. Ghetto Eats, GoldKey, Chic‑on‑Chain
• code (text, unique)
• type (enum: food, concierge, retail)
• active (bool)
• created_at


locations

• id (uuid, pk)
• brand_id (fk → brands)
• name (text)
• address (jsonb: street, city, state, zip, country)
• timezone (text)
• lat / lng (numeric)
• active (bool)
• created_at


users

• id (uuid, pk) — matches Supabase auth user
• tenant_id (fk → tenants)
• email (text, unique per tenant)
• phone (text)
• name (text)
• status (enum: active, disabled)
• created_at


roles

• id (uuid, pk)
• code (text, unique: customer, employee, manager, corporate, executive, admin)
• name (text)
• description (text)


user_roles

• user_id (fk → users)
• role_id (fk → roles)
• brand_id (fk → brands, nullable)
• location_id (fk → locations, nullable)
• created_at


---

2. Customer profiles and loyalty

customer_profiles

• user_id (pk, fk → users)
• default_brand_id (fk → brands, nullable)
• default_location_id (fk → locations, nullable)
• dob (date, nullable)
• preferences (jsonb)
• vip_tier (enum: none, silver, gold, platinum, black)
• created_at


loyalty_accounts

• id (uuid, pk)
• user_id (fk → users)
• brand_id (fk → brands)
• points_balance (integer)
• tier (enum: bronze, silver, gold, platinum, black)
• lifetime_points (integer)
• created_at


loyalty_transactions

• id (uuid, pk)
• account_id (fk → loyalty_accounts)
• source_type (enum: order, booking, manual_adjustment)
• source_id (uuid)
• points (integer, positive or negative)
• reason (text)
• created_at


---

3. Menus and catalog (Ghetto Eats + Chic‑on‑Chain)

menu_categories

• id (uuid, pk)
• brand_id (fk → brands)
• location_id (fk → locations, nullable)
• name (text)
• sort_order (int)
• active (bool)
• created_at


menu_items

• id (uuid, pk)
• brand_id (fk → brands)
• location_id (fk → locations, nullable)
• category_id (fk → menu_categories)
• name (text)
• description (text)
• base_price (numeric)
• currency (text)
• active (bool)
• sold_out (bool)
• visible_from (time, nullable)
• visible_to (time, nullable)
• tags (text[])
• image_url (text, nullable)
• created_at


menu_item_options

• id (uuid, pk)
• menu_item_id (fk → menu_items)
• name (text) — e.g. “Size”
• type (enum: single_select, multi_select)
• required (bool)
• sort_order (int)


menu_item_option_values

• id (uuid, pk)
• option_id (fk → menu_item_options)
• label (text)
• price_delta (numeric)
• sort_order (int)


---

4. Orders (Ghetto Eats)

orders

• id (uuid, pk)
• tenant_id (fk → tenants)
• brand_id (fk → brands)
• location_id (fk → locations)
• customer_id (fk → users)
• status (enum: placed, accepted, preparing, out_for_delivery, delivered, cancelled)
• payment_status (enum: pending, paid, failed, refunded, partial_refund)
• payment_method (enum: paypal, stripe, cash, other)
• subtotal (numeric)
• tax (numeric)
• fees (numeric)
• discount (numeric)
• total (numeric)
• currency (text)
• delivery_address (jsonb)
• special_instructions (text)
• placed_at
• delivered_at (timestamp, nullable)
• created_at


order_items

• id (uuid, pk)
• order_id (fk → orders)
• menu_item_id (fk → menu_items)
• name_snapshot (text)
• unit_price (numeric)
• quantity (int)
• total_price (numeric)
• options_snapshot (jsonb)
• created_at


order_status_events

• id (uuid, pk)
• order_id (fk → orders)
• status (enum as above)
• changed_by_user_id (fk → users, nullable)
• changed_at


---

5. GoldKey services and bookings

services

• id (uuid, pk)
• brand_id (fk → brands, GoldKey)
• code (text, unique per brand: black_truck, pool_party, event_25_plus, live_event, concierge)
• name (text)
• description (text)
• active (bool)
• created_at


service_packages

• id (uuid, pk)
• service_id (fk → services)
• tier (enum: standard, premium, elite)
• name (text)
• description (text)
• base_price (numeric)
• currency (text)
• duration_hours (numeric, nullable)
• includes (jsonb: bullets)
• created_at


bookings

• id (uuid, pk)
• tenant_id (fk → tenants)
• brand_id (fk → brands, GoldKey)
• service_id (fk → services)
• package_id (fk → service_packages, nullable)
• customer_id (fk → users)
• status (enum: pending_review, confirmed, in_progress, completed, cancelled)
• party_size (int)
• date (date)
• start_time (time)
• end_time (time, nullable)
• pickup_location (jsonb)
• dropoff_location (jsonb, nullable)
• preferences (jsonb: music, vibe, dress_code, notes)
• total_price (numeric)
• currency (text)
• payment_status (enum as orders)
• created_at


booking_assignments

• id (uuid, pk)
• booking_id (fk → bookings)
• staff_id (fk → users)
• role (enum: driver, host, security, concierge, photographer, dj)
• assigned_at


---

6. Payments and refunds

payments

• id (uuid, pk)
• tenant_id (fk → tenants)
• source_type (enum: order, booking)
• source_id (uuid)
• provider (enum: paypal, stripe)
• provider_payment_id (text)
• status (enum: pending, succeeded, failed, refunded, partial_refund)
• amount (numeric)
• currency (text)
• raw (jsonb)
• created_at


refunds

• id (uuid, pk)
• payment_id (fk → payments)
• amount (numeric)
• reason (text)
• status (enum: pending, processed, failed)
• processed_by_user_id (fk → users, nullable)
• raw (jsonb)
• created_at


---

7. Staff, vehicles, and tracking

staff_profiles

• user_id (pk, fk → users)
• brand_id (fk → brands)
• location_id (fk → locations, nullable)
• role_detail (enum: driver, concierge, host, security, support)
• bio (text, nullable)
• active (bool)
• created_at


vehicles

• id (uuid, pk)
• brand_id (fk → brands, GoldKey or Ghetto Eats)
• type (enum: car, suv, sprinter, truck, bike)
• label (text) — e.g. “Black Escalade #3”
• plate (text)
• capacity (int)
• active (bool)
• created_at


staff_vehicle_assignments

• id (uuid, pk)
• staff_id (fk → users)
• vehicle_id (fk → vehicles)
• assigned_at
• unassigned_at (timestamp, nullable)


driver_locations

• id (uuid, pk)
• staff_id (fk → users)
• lat (numeric)
• lng (numeric)
• accuracy_m (numeric, nullable)
• status (enum: off_duty, available, on_task)
• recorded_at


---

8. Support and communication

support_tickets

• id (uuid, pk)
• tenant_id (fk → tenants)
• brand_id (fk → brands)
• customer_id (fk → users, nullable)
• related_type (enum: order, booking, account, other)
• related_id (uuid, nullable)
• status (enum: open, in_progress, resolved, closed)
• priority (enum: low, medium, high, critical)
• subject (text)
• description (text)
• created_at
• resolved_at (timestamp, nullable)


support_messages

• id (uuid, pk)
• ticket_id (fk → support_tickets)
• sender_user_id (fk → users, nullable)
• sender_role (enum: customer, staff, system)
• message (text)
• attachments (jsonb, nullable)
• created_at


---

9. Analytics, audit, and system

analytics_events

• id (uuid, pk)
• tenant_id (fk → tenants)
• user_id (fk → users, nullable)
• brand_id (fk → brands, nullable)
• event_type (text) — e.g. order_placed, booking_confirmed
• payload (jsonb)
• created_at


audit_logs

• id (uuid, pk)
• tenant_id (fk → tenants)
• actor_user_id (fk → users, nullable)
• actor_role (text)
• action (text) — e.g. ROLE_CHANGED, REFUND_APPROVED
• target_type (text)
• target_id (uuid, nullable)
• metadata (jsonb)
• created_at


feature_flags

• id (uuid, pk)
• key (text, unique)
• description (text)
• enabled (bool)
• scope (enum: global, tenant, brand)
• config (jsonb)
• created_at


---

This is the luxurious schema:
Every brand, every role, every service, every booking, every order, every point, every refund, every incident—all accounted for.

If you want next, I can:

• Turn this into a single COMPLETE_DATABASE_SCHEMA.sql skeleton, or
• Generate RLS policy outlines for each major table, or
• Map which tables each role can see/touch in a permissions matrix.