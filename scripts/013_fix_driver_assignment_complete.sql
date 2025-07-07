-- First, let's check and fix the load_drivers table structure
DO $$
BEGIN
    -- Check if load_drivers table exists, if not create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'load_drivers') THEN
        CREATE TABLE load_drivers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
            driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
            assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
            is_primary BOOLEAN DEFAULT true,
            assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(load_id, driver_id)
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_load_drivers_load_id ON load_drivers(load_id);
        CREATE INDEX idx_load_drivers_driver_id ON load_drivers(driver_id);
        CREATE INDEX idx_load_drivers_assigned_by ON load_drivers(assigned_by);
    END IF;
    
    -- Make sure assigned_by column is nullable
    ALTER TABLE load_drivers ALTER COLUMN assigned_by DROP NOT NULL;
    
    -- Ensure we have proper constraints
    ALTER TABLE load_drivers DROP CONSTRAINT IF EXISTS unique_primary_driver_per_load;
    ALTER TABLE load_drivers ADD CONSTRAINT unique_primary_driver_per_load 
        EXCLUDE (load_id WITH =) WHERE (is_primary = true);
        
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in load_drivers table setup: %', SQLERRM;
END $$;

-- Clean up any invalid driver records and ensure proper UUIDs
DELETE FROM drivers WHERE id IS NULL OR length(id::text) < 36;

-- Create sample drivers with proper UUIDs if none exist
DO $$
DECLARE
    driver_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO driver_count FROM drivers;
    
    IF driver_count = 0 THEN
        INSERT INTO drivers (
            id,
            name,
            phone,
            email,
            status,
            location,
            avatar,
            rating,
            equipment_type_id,
            created_at,
            updated_at
        ) 
        SELECT 
            gen_random_uuid(),
            driver_name,
            driver_phone,
            driver_email,
            'available',
            driver_location,
            driver_avatar,
            driver_rating,
            (SELECT id FROM equipment_types LIMIT 1),
            NOW(),
            NOW()
        FROM (VALUES
            ('John Smith', '+1-555-0101', 'john.smith@example.com', 'Los Angeles, CA', '/javascript-code.png', 4.8),
            ('Sarah Johnson', '+1-555-0102', 'sarah.johnson@example.com', 'Phoenix, AZ', '/stylized-letters-sj.png', 4.9),
            ('Mike Williams', '+1-555-0103', 'mike.williams@example.com', 'San Diego, CA', '/intertwined-letters.png', 4.7),
            ('Tom Davis', '+1-555-0104', 'tom.davis@example.com', 'Las Vegas, NV', '/abstract-geometric-TD.png', 4.6),
            ('Lisa Brown', '+1-555-0105', 'lisa.brown@example.com', 'Denver, CO', '/stylized-letter-lb.png', 4.5)
        ) AS driver_data(driver_name, driver_phone, driver_email, driver_location, driver_avatar, driver_rating);
        
        RAISE NOTICE 'Created % sample drivers', ROW_COUNT;
    ELSE
        RAISE NOTICE 'Found % existing drivers', driver_count;
    END IF;
END $$;

-- Ensure we have at least one user for assignment purposes
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    
    IF user_count = 0 THEN
        INSERT INTO users (
            id,
            name,
            email,
            role,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'System Dispatcher',
            'system@dispatcher.com',
            'dispatcher',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created system user for assignments';
    END IF;
END $$;

-- Create a function to safely assign drivers
CREATE OR REPLACE FUNCTION assign_driver_to_load(
    p_load_id UUID,
    p_driver_id UUID,
    p_assigned_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    load_exists BOOLEAN;
    driver_exists BOOLEAN;
    assignment_exists BOOLEAN;
BEGIN
    -- Check if load exists
    SELECT EXISTS(SELECT 1 FROM loads WHERE id = p_load_id) INTO load_exists;
    IF NOT load_exists THEN
        RAISE EXCEPTION 'Load with ID % does not exist', p_load_id;
    END IF;
    
    -- Check if driver exists
    SELECT EXISTS(SELECT 1 FROM drivers WHERE id = p_driver_id) INTO driver_exists;
    IF NOT driver_exists THEN
        RAISE EXCEPTION 'Driver with ID % does not exist', p_driver_id;
    END IF;
    
    -- Check if assignment already exists
    SELECT EXISTS(
        SELECT 1 FROM load_drivers 
        WHERE load_id = p_load_id AND driver_id = p_driver_id
    ) INTO assignment_exists;
    
    IF assignment_exists THEN
        RAISE EXCEPTION 'Driver is already assigned to this load';
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
    
    RETURN true;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error assigning driver: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Test the function with sample data
DO $$
DECLARE
    test_load_id UUID;
    test_driver_id UUID;
    test_user_id UUID;
BEGIN
    -- Get a sample load
    SELECT id INTO test_load_id FROM loads WHERE status = 'new' LIMIT 1;
    
    -- Get a sample driver
    SELECT id INTO test_driver_id FROM drivers WHERE status = 'available' LIMIT 1;
    
    -- Get a sample user
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_load_id IS NOT NULL AND test_driver_id IS NOT NULL THEN
        -- Test the assignment function
        PERFORM assign_driver_to_load(test_load_id, test_driver_id, test_user_id);
        RAISE NOTICE 'Successfully tested driver assignment function';
    ELSE
        RAISE NOTICE 'No test data available for assignment test';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Assignment test failed: %', SQLERRM;
END $$;

-- Display summary
DO $$
DECLARE
    driver_count INTEGER;
    load_count INTEGER;
    assignment_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO driver_count FROM drivers;
    SELECT COUNT(*) INTO load_count FROM loads;
    SELECT COUNT(*) INTO assignment_count FROM load_drivers;
    SELECT COUNT(*) INTO user_count FROM users;
    
    RAISE NOTICE '=== DRIVER ASSIGNMENT SETUP COMPLETE ===';
    RAISE NOTICE 'Drivers: %', driver_count;
    RAISE NOTICE 'Loads: %', load_count;
    RAISE NOTICE 'Assignments: %', assignment_count;
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE '==========================================';
END $$;
