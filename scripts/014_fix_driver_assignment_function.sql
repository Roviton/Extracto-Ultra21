-- Drop the function if it exists to recreate it properly
DROP FUNCTION IF EXISTS assign_driver_to_load(UUID, UUID, UUID);

-- Create the assign_driver_to_load function with proper parameter handling
CREATE OR REPLACE FUNCTION assign_driver_to_load(
    p_load_id UUID,
    p_driver_id UUID,
    p_assigned_by UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    load_exists BOOLEAN;
    driver_exists BOOLEAN;
    assignment_exists BOOLEAN;
    result JSON;
BEGIN
    -- Check if load exists
    SELECT EXISTS(SELECT 1 FROM loads WHERE id = p_load_id) INTO load_exists;
    IF NOT load_exists THEN
        RETURN json_build_object('success', false, 'error', 'Load does not exist');
    END IF;
    
    -- Check if driver exists
    SELECT EXISTS(SELECT 1 FROM drivers WHERE id = p_driver_id) INTO driver_exists;
    IF NOT driver_exists THEN
        RETURN json_build_object('success', false, 'error', 'Driver does not exist');
    END IF;
    
    -- Check if assignment already exists
    SELECT EXISTS(
        SELECT 1 FROM load_drivers 
        WHERE load_id = p_load_id AND driver_id = p_driver_id
    ) INTO assignment_exists;
    
    IF assignment_exists THEN
        RETURN json_build_object('success', false, 'error', 'Driver is already assigned to this load');
    END IF;
    
    -- Remove any existing primary driver for this load
    UPDATE load_drivers 
    SET is_primary = false 
    WHERE load_id = p_load_id AND is_primary = true;
    
    -- Create the assignment
    INSERT INTO load_drivers (
        load_id,
        driver_id,
        assigned_by,
        is_primary,
        assigned_at
    ) VALUES (
        p_load_id,
        p_driver_id,
        p_assigned_by,
        true,
        NOW()
    );
    
    -- Update load status to assigned
    UPDATE loads 
    SET status = 'assigned', updated_at = NOW()
    WHERE id = p_load_id;
    
    RETURN json_build_object('success', true, 'message', 'Driver assigned successfully');
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Test the function to make sure it works
DO $$
DECLARE
    test_result JSON;
    test_load_id UUID;
    test_driver_id UUID;
    test_user_id UUID;
BEGIN
    -- Get sample IDs for testing
    SELECT id INTO test_load_id FROM loads WHERE status IN ('new', 'assigned') LIMIT 1;
    SELECT id INTO test_driver_id FROM drivers WHERE status = 'available' LIMIT 1;
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_load_id IS NOT NULL AND test_driver_id IS NOT NULL THEN
        -- Test the function
        SELECT assign_driver_to_load(test_load_id, test_driver_id, test_user_id) INTO test_result;
        RAISE NOTICE 'Function test result: %', test_result;
    ELSE
        RAISE NOTICE 'No test data available - Load ID: %, Driver ID: %', test_load_id, test_driver_id;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Function test failed: %', SQLERRM;
END $$;

-- Verify the function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'assign_driver_to_load' 
AND routine_schema = 'public';

RAISE NOTICE 'Driver assignment function setup complete!';
