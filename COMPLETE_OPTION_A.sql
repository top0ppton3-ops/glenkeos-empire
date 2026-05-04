-- OPTION A: DROP EVERYTHING & REBUILD
-- WARNING: This destroys ALL data in the database
-- Only use in dev/test environments

-- ============================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ============================================

-- Drop tables in correct order (reverse of dependencies)
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS order_snapshots CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_item_options CASCADE;
DROP TABLE IF EXISTS menu_options CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS pricing_rules CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;
DROP TABLE IF EXISTS support_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS assignment_status CASCADE;
DROP TYPE IF EXISTS assignment_type CASCADE;
DROP TYPE IF EXISTS support_status CASCADE;
DROP TYPE IF EXISTS support_priority CASCADE;
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS prevent_ledger_modification() CASCADE;
DROP FUNCTION IF EXISTS add_payment_method_card(UUID, TEXT, TEXT, TEXT, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS create_payment_intent(UUID, UUID, INTEGER, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS capture_payment(UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS get_user_payment_methods(UUID) CASCADE;
DROP FUNCTION IF EXISTS set_default_payment_method(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS create_refund(UUID, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS complete_refund(UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS create_ticket(UUID, UUID, TEXT, UUID, TEXT, TEXT, support_priority, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_ticket_messages(UUID) CASCADE;
DROP FUNCTION IF EXISTS add_ticket_message(UUID, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS assign_ticket(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS resolve_ticket(UUID) CASCADE;
DROP FUNCTION IF EXISTS assign_staff_to_order(UUID, UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS assign_driver_to_delivery(UUID, UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_staff_assignments(UUID, assignment_status) CASCADE;
DROP FUNCTION IF EXISTS update_assignment_status(UUID, assignment_status) CASCADE;
DROP FUNCTION IF EXISTS release_assignment(UUID) CASCADE;
DROP FUNCTION IF EXISTS reassign_assignment(UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS resolve_delivery(TEXT, TEXT, UUID) CASCADE;

-- ============================================
-- CONFIRMATION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ All tables, types, and functions dropped';
  RAISE NOTICE '📋 Next: Run all migrations in order';
  RAISE NOTICE '⚠️  All data has been destroyed';
END $$;


-- ============================================
-- REBUILD: Run all migrations in order
-- ============================================
-- Enable required PostgreSQL extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "http";
-- Base Schema - user_roles table

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'driver', 'manager', 'support', 'corporate', 'executive')),
  tenant_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant ON user_roles(tenant_id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own roles" ON user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Corporate users manage roles" ON user_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('corporate', 'executive')
  )
);
-- Support Ticketing System
-- Full customer support infrastructure with tickets and messages

-- Enums
CREATE TYPE support_status AS ENUM ('open', 'in_progress', 'resolved', 'escalated', 'closed');
CREATE TYPE support_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- Support Tickets Table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  tenant_id UUID NOT NULL,
  brand_id TEXT NOT NULL,
  location_id UUID,
  subject TEXT NOT NULL,
  status support_status NOT NULL DEFAULT 'open',
  priority support_priority NOT NULL DEFAULT 'normal',
  category TEXT,
  order_id UUID,
  items_snapshot JSONB,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Support Messages Table
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_brand ON support_tickets(brand_id);
CREATE INDEX idx_support_tickets_location ON support_tickets(location_id);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_messages_ticket ON support_messages(ticket_id);

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Customers can view their own tickets
CREATE POLICY "Customers view own tickets"
ON support_tickets FOR SELECT
USING (auth.uid() = user_id);

-- Customers can create tickets
CREATE POLICY "Customers create tickets"
ON support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Support staff can view all tickets
CREATE POLICY "Support staff view tickets"
ON support_tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('support', 'corporate', 'executive')
  )
);

-- Support staff can update tickets
CREATE POLICY "Support staff update tickets"
ON support_tickets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('support', 'corporate', 'executive')
  )
);

-- Managers can view tickets for their location
CREATE POLICY "Managers view location tickets"
ON support_tickets FOR SELECT
USING (
  location_id IN (
    SELECT id FROM locations WHERE manager_id = auth.uid()
  )
);

-- Customers can view messages for their tickets
CREATE POLICY "Customers view own ticket messages"
ON support_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid()
  )
);

-- Customers can add messages to their tickets
CREATE POLICY "Customers add messages"
ON support_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid()
  )
);

-- Support staff can view all messages
CREATE POLICY "Support staff view messages"
ON support_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('support', 'corporate', 'executive')
  )
);

-- Support staff can add messages
CREATE POLICY "Support staff add messages"
ON support_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('support', 'corporate', 'executive')
  )
);

