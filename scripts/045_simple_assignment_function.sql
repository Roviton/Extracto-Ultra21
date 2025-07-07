-- Create a simplified assignment function that doesn't update driver status
CREATE OR REPLACE FUNCTION assign_driver_to_load_simple(
  p_load_id UUID,
  p_driver_id UUID,
  p_assigned_by UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_driver_id UUID;
  v_driver_exists BOOLEAN;
  v_load_exists BOOLEAN;
  v_load_status TEXT;
BEGIN
  -- Validate inputs
  IF p_load_id IS NULL OR p_driver_id IS NULL THEN
    RAISE EXCEPTION 'Load ID and Driver ID cannot be null';
  END IF;
  
  -- Check if load exists
  SELECT EXISTS(SELECT 1 FROM loads WHERE id = p_load_id), status
  INTO v_load_exists, v_load_status
  FROM loads 
  WHERE id = p_load_id;
  
  IF NOT v_load_exists THEN
    RAISE EXCEPTION 'Load with ID % does not exist', p_load_id;
  END IF;
  
  -- Check if driver exists
  SELECT EXISTS(SELECT 1 FROM drivers WHERE id = p_driver_id AND is_active = true)
  INTO v_driver_exists;
  
  IF NOT v_driver_exists THEN
    RAISE EXCEPTION 'Driver with ID % does not exist or is not active', p_driver_id;
  END IF;
  
  -- Get current driver assignment
  SELECT driver_id INTO v_current_driver_id 
  FROM load_drivers 
  WHERE load_id = p_load_id AND is_primary = true;
  
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
  
  -- DO NOT update driver status to avoid constraint issues
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in assign_driver_to_load_simple: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql;
