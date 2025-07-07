-- Check the current constraint definition
DO $$
DECLARE
    constraint_def TEXT;
BEGIN
    SELECT pg_get_constraintdef(oid) INTO constraint_def
    FROM pg_constraint
    WHERE conname = 'drivers_status_check' AND conrelid = 'drivers'::regclass;
    
    RAISE NOTICE 'Current constraint definition: %', constraint_def;
END $$;

-- Drop the existing function
DROP FUNCTION IF EXISTS assign_driver_to_load(UUID, UUID, UUID);

-- Create the updated driver assignment function with proper status handling
CREATE OR REPLACE FUNCTION assign_driver_to_load(
  p_load_id UUID,
  p_driver_id UUID,
  p_assigned_by UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_driver_id UUID;
  v_driver_status TEXT;
  v_load_status TEXT;
  v_assignment_type TEXT := 'initial';
  v_valid_status BOOLEAN;
BEGIN
  -- Get current load status and assigned driver
  SELECT status INTO v_load_status FROM loads WHERE id = p_load_id;
  
  -- Get current driver assignment
  SELECT driver_id INTO v_current_driver_id 
  FROM load_drivers 
  WHERE load_id = p_load_id AND is_primary = true;
  
  -- Get driver status and validate it exists
  SELECT status, EXISTS(SELECT 1 FROM drivers WHERE id = p_driver_id) 
  INTO v_driver_status, v_valid_status 
  FROM drivers 
  WHERE id = p_driver_id;
  
  IF NOT v_valid_status THEN
    RAISE EXCEPTION 'Driver with ID % does not exist', p_driver_id;
  END IF;
  
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
  -- Only update if the current status is 'available' to prevent constraint violations
  IF v_driver_status = 'available' THEN
    UPDATE drivers 
    SET 
      status = 'booked',
      updated_at = NOW()
    WHERE id = p_driver_id AND status = 'available';
  END IF;
  
  -- Track the assignment in history if the table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignment_history') THEN
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
      v_assignment_type,
      v_current_driver_id,
      CASE 
        WHEN v_assignment_type = 'reassignment' THEN 'Driver reassigned'
        ELSE 'Initial driver assignment'
      END,
      NOW()
    );
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in assign_driver_to_load: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Create a diagnostic function to check driver statuses
CREATE OR REPLACE FUNCTION check_driver_status(p_driver_id UUID) 
RETURNS TABLE(
  driver_id UUID,
  driver_name TEXT,
  current_status TEXT,
  allowed_statuses TEXT[],
  constraint_definition TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.status,
    ARRAY['available', 'booked', 'out_of_service', 'on_vacation'],
    pg_get_constraintdef(c.oid)
  FROM 
    drivers d,
    pg_constraint c
  WHERE 
    d.id = p_driver_id
    AND c.conname = 'drivers_status_check'
    AND c.conrelid = 'drivers'::regclass;
END;
$$ LANGUAGE plpgsql;