-- RPCs
CREATE OR REPLACE FUNCTION create_ticket(
  p_user_id UUID,
  p_tenant_id UUID,
  p_brand_id TEXT,
  p_location_id UUID,
  p_subject TEXT,
  p_category TEXT,
  p_priority support_priority,
  p_message TEXT,
  p_order_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket_id UUID;
BEGIN
  -- Create ticket
  INSERT INTO support_tickets (
    user_id,
    tenant_id,
    brand_id,
    location_id,
    subject,
    status,
    priority,
    category,
    order_id
  )
  VALUES (
    p_user_id,
    p_tenant_id,
    p_brand_id,
    p_location_id,
    p_subject,
    'open',
    p_priority,
    p_category,
    p_order_id
  )
  RETURNING id INTO v_ticket_id;

  -- Add first message
  INSERT INTO support_messages (ticket_id, sender_role, sender_id, message)
  VALUES (v_ticket_id, 'customer', p_user_id, p_message);

  RETURN v_ticket_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_ticket_messages(p_ticket_id UUID)
RETURNS TABLE (
  id UUID,
  ticket_id UUID,
  sender_role TEXT,
  sender_id UUID,
  message TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.ticket_id,
    m.sender_role,
    m.sender_id,
    m.message,
    m.attachments,
    m.created_at
  FROM support_messages m
  WHERE m.ticket_id = p_ticket_id
  ORDER BY m.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION add_ticket_message(
  p_ticket_id UUID,
  p_sender_role TEXT,
  p_sender_id UUID,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id UUID;
BEGIN
  INSERT INTO support_messages (ticket_id, sender_role, sender_id, message)
  VALUES (p_ticket_id, p_sender_role, p_sender_id, p_message)
  RETURNING id INTO v_message_id;

  -- Update ticket timestamp
  UPDATE support_tickets
  SET updated_at = NOW()
  WHERE id = p_ticket_id;

  RETURN v_message_id;
END;
$$;

CREATE OR REPLACE FUNCTION assign_ticket(
  p_ticket_id UUID,
  p_assigned_to UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE support_tickets
  SET
    assigned_to = p_assigned_to,
    status = 'in_progress',
    updated_at = NOW()
  WHERE id = p_ticket_id;
END;
$$;

CREATE OR REPLACE FUNCTION resolve_ticket(p_ticket_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE support_tickets
  SET
    status = 'resolved',
    resolved_at = NOW(),
    updated_at = NOW()
  WHERE id = p_ticket_id;
END;
$$;
-- Assignment Engine
-- Unified assignment tracking for orders, deliveries, and bookings

-- Enums
CREATE TYPE assignment_status AS ENUM ('assigned', 'accepted', 'in_progress', 'completed', 'released');
CREATE TYPE assignment_type AS ENUM ('order', 'delivery', 'booking', 'support');

-- Assignments Table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type assignment_type NOT NULL,
  target_id UUID NOT NULL,
  staff_id UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  status assignment_status NOT NULL DEFAULT 'assigned',
  location_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_assignments_staff ON assignments(staff_id);
CREATE INDEX idx_assignments_type_target ON assignments(type, target_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_location ON assignments(location_id);

-- Unique constraint: only one active assignment per target
CREATE UNIQUE INDEX idx_assignments_active_target
ON assignments(type, target_id)
WHERE status IN ('assigned', 'accepted', 'in_progress');

-- RLS Policies
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Staff can view their own assignments
CREATE POLICY "Staff view own assignments"
ON assignments FOR SELECT
USING (auth.uid() = staff_id);

-- Staff can update their own assignments
CREATE POLICY "Staff update own assignments"
ON assignments FOR UPDATE
USING (auth.uid() = staff_id);

-- Managers can view assignments for their location
CREATE POLICY "Managers view location assignments"
ON assignments FOR SELECT
USING (
  location_id IN (
    SELECT id FROM locations WHERE manager_id = auth.uid()
  )
);

-- Managers can create assignments
CREATE POLICY "Managers create assignments"
ON assignments FOR INSERT
WITH CHECK (
  location_id IN (
    SELECT id FROM locations WHERE manager_id = auth.uid()
  )
);

-- Managers can update assignments
CREATE POLICY "Managers update assignments"
ON assignments FOR UPDATE
USING (
  location_id IN (
    SELECT id FROM locations WHERE manager_id = auth.uid()
  )
);

-- RPCs
CREATE OR REPLACE FUNCTION assign_staff_to_order(
  p_order_id UUID,
  p_staff_id UUID,
  p_assigned_by UUID,
  p_location_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  INSERT INTO assignments (type, target_id, staff_id, assigned_by, location_id, status)
  VALUES ('order', p_order_id, p_staff_id, p_assigned_by, p_location_id, 'assigned')
  RETURNING id INTO v_assignment_id;

  RETURN v_assignment_id;
END;
$$;

CREATE OR REPLACE FUNCTION assign_driver_to_delivery(
  p_delivery_id UUID,
  p_driver_id UUID,
  p_assigned_by UUID,
  p_location_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  INSERT INTO assignments (type, target_id, staff_id, assigned_by, location_id, status)
  VALUES ('delivery', p_delivery_id, p_driver_id, p_assigned_by, p_location_id, 'assigned')
  RETURNING id INTO v_assignment_id;

  RETURN v_assignment_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_staff_assignments(
  p_staff_id UUID,
  p_status assignment_status DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  type assignment_type,
  target_id UUID,
  status assignment_status,
  location_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_status IS NULL THEN
    RETURN QUERY
    SELECT a.id, a.type, a.target_id, a.status, a.location_id, a.notes,
           a.created_at, a.accepted_at, a.started_at
    FROM assignments a
    WHERE a.staff_id = p_staff_id
    AND a.status IN ('assigned', 'accepted', 'in_progress')
    ORDER BY a.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT a.id, a.type, a.target_id, a.status, a.location_id, a.notes,
           a.created_at, a.accepted_at, a.started_at
    FROM assignments a
    WHERE a.staff_id = p_staff_id
    AND a.status = p_status
    ORDER BY a.created_at DESC;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION update_assignment_status(
  p_assignment_id UUID,
  p_status assignment_status
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE assignments
  SET
    status = p_status,
    updated_at = NOW(),
    accepted_at = CASE WHEN p_status = 'accepted' AND accepted_at IS NULL THEN NOW() ELSE accepted_at END,
    started_at = CASE WHEN p_status = 'in_progress' AND started_at IS NULL THEN NOW() ELSE started_at END,
    completed_at = CASE WHEN p_status = 'completed' AND completed_at IS NULL THEN NOW() ELSE completed_at END
  WHERE id = p_assignment_id;
END;
$$;

CREATE OR REPLACE FUNCTION release_assignment(p_assignment_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE assignments
  SET status = 'released', updated_at = NOW()
  WHERE id = p_assignment_id;
END;
$$;

CREATE OR REPLACE FUNCTION reassign_assignment(
  p_assignment_id UUID,
  p_new_staff_id UUID,
  p_assigned_by UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE assignments
  SET
    staff_id = p_new_staff_id,
    assigned_by = p_assigned_by,
    status = 'assigned',
    updated_at = NOW(),
    accepted_at = NULL,
    started_at = NULL
  WHERE id = p_assignment_id;
END;
$$;
-- Notifications Engine
-- Real-time notification infrastructure with auto-cleanup

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_role ON notifications(role);
CREATE INDEX idx_notifications_read ON notifications(read_at);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users mark own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- System can create notifications (executed via service role)
CREATE POLICY "System creates notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Auto-cleanup function: keeps last 100 notifications per user
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM notifications
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM notifications
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 100
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-cleanup after insert
CREATE TRIGGER trigger_cleanup_notifications
AFTER INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION cleanup_old_notifications();

-- RPCs
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read_at = NOW()
  WHERE id = p_notification_id
  AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read_at = NOW()
  WHERE user_id = p_user_id
  AND read_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
  AND read_at IS NULL;

  RETURN v_count;
END;
$$;

-- Notification helpers for common events
CREATE OR REPLACE FUNCTION notify_new_order(
  p_user_id UUID,
  p_order_id UUID,
  p_order_number TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, payload)
  VALUES (
    p_user_id,
    'order',
    'New Order',
    'Order ' || p_order_number || ' has been placed',
    jsonb_build_object('order_id', p_order_id, 'order_number', p_order_number)
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION notify_assignment(
  p_staff_id UUID,
  p_assignment_type TEXT,
  p_target_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, payload)
  VALUES (
    p_staff_id,
    'assignment',
    'New Assignment',
    'You have been assigned to a new ' || p_assignment_type,
    jsonb_build_object('assignment_type', p_assignment_type, 'target_id', p_target_id)
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION notify_ticket_update(
  p_user_id UUID,
  p_ticket_id UUID,
  p_subject TEXT,
  p_status TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, payload)
  VALUES (
    p_user_id,
    'support',
    'Ticket Update',
    'Your support ticket "' || p_subject || '" status: ' || p_status,
    jsonb_build_object('ticket_id', p_ticket_id, 'status', p_status)
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Trigger to notify staff on new assignment
CREATE OR REPLACE FUNCTION notify_staff_new_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM notify_assignment(NEW.staff_id, NEW.type::TEXT, NEW.target_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_assignment_created
AFTER INSERT ON assignments
FOR EACH ROW
EXECUTE FUNCTION notify_staff_new_assignment();

-- Trigger to notify managers on new ticket
CREATE OR REPLACE FUNCTION notify_manager_new_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_manager_id UUID;
BEGIN
  -- Get manager for the location
  IF NEW.location_id IS NOT NULL THEN
    SELECT manager_id INTO v_manager_id
    FROM locations
    WHERE id = NEW.location_id;

    IF v_manager_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, message, payload)
      VALUES (
        v_manager_id,
        'support',
        'New Support Ticket',
        'New ticket: ' || NEW.subject,
        jsonb_build_object('ticket_id', NEW.id, 'subject', NEW.subject, 'priority', NEW.priority)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_ticket_created
AFTER INSERT ON support_tickets
FOR EACH ROW
EXECUTE FUNCTION notify_manager_new_ticket();
-- Delivery Engine
-- Logistics brain of the empire

-- Enums
CREATE TYPE delivery_status AS ENUM ('pending', 'assigned', 'picked_up', 'en_route', 'delivered', 'failed');

-- Delivery Zones Table
CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id TEXT NOT NULL,
  location_id UUID,
  name TEXT NOT NULL,
  polygon JSONB,
  base_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  per_mile_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deliveries Table
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  driver_id UUID REFERENCES auth.users(id),
  status delivery_status NOT NULL DEFAULT 'pending',
  eta TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_location JSONB,
  delivery_fee DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_delivery_zones_brand_location ON delivery_zones(brand_id, location_id);
CREATE INDEX idx_delivery_zones_active ON delivery_zones(active);
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- RLS Policies
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Managers can see/edit zones for their locations
CREATE POLICY "Managers manage location zones"
ON delivery_zones FOR ALL
USING (
  location_id IN (
    SELECT id FROM locations WHERE manager_id = auth.uid()
  )
);

-- Customers can see zones (for fee calculation)
CREATE POLICY "Customers see zones"
ON delivery_zones FOR SELECT
USING (active = true);

-- Drivers can see their own deliveries
CREATE POLICY "Drivers see own deliveries"
ON deliveries FOR SELECT
USING (auth.uid() = driver_id);

-- Drivers can update their own deliveries
CREATE POLICY "Drivers update own deliveries"
ON deliveries FOR UPDATE
USING (auth.uid() = driver_id);

-- Managers can see deliveries for their location
CREATE POLICY "Managers see location deliveries"
ON deliveries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM locations WHERE manager_id = auth.uid()
  )
);

-- Managers can create/update deliveries
CREATE POLICY "Managers manage deliveries"
ON deliveries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM locations WHERE manager_id = auth.uid()
  )
);

-- RPCs
CREATE OR REPLACE FUNCTION resolve_delivery(
  p_address TEXT,
  p_brand_id TEXT,
  p_location_id UUID
)
RETURNS TABLE (
  zone_id UUID,
  zone_name TEXT,
  base_fee DECIMAL,
  per_mile_fee DECIMAL,
  total_fee DECIMAL,
  estimated_eta TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_zone RECORD;
  v_distance_miles DECIMAL := 3.5; -- Mock distance calculation
BEGIN
  -- Find active zone for location
  -- In production, this would use PostGIS for polygon matching
  SELECT * INTO v_zone
  FROM delivery_zones
  WHERE brand_id = p_brand_id
  AND (location_id = p_location_id OR location_id IS NULL)
  AND active = true
  LIMIT 1;

  IF v_zone IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Calculate total fee
  RETURN QUERY
  SELECT
    v_zone.id,
    v_zone.name,
    v_zone.base_fee,
    v_zone.per_mile_fee,
    v_zone.base_fee + (v_zone.per_mile_fee * v_distance_miles),
    NOW() + INTERVAL '30 minutes';
END;
$$;

CREATE OR REPLACE FUNCTION create_delivery(
  p_order_id UUID,
  p_delivery_fee DECIMAL DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_delivery_id UUID;
BEGIN
  INSERT INTO deliveries (order_id, status, delivery_fee, eta)
  VALUES (p_order_id, 'pending', p_delivery_fee, NOW() + INTERVAL '30 minutes')
  RETURNING id INTO v_delivery_id;

  RETURN v_delivery_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_delivery_status(
  p_delivery_id UUID,
  p_status delivery_status,
  p_eta TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE deliveries
  SET
    status = p_status,
    eta = COALESCE(p_eta, eta),
    started_at = CASE WHEN p_status = 'en_route' AND started_at IS NULL THEN NOW() ELSE started_at END,
    completed_at = CASE WHEN p_status IN ('delivered', 'failed') AND completed_at IS NULL THEN NOW() ELSE completed_at END,
    updated_at = NOW()
  WHERE id = p_delivery_id;
END;
$$;

CREATE OR REPLACE FUNCTION assign_driver_to_delivery(
  p_delivery_id UUID,
  p_driver_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE deliveries
  SET driver_id = p_driver_id, status = 'assigned', updated_at = NOW()
  WHERE id = p_delivery_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_driver_deliveries(p_driver_id UUID)
RETURNS TABLE (
  id UUID,
  order_id UUID,
  driver_id UUID,
  status delivery_status,
  eta TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  delivery_fee DECIMAL,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.order_id, d.driver_id, d.status, d.eta, d.started_at, d.completed_at, d.delivery_fee, d.created_at
  FROM deliveries d
  WHERE d.driver_id = p_driver_id
  AND d.status IN ('assigned', 'picked_up', 'en_route')
  ORDER BY d.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION update_delivery_location(
  p_delivery_id UUID,
  p_latitude DECIMAL,
  p_longitude DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE deliveries
  SET
    last_location = jsonb_build_object(
      'latitude', p_latitude,
      'longitude', p_longitude,
      'timestamp', NOW()
    ),
    updated_at = NOW()
  WHERE id = p_delivery_id;
END;
$$;

-- Insert default delivery zones
INSERT INTO delivery_zones (brand_id, name, base_fee, per_mile_fee, active)
VALUES
  ('ghetto-eats', 'Downtown Zone', 4.99, 1.50, true),
  ('ghetto-eats', 'Suburban Zone', 3.99, 2.00, true),
  ('chic-on-chain', 'Downtown Zone', 5.99, 1.75, true),
  ('chic-on-chain', 'Suburban Zone', 4.99, 2.25, true),
  ('goldkey', 'Premium Zone', 0.00, 0.00, true);
-- Pricing Engine
-- Server-side pricing calculation (Frontend NEVER calculates prices)

-- Pricing Rules Table
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id TEXT,
  location_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'happy_hour', 'time_window', 'day_of_week', 'surge', 'discount'
  modifier_type TEXT NOT NULL, -- 'percentage', 'absolute'
  modifier_value DECIMAL(10, 2) NOT NULL,
  start_time TIME,
  end_time TIME,
  days TEXT[], -- ['monday', 'tuesday', ...]
  applies_to TEXT NOT NULL DEFAULT 'all', -- 'all', 'category', 'item'
  target_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promotions Table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id TEXT,
  location_id UUID,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'percentage', 'absolute', 'bogo', 'free_delivery'
  value DECIMAL(10, 2) NOT NULL,
  min_subtotal DECIMAL(10, 2),
  max_uses INTEGER,
  max_uses_per_user INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  loyalty_tier_required TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promo Usage Tracking
CREATE TABLE promo_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_id UUID NOT NULL REFERENCES promotions(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pricing_rules_brand ON pricing_rules(brand_id);
CREATE INDEX idx_pricing_rules_location ON pricing_rules(location_id);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(active);
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_active ON promotions(active);
CREATE INDEX idx_promo_usage_user ON promo_usage(user_id);
CREATE INDEX idx_promo_usage_promo ON promo_usage(promo_id);

-- RLS Policies
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_usage ENABLE ROW LEVEL SECURITY;

-- Managers can manage pricing rules for their locations
CREATE POLICY "Managers manage location pricing rules"
ON pricing_rules FOR ALL
USING (
  location_id IN (
    SELECT id FROM locations WHERE manager_id = auth.uid()
  )
);

-- Corporate can manage brand-level pricing rules
CREATE POLICY "Corporate manages brand pricing rules"
ON pricing_rules FOR ALL
USING (
  brand_id IS NOT NULL AND location_id IS NULL
  AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'corporate'
  )
);

-- Managers can manage promotions for their locations
CREATE POLICY "Managers manage location promotions"
ON promotions FOR ALL
USING (
  location_id IN (
    SELECT id FROM locations WHERE manager_id = auth.uid()
  )
);

-- Corporate can manage brand-level promotions
CREATE POLICY "Corporate manages brand promotions"
ON promotions FOR ALL
USING (
  brand_id IS NOT NULL AND location_id IS NULL
  AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'corporate'
  )
);

-- Users can see active promotions
CREATE POLICY "Users see active promotions"
ON promotions FOR SELECT
USING (active = true);

-- Core Pricing Engine RPC: resolve_menu
-- Returns menu items with effective prices after applying pricing rules
CREATE OR REPLACE FUNCTION resolve_menu(
  p_brand_id TEXT,
  p_location_id UUID
)
RETURNS TABLE (
  item_id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  base_price DECIMAL,
  effective_price DECIMAL,
  available BOOLEAN,
  dietary_tags TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- In production, this would:
  -- 1. Get all menu items for brand
  -- 2. Apply location overrides
  -- 3. Apply pricing rules (brand-level then location-level)
  -- 4. Check sold-out status
  -- 5. Return resolved menu with effective prices

  -- Mock implementation for now
  RETURN QUERY
  SELECT
    gen_random_uuid() as item_id,
    'Sample Item' as name,
    'Description' as description,
    'Main' as category,
    10.00::DECIMAL as base_price,
    10.00::DECIMAL as effective_price,
    true as available,
    ARRAY['vegetarian']::TEXT[] as dietary_tags;
END;
$$;

-- Core Pricing Engine RPC: resolve_pricing
-- Calculates final order total with all discounts, fees, and taxes
CREATE OR REPLACE FUNCTION resolve_pricing(
  p_cart JSONB,
  p_user_id UUID,
  p_location_id UUID,
  p_promo_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  subtotal DECIMAL,
  promo_discount DECIMAL,
  loyalty_discount DECIMAL,
  delivery_fee DECIMAL,
  service_fee DECIMAL,
  tax DECIMAL,
  total DECIMAL,
  promo_code_applied TEXT,
  loyalty_points_earned INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subtotal DECIMAL := 0;
  v_promo_discount DECIMAL := 0;
  v_loyalty_discount DECIMAL := 0;
  v_delivery_fee DECIMAL := 0;
  v_service_fee DECIMAL := 0;
  v_tax DECIMAL := 0;
  v_total DECIMAL := 0;
  v_promo_code_applied TEXT := NULL;
  v_loyalty_points_earned INTEGER := 0;
  v_promo RECORD;
  v_cart_item JSONB;
BEGIN
  -- Calculate subtotal from cart
  FOR v_cart_item IN SELECT * FROM jsonb_array_elements(p_cart)
  LOOP
    v_subtotal := v_subtotal + ((v_cart_item->>'price')::DECIMAL * (v_cart_item->>'quantity')::INTEGER);
  END LOOP;

  -- Apply promo code if provided
  IF p_promo_code IS NOT NULL THEN
    SELECT * INTO v_promo
    FROM promotions
    WHERE code = p_promo_code
    AND active = true
    AND start_date <= NOW()
    AND end_date >= NOW()
    AND (min_subtotal IS NULL OR v_subtotal >= min_subtotal)
    LIMIT 1;

    IF v_promo IS NOT NULL THEN
      -- Check usage limits
      IF (v_promo.max_uses IS NULL OR v_promo.uses_count < v_promo.max_uses) AND
         (v_promo.max_uses_per_user IS NULL OR
          (SELECT COUNT(*) FROM promo_usage WHERE promo_id = v_promo.id AND user_id = p_user_id) < v_promo.max_uses_per_user)
      THEN
        IF v_promo.type = 'percentage' THEN
          v_promo_discount := v_subtotal * (v_promo.value / 100);
        ELSIF v_promo.type = 'absolute' THEN
          v_promo_discount := v_promo.value;
        END IF;
        v_promo_code_applied := p_promo_code;
      END IF;
    END IF;
  END IF;

  -- Apply loyalty discount (mock - in production, fetch loyalty tier)
  -- v_loyalty_discount := v_subtotal * 0.05; -- 5% for VIP tier

  -- Calculate fees
  v_delivery_fee := 5.99; -- Mock - in production, use resolve_delivery
  v_service_fee := v_subtotal * 0.05; -- 5% service fee

  -- Calculate tax (mock - 8.5%)
  v_tax := (v_subtotal - v_promo_discount - v_loyalty_discount + v_delivery_fee + v_service_fee) * 0.085;

  -- Calculate total
  v_total := v_subtotal - v_promo_discount - v_loyalty_discount + v_delivery_fee + v_service_fee + v_tax;

  -- Calculate loyalty points earned (1 point per dollar)
  v_loyalty_points_earned := FLOOR(v_subtotal);

  RETURN QUERY
  SELECT
    v_subtotal,
    v_promo_discount,
    v_loyalty_discount,
    v_delivery_fee,
    v_service_fee,
    v_tax,
    v_total,
    v_promo_code_applied,
    v_loyalty_points_earned;
END;
$$;

-- Validate promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_user_id UUID,
  p_subtotal DECIMAL
)
RETURNS TABLE (
  valid BOOLEAN,
  promo_id UUID,
  discount_type TEXT,
  discount_value DECIMAL,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo RECORD;
  v_user_uses INTEGER;
BEGIN
  -- Find promo
  SELECT * INTO v_promo
  FROM promotions
  WHERE code = p_code
  AND active = true;

  -- Not found
  IF v_promo IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'Invalid promo code'::TEXT;
    RETURN;
  END IF;

  -- Check date range
  IF v_promo.start_date > NOW() THEN
    RETURN QUERY SELECT false, v_promo.id, NULL::TEXT, NULL::DECIMAL, 'Promo not started yet'::TEXT;
    RETURN;
  END IF;

  IF v_promo.end_date < NOW() THEN
    RETURN QUERY SELECT false, v_promo.id, NULL::TEXT, NULL::DECIMAL, 'Promo expired'::TEXT;
    RETURN;
  END IF;

  -- Check min subtotal
  IF v_promo.min_subtotal IS NOT NULL AND p_subtotal < v_promo.min_subtotal THEN
    RETURN QUERY SELECT false, v_promo.id, NULL::TEXT, NULL::DECIMAL,
      'Minimum order of $' || v_promo.min_subtotal || ' required'::TEXT;
    RETURN;
  END IF;

  -- Check max uses
  IF v_promo.max_uses IS NOT NULL AND v_promo.uses_count >= v_promo.max_uses THEN
    RETURN QUERY SELECT false, v_promo.id, NULL::TEXT, NULL::DECIMAL, 'Promo usage limit reached'::TEXT;
    RETURN;
  END IF;

  -- Check per-user limit
  IF v_promo.max_uses_per_user IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_uses
    FROM promo_usage
    WHERE promo_id = v_promo.id AND user_id = p_user_id;

    IF v_user_uses >= v_promo.max_uses_per_user THEN
      RETURN QUERY SELECT false, v_promo.id, NULL::TEXT, NULL::DECIMAL, 'You have already used this promo'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Valid!
  RETURN QUERY SELECT true, v_promo.id, v_promo.type, v_promo.value, 'Valid'::TEXT;
END;
$$;

-- Record promo usage
CREATE OR REPLACE FUNCTION record_promo_usage(
  p_promo_id UUID,
  p_user_id UUID,
  p_order_id UUID,
  p_discount_amount DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert usage record
  INSERT INTO promo_usage (promo_id, user_id, order_id, discount_amount)
  VALUES (p_promo_id, p_user_id, p_order_id, p_discount_amount);

  -- Increment uses count
  UPDATE promotions
  SET uses_count = uses_count + 1
  WHERE id = p_promo_id;
END;
$$;
-- Order Snapshotting
-- Immutable JSONB snapshots of menu items frozen at order time
-- Ensures order integrity even if menu changes

-- Add snapshot column to orders table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'items_snapshot'
  ) THEN
    ALTER TABLE orders ADD COLUMN items_snapshot JSONB NOT NULL DEFAULT '[]';
  END IF;
END $$;

-- Add snapshot column to order_items (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'item_snapshot'
  ) THEN
    ALTER TABLE order_items ADD COLUMN item_snapshot JSONB NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- Create index for snapshot queries
CREATE INDEX IF NOT EXISTS idx_orders_items_snapshot ON orders USING GIN (items_snapshot);

-- Function to create order with snapshot
CREATE OR REPLACE FUNCTION create_order_with_snapshot(
  p_customer_id UUID,
  p_tenant_id UUID,
  p_location_id UUID,
  p_items JSONB,
  p_pricing JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- Create order with items snapshot
  INSERT INTO orders (
    customer_id,
    tenant_id,
    location_id,
    items_snapshot,
    status,
    subtotal,
    total,
    created_at
  )
  VALUES (
    p_customer_id,
    p_tenant_id,
    p_location_id,
    p_items,
    'pending',
    (p_pricing->>'subtotal')::DECIMAL,
    (p_pricing->>'total')::DECIMAL,
    NOW()
  )
  RETURNING order_id INTO v_order_id;

  -- Create order_items with individual snapshots
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      menu_item_id,
      item_snapshot,
      quantity,
      price
    )
    VALUES (
      v_order_id,
      (v_item->>'item_id')::UUID,
      v_item,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::DECIMAL
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- Function to get order with snapshots
CREATE OR REPLACE FUNCTION get_order_with_snapshots(p_order_id UUID)
RETURNS TABLE (
  order_id UUID,
  customer_id UUID,
  tenant_id UUID,
  location_id UUID,
  status TEXT,
  items_snapshot JSONB,
  subtotal DECIMAL,
  total DECIMAL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.order_id,
    o.customer_id,
    o.tenant_id,
    o.location_id,
    o.status,
    o.items_snapshot,
    o.subtotal,
    o.total,
    o.created_at,
    o.updated_at
  FROM orders o
  WHERE o.order_id = p_order_id;
END;
$$;

-- Trigger to ensure snapshots are immutable
CREATE OR REPLACE FUNCTION prevent_snapshot_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.items_snapshot IS DISTINCT FROM NEW.items_snapshot THEN
    RAISE EXCEPTION 'Order snapshots are immutable and cannot be modified';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_orders_snapshot_change
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION prevent_snapshot_modification();

-- Comment explaining the snapshot architecture
COMMENT ON COLUMN orders.items_snapshot IS 'Immutable JSONB snapshot of all menu items at order time. Preserves pricing, options, and item details even if menu changes.';
COMMENT ON COLUMN order_items.item_snapshot IS 'Immutable JSONB snapshot of individual menu item at order time.';
-- Complete Payment System
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card', 'apple_pay', 'cash_app')),
  provider_reference TEXT NOT NULL,
  brand TEXT,
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT NOT NULL,
  provider_reference TEXT,
  provider_raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  provider_reference TEXT,
  provider_raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  order_id UUID,
  user_id UUID REFERENCES auth.users(id),
  debit_account TEXT NOT NULL,
  credit_account TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_ledger_payment ON ledger_entries(payment_id);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payment methods" ON payment_methods FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users view own payments" ON payments FOR SELECT
USING (user_id = auth.uid());
-- Menu Options and Bookings
-- Completes the enterprise data model with menu customization and GoldKey bookings

-- ============================================
-- MENU OPTION GROUPS
-- ============================================
CREATE TABLE IF NOT EXISTS menu_option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_select INTEGER DEFAULT 0,
  max_select INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_option_groups_item ON menu_option_groups(item_id);
CREATE INDEX IF NOT EXISTS idx_menu_option_groups_sort ON menu_option_groups(item_id, sort_order);

COMMENT ON TABLE menu_option_groups IS 'Customization groups for menu items (Size, Add-ons, Extras, etc.)';
COMMENT ON COLUMN menu_option_groups.min_select IS 'Minimum number of options user must select';
COMMENT ON COLUMN menu_option_groups.max_select IS 'Maximum number of options user can select';

-- ============================================
-- MENU OPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS menu_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES menu_option_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_delta DECIMAL(10,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_options_group ON menu_options(group_id);
CREATE INDEX IF NOT EXISTS idx_menu_options_sort ON menu_options(group_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_options_available ON menu_options(available);

COMMENT ON TABLE menu_options IS 'Individual options within option groups (Small/Medium/Large, Extra Cheese, etc.)';
COMMENT ON COLUMN menu_options.price_delta IS 'Price adjustment (can be positive or negative)';

-- ============================================
-- ORDER ITEM OPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS order_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES menu_options(id),
  group_name_snapshot TEXT NOT NULL,
  option_name_snapshot TEXT NOT NULL,
  price_delta_snapshot DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_item_options_item ON order_item_options(order_item_id);

COMMENT ON TABLE order_item_options IS 'Immutable snapshot of selected options at order time';
COMMENT ON COLUMN order_item_options.group_name_snapshot IS 'Option group name frozen at order time';
COMMENT ON COLUMN order_item_options.option_name_snapshot IS 'Option name frozen at order time';

-- ============================================
-- BOOKINGS (GOLDKEY)
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  brand_id UUID NOT NULL,
  location_id UUID NOT NULL,
  service_id UUID,
  service_name TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  guest_count INTEGER DEFAULT 1,
  special_requests TEXT,
  price_snapshot JSONB NOT NULL DEFAULT '{}',
  assigned_staff_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_brand ON bookings(brand_id);
CREATE INDEX IF NOT EXISTS idx_bookings_location ON bookings(location_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_staff ON bookings(assigned_staff_id);

COMMENT ON TABLE bookings IS 'Service bookings for GoldKey luxury experiences';
COMMENT ON COLUMN bookings.service_id IS 'Type of service (massage, dining, spa, etc.)';
COMMENT ON COLUMN bookings.price_snapshot IS 'Immutable pricing snapshot at booking time';

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE menu_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Menu option groups: public read
CREATE POLICY "Public read menu option groups"
ON menu_option_groups FOR SELECT
USING (true);

CREATE POLICY "Staff manage menu option groups"
ON menu_option_groups FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('manager', 'corporate', 'executive')
  )
);

-- Menu options: public read
CREATE POLICY "Public read menu options"
ON menu_options FOR SELECT
USING (true);

CREATE POLICY "Staff manage menu options"
ON menu_options FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('manager', 'corporate', 'executive')
  )
);

-- Order item options: users view own
CREATE POLICY "Users view own order item options"
ON order_item_options FOR SELECT
USING (
  order_item_id IN (
    SELECT id FROM order_items WHERE order_id IN (
      SELECT order_id FROM orders WHERE customer_id = auth.uid()::text
    )
  )
);

CREATE POLICY "Service creates order item options"
ON order_item_options FOR INSERT
WITH CHECK (true);

-- Bookings: users manage own
CREATE POLICY "Users view own bookings"
ON bookings FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users create own bookings"
ON bookings FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own bookings"
ON bookings FOR UPDATE
USING (user_id = auth.uid());

-- Staff view/manage location bookings
CREATE POLICY "Staff view location bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('employee', 'manager', 'corporate', 'executive')
  )
);

CREATE POLICY "Staff manage location bookings"
ON bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('manager', 'corporate', 'executive')
  )
);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Create booking with validation
CREATE OR REPLACE FUNCTION create_booking(
  p_user_id UUID,
  p_brand_id UUID,
  p_location_id UUID,
  p_service_id UUID,
  p_service_name TEXT,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_guest_count INTEGER,
  p_special_requests TEXT,
  p_price_snapshot JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id UUID;
BEGIN
  -- Validate time slot
  IF p_start_time >= p_end_time THEN
    RAISE EXCEPTION 'End time must be after start time';
  END IF;

  -- Create booking
  INSERT INTO bookings (
    user_id,
    brand_id,
    location_id,
    service_id,
    service_name,
    start_time,
    end_time,
    status,
    guest_count,
    special_requests,
    price_snapshot
  )
  VALUES (
    p_user_id,
    p_brand_id,
    p_location_id,
    p_service_id,
    p_service_name,
    p_start_time,
    p_end_time,
    'pending',
    p_guest_count,
    p_special_requests,
    p_price_snapshot
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- Confirm booking
CREATE OR REPLACE FUNCTION confirm_booking(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bookings
  SET
    status = 'confirmed',
    confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_booking_id;
END;
$$;

-- Complete booking
CREATE OR REPLACE FUNCTION complete_booking(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bookings
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_booking_id;
END;
$$;

-- Cancel booking
CREATE OR REPLACE FUNCTION cancel_booking(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bookings
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_booking_id;
END;
$$;

-- Assign staff to booking
CREATE OR REPLACE FUNCTION assign_booking_staff(
  p_booking_id UUID,
  p_staff_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bookings
  SET
    assigned_staff_id = p_staff_id,
    updated_at = NOW()
  WHERE id = p_booking_id;
END;
$$;

-- Get user bookings
CREATE OR REPLACE FUNCTION get_user_bookings(
  p_user_id UUID,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  brand_id UUID,
  location_id UUID,
  service_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  guest_count INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.brand_id,
    b.location_id,
    b.service_name,
    b.start_time,
    b.end_time,
    b.status,
    b.guest_count,
    b.created_at
  FROM bookings b
  WHERE b.user_id = p_user_id
  AND (p_status IS NULL OR b.status = p_status)
  ORDER BY b.start_time DESC;
END;
$$;
