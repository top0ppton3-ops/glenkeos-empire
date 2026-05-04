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
