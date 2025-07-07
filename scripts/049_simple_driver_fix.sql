-- Simple step-by-step driver constraint fix

-- Step 1: Check current data
SELECT 'Current driver status distribution:' as info;
SELECT 
    COALESCE(status, 'NULL') as status_value,
    COUNT(*) as count
FROM drivers 
GROUP BY status 
ORDER BY status NULLS FIRST;

-- Step 2: Remove existing constraint
ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_status_check;

-- Step 3: Fix NULL values
UPDATE drivers SET status = 'available' WHERE status IS NULL;

-- Step 4: Fix invalid values (if any)
UPDATE drivers 
SET status = 'available' 
WHERE status NOT IN ('available', 'booked', 'out_of_service', 'on_vacation');

-- Step 5: Set defaults
ALTER TABLE drivers ALTER COLUMN status SET DEFAULT 'available';
ALTER TABLE drivers ALTER COLUMN status SET NOT NULL;

-- Step 6: Add constraint
ALTER TABLE drivers 
ADD CONSTRAINT drivers_status_check 
CHECK (status IN ('available', 'booked', 'out_of_service', 'on_vacation'));

-- Step 7: Verify
SELECT 'Constraint added successfully!' as result
WHERE EXISTS(
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'drivers_status_check' 
    AND conrelid = 'drivers'::regclass
);

-- Step 8: Show final status distribution
SELECT 'Final driver status distribution:' as info;
SELECT 
    status as status_value,
    COUNT(*) as count
FROM drivers 
GROUP BY status 
ORDER BY status;
