-- First, let's examine the current constraint and fix it
DO $$
DECLARE
    constraint_exists BOOLEAN;
    current_constraint TEXT;
BEGIN
    -- Check if the constraint exists
    SELECT EXISTS(
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'drivers_status_check' 
        AND conrelid = 'drivers'::regclass
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        -- Get the current constraint definition
        SELECT pg_get_constraintdef(oid) INTO current_constraint
        FROM pg_constraint
        WHERE conname = 'drivers_status_check' AND conrelid = 'drivers'::regclass;
        
        RAISE NOTICE 'Current constraint: %', current_constraint;
        
        -- Drop the existing constraint
        ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_status_check;
        RAISE NOTICE 'Dropped existing drivers_status_check constraint';
    END IF;
END $$;

-- Add the correct constraint with proper values
ALTER TABLE drivers 
ADD CONSTRAINT drivers_status_check 
CHECK (status IN ('available', 'booked', 'out_of_service', 'on_vacation'));

-- Update any invalid status values to 'available'
UPDATE drivers 
SET status = 'available' 
WHERE status IS NULL OR status NOT IN ('available', 'booked', 'out_of_service', 'on_vacation');

-- Make sure the status column is not null
ALTER TABLE drivers ALTER COLUMN status SET NOT NULL;
ALTER TABLE drivers ALTER COLUMN status SET DEFAULT 'available';

-- Drop and recreate the assignment function with better error handling
DROP FUNCTION IF EXISTS assign_driver_to_load(UUID, UUID, UUID);

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
  v_driver_exists BOOLEAN;
  v_load_exists BOOLEAN;
BEGIN
  -- Validate inputs
  IF p_load_id IS NULL OR p_driver_id IS NULL THEN
    RAISE EXCEPTION 'Load ID and Driver ID cannot be null';
  END IF;
  
  -- Check if load exists
  SELECT EXISTS(SELECT 1 FROM loads WHERE id = p_load_id) INTO v_load_exists;
  IF NOT v_load_exists THEN
    RAISE EXCEPTION 'Load with ID % does not exist', p_load_id;
  END IF;
  
  -- Check if driver exists and get status
  SELECT EXISTS(SELECT 1 FROM drivers WHERE id = p_driver_id), 
         COALESCE(status, 'available')
  INTO v_driver_exists, v_driver_status
  FROM drivers 
  WHERE id = p_driver_id;
  
  IF NOT v_driver_exists THEN
    RAISE EXCEPTION 'Driver with ID % does not exist', p_driver_id;
  END IF;
  
  -- Get current load status
  SELECT status INTO v_load_status FROM loads WHERE id = p_load_id;
  
  -- Get current driver assignment
  SELECT driver_id INTO v_current_driver_id 
  FROM load_drivers 
  WHERE load_id = p_load_id AND is_primary = true;
  
  -- Validate driver status (allow available and booked drivers)
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
  
  -- ONLY update driver status if currently available
  -- This prevents constraint violations
  UPDATE drivers 
  SET 
    status = 'booked',
    updated_at = NOW()
  WHERE id = p_driver_id 
    AND status = 'available';  -- Only update if currently available
  
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

-- Create a simple test function to verify the constraint
CREATE OR REPLACE FUNCTION test_driver_status_constraint() 
RETURNS TABLE(
  test_name TEXT,
  result TEXT,
  details TEXT
) AS $$
BEGIN
  -- Test 1: Check constraint exists
  RETURN QUERY
  SELECT 
    'Constraint Exists'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'drivers_status_check' 
      AND conrelid = 'drivers'::regclass
    ) THEN 'PASS' ELSE 'FAIL' END,
    'drivers_status_check constraint should exist'::TEXT;
    
  -- Test 2: Check valid statuses
  RETURN QUERY
  SELECT 
    'Valid Status Count'::TEXT,
    CASE WHEN (
      SELECT COUNT(*) FROM drivers 
      WHERE status NOT IN ('available', 'booked', 'out_of_service', 'on_vacation')
    ) = 0 THEN 'PASS' ELSE 'FAIL' END,
    'All drivers should have valid status values'::TEXT;
    
  -- Test 3: Check for null statuses
  RETURN QUERY
  SELECT 
    'No Null Status'::TEXT,
    CASE WHEN (
      SELECT COUNT(*) FROM drivers WHERE status IS NULL
    ) = 0 THEN 'PASS' ELSE 'FAIL' END,
    'No drivers should have null status'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Run the test
SELECT * FROM test_driver_status_constraint();
