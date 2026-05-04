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
