-- Drop the existing function
DROP FUNCTION IF EXISTS assign_driver_to_load(uuid, uuid, uuid);

-- Create the stored procedure for assigning drivers to loads
CREATE OR REPLACE FUNCTION assign_driver_to_load(
  p_load_id UUID,
  p_driver_id UUID,
  p_assigned_by UUID DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_driver_status TEXT;
  v_load_status TEXT;
BEGIN
  -- Get the current driver status
  SELECT status INTO v_driver_status FROM drivers WHERE id = p_driver_id;
  
  -- Get the current load status
  SELECT status INTO v_load_status FROM loads WHERE id = p_load_id;
  
  -- Check if the driver exists and is active
  IF NOT EXISTS (SELECT 1 FROM drivers WHERE id = p_driver_id AND is_active = true) THEN
    RAISE EXCEPTION 'Driver not found or inactive';
  END IF;
  
  -- Check if the load exists
  IF NOT EXISTS (SELECT 1 FROM loads WHERE id = p_load_id) THEN
    RAISE EXCEPTION 'Load not found';
  END IF;
  
  -- Check if the driver is available or already booked
  IF v_driver_status NOT IN ('available', 'booked') THEN
    RAISE EXCEPTION 'Driver is not available for assignment (status: %)', v_driver_status;
  END IF;
  
  -- Check if the load is in a state that can be assigned
  IF v_load_status NOT IN ('new', 'assigned') THEN
    RAISE EXCEPTION 'Load cannot be assigned (status: %)', v_load_status;
  END IF;
  
  -- First, remove any existing primary driver assignments for this load
  UPDATE load_drivers
  SET is_primary = false
  WHERE load_id = p_load_id AND is_primary = true;
  
  -- Check if this driver is already assigned to this load
  IF EXISTS (SELECT 1 FROM load_drivers WHERE load_id = p_load_id AND driver_id = p_driver_id) THEN
    -- Update existing assignment to be primary
    UPDATE load_drivers
    SET 
      is_primary = true,
      status = 'assigned',
      assigned_at = NOW(),
      assigned_by = p_assigned_by,
      updated_at = NOW()
    WHERE load_id = p_load_id AND driver_id = p_driver_id;
  ELSE
    -- Insert the new driver assignment
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
  END IF;
  
  -- Update the load status to assigned
  UPDATE loads
  SET 
    status = 'assigned',
    assigned_by = p_assigned_by,
    updated_at = NOW()
  WHERE id = p_load_id;
  
  -- Only update driver status to booked if currently available
  IF v_driver_status = 'available' THEN
    UPDATE drivers
    SET 
      status = 'booked',
      updated_at = NOW()
    WHERE id = p_driver_id;
  END IF;
  
END;
$$ LANGUAGE plpgsql;
