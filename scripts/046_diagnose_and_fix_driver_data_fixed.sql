-- First, let's see what's in the drivers table
DO $$
DECLARE
    rec RECORD;
    total_drivers INTEGER;
    null_status_count INTEGER;
    invalid_status_count INTEGER;
BEGIN
    -- Get total count of drivers
    SELECT COUNT(*) INTO total_drivers FROM drivers;
    RAISE NOTICE 'Total drivers in table: %', total_drivers;
    
    -- Check for null status values
    SELECT COUNT(*) INTO null_status_count FROM drivers WHERE status IS NULL;
    RAISE NOTICE 'Drivers with NULL status: %', null_status_count;
    
    -- Check for invalid status values
    SELECT COUNT(*) INTO invalid_status_count 
    FROM drivers 
    WHERE status IS NOT NULL 
    AND status NOT IN ('available', 'booked', 'out_of_service', 'on_vacation');
    RAISE NOTICE 'Drivers with invalid status: %', invalid_status_count;
    
    -- Show all unique status values
    RAISE NOTICE 'All unique status values in drivers table:';
    FOR rec IN 
        SELECT DISTINCT status, COUNT(*) as count
        FROM drivers 
        GROUP BY status 
        ORDER BY status NULLS FIRST
    LOOP
        RAISE NOTICE '  Status: "%" - Count: %', COALESCE(rec.status, 'NULL'), rec.count;
    END LOOP;
    
    -- Show sample problematic rows
    RAISE NOTICE 'Sample rows with problematic status:';
    FOR rec IN 
        SELECT id, name, status, created_at
        FROM drivers 
        WHERE status IS NULL 
           OR status NOT IN ('available', 'booked', 'out_of_service', 'on_vacation')
        LIMIT 5
    LOOP
        RAISE NOTICE '  ID: %, Name: %, Status: "%", Created: %', 
            rec.id, COALESCE(rec.name, 'NULL'), COALESCE(rec.status, 'NULL'), rec.created_at;
    END LOOP;
END $$;

-- Step 1: Remove the existing constraint if it exists
ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_status_check;

-- Step 2: Show current column definition
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'drivers' AND column_name = 'status';

-- Step 3: Update NULL status values to 'available'
UPDATE drivers 
SET status = 'available' 
WHERE status IS NULL;

-- Step 4: Update any other invalid status values to 'available'
UPDATE drivers 
SET status = 'available' 
WHERE status NOT IN ('available', 'booked', 'out_of_service', 'on_vacation');

-- Step 5: Verify all status values are now valid
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM drivers 
    WHERE status IS NULL 
       OR status NOT IN ('available', 'booked', 'out_of_service', 'on_vacation');
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Still have % drivers with invalid status after cleanup', invalid_count;
    ELSE
        RAISE NOTICE 'All driver status values are now valid!';
    END IF;
END $$;

-- Step 6: Set column to NOT NULL with default
ALTER TABLE drivers ALTER COLUMN status SET DEFAULT 'available';
ALTER TABLE drivers ALTER COLUMN status SET NOT NULL;

-- Step 7: Add the constraint
ALTER TABLE drivers 
ADD CONSTRAINT drivers_status_check 
CHECK (status IN ('available', 'booked', 'out_of_service', 'on_vacation'));

-- Step 8: Verify the constraint was added successfully
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'drivers_status_check' 
AND conrelid = 'drivers'::regclass;

-- Step 9: Final verification
SELECT 
    'Constraint Test' as test_name,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'drivers_status_check' 
            AND conrelid = 'drivers'::regclass
        ) THEN 'PASSED'
        ELSE 'FAILED'
    END as result;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE 'Driver constraint fix completed successfully!';
END $$;
