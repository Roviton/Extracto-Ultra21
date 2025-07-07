-- Add missing assigned_by column to loads table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'loads' AND column_name = 'assigned_by'
    ) THEN
        ALTER TABLE loads ADD COLUMN assigned_by UUID REFERENCES users(id);
    END IF;
END $$;

-- Create assignment history table for tracking
CREATE TABLE IF NOT EXISTS assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES users(id),
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('initial', 'reassignment', 'unassignment')),
  previous_driver_id UUID REFERENCES drivers(id),
  reason TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignment_history_load_id ON assignment_history(load_id);
CREATE INDEX IF NOT EXISTS idx_assignment_history_driver_id ON assignment_history(driver_id);
CREATE INDEX IF NOT EXISTS idx_assignment_history_assigned_by ON assignment_history(assigned_by);
CREATE INDEX IF NOT EXISTS idx_assignment_history_assigned_at ON assignment_history(assigned_at);
CREATE INDEX IF NOT EXISTS idx_loads_assigned_by ON loads(assigned_by);

-- Create a view for admin monitoring
DROP VIEW IF EXISTS dispatcher_performance;
CREATE VIEW dispatcher_performance AS
SELECT 
  u.id as dispatcher_id,
  u.name as dispatcher_name,
  u.email as dispatcher_email,
  COUNT(DISTINCT l.id) as total_loads_created,
  COUNT(DISTINCT ah.id) as total_assignments_made,
  COUNT(DISTINCT CASE WHEN l.status = 'completed' THEN l.id END) as completed_loads,
  COUNT(DISTINCT CASE WHEN l.status = 'cancelled' THEN l.id END) as cancelled_loads,
  COUNT(DISTINCT CASE WHEN ah.assignment_type = 'reassignment' THEN ah.id END) as reassignments_made,
  ROUND(
    (COUNT(DISTINCT CASE WHEN l.status = 'completed' THEN l.id END)::DECIMAL / 
     NULLIF(COUNT(DISTINCT l.id), 0)) * 100, 2
  ) as completion_rate,
  MAX(l.created_at) as last_load_created,
  MAX(ah.assigned_at) as last_assignment_made
FROM users u
LEFT JOIN loads l ON u.id = l.created_by AND u.role = 'dispatcher'
LEFT JOIN assignment_history ah ON u.id = ah.assigned_by
WHERE u.role = 'dispatcher' AND u.is_active = true
GROUP BY u.id, u.name, u.email;

-- Create function to track assignments
CREATE OR REPLACE FUNCTION track_driver_assignment(
  p_load_id UUID,
  p_driver_id UUID,
  p_assigned_by UUID,
  p_assignment_type TEXT DEFAULT 'initial',
  p_previous_driver_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_load_exists BOOLEAN;
  v_driver_exists BOOLEAN;
  v_user_exists BOOLEAN;
BEGIN
  -- Validate inputs
  SELECT EXISTS(SELECT 1 FROM loads WHERE id = p_load_id) INTO v_load_exists;
  SELECT EXISTS(SELECT 1 FROM drivers WHERE id = p_driver_id AND is_active = true) INTO v_driver_exists;
  SELECT EXISTS(SELECT 1 FROM users WHERE id = p_assigned_by AND is_active = true) INTO v_user_exists;
  
  IF NOT v_load_exists THEN
    RAISE EXCEPTION 'Load with ID % does not exist', p_load_id;
  END IF;
  
  IF NOT v_driver_exists THEN
    RAISE EXCEPTION 'Driver with ID % does not exist or is inactive', p_driver_id;
  END IF;
  
  IF NOT v_user_exists THEN
    RAISE EXCEPTION 'User with ID % does not exist or is inactive', p_assigned_by;
  END IF;
  
  -- Insert assignment history record
  INSERT INTO assignment_history (
    load_id,
    driver_id,
    assigned_by,
    assignment_type,
    previous_driver_id,
    reason,
    assigned_at
  ) VALUES (
    p_load_id,
    p_driver_id,
    p_assigned_by,
    p_assignment_type,
    p_previous_driver_id,
    p_reason,
    NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing function first
DROP FUNCTION IF EXISTS assign_driver_to_load(UUID, UUID, UUID);

-- Create the updated driver assignment function
CREATE FUNCTION assign_driver_to_load(
  p_load_id UUID,
  p_driver_id UUID,
  p_assigned_by UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_driver_id UUID;
  v_driver_status TEXT;
  v_load_status TEXT;
  v_assignment_type TEXT := 'initial';
BEGIN
  -- Get current load status and assigned driver
  SELECT status INTO v_load_status FROM loads WHERE id = p_load_id;
  
  -- Get current driver assignment
  SELECT driver_id INTO v_current_driver_id 
  FROM load_drivers 
  WHERE load_id = p_load_id AND is_primary = true;
  
  -- Get driver status
  SELECT status INTO v_driver_status FROM drivers WHERE id = p_driver_id;
  
  -- Validate driver status
  IF v_driver_status NOT IN ('available', 'booked') THEN
    RAISE EXCEPTION 'Driver is not available for assignment. Current status: %', v_driver_status;
  END IF;
  
  -- Validate load status
  IF v_load_status NOT IN ('new', 'assigned') THEN
    RAISE EXCEPTION 'Load cannot be assigned. Current status: %', v_load_status;
  END IF;
  
  -- Determine assignment type
  IF v_current_driver_id IS NOT NULL THEN
    v_assignment_type := 'reassignment';
  END IF;
  
  -- Remove existing driver assignments for this load
  DELETE FROM load_drivers WHERE load_id = p_load_id;
  
  -- Create new driver assignment
  INSERT INTO load_drivers (
    load_id,
    driver_id,
    assigned_at,
    status,
    is_primary,
    assigned_by
  ) VALUES (
    p_load_id,
    p_driver_id,
    NOW(),
    'assigned',
    true,
    p_assigned_by
  );
  
  -- Update load status and assigned_by
  UPDATE loads 
  SET 
    status = 'assigned',
    assigned_by = p_assigned_by,
    updated_at = NOW()
  WHERE id = p_load_id;
  
  -- Update driver status to booked if currently available
  IF v_driver_status = 'available' THEN
    UPDATE drivers 
    SET 
      status = 'booked',
      updated_at = NOW()
    WHERE id = p_driver_id;
  END IF;
  
  -- Track the assignment in history
  PERFORM track_driver_assignment(
    p_load_id,
    p_driver_id,
    p_assigned_by,
    v_assignment_type,
    v_current_driver_id,
    CASE 
      WHEN v_assignment_type = 'reassignment' THEN 'Driver reassigned'
      ELSE 'Initial driver assignment'
    END
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON dispatcher_performance TO authenticated;
GRANT ALL ON assignment_history TO authenticated;
