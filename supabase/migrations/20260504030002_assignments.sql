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
