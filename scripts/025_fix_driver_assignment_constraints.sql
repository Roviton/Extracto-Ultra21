-- First, let's check the current state of load_drivers table
SELECT 
    ld.load_id,
    ld.driver_id,
    ld.is_primary,
    l.load_number,
    d.name as driver_name
FROM load_drivers ld
JOIN loads l ON ld.load_id = l.id
JOIN drivers d ON ld.driver_id = d.id
ORDER BY ld.load_id, ld.is_primary DESC;

-- Check for duplicate primary assignments (this is likely causing the constraint violation)
SELECT 
    load_id,
    COUNT(*) as primary_count
FROM load_drivers 
WHERE is_primary = true
GROUP BY load_id
HAVING COUNT(*) > 1;

-- Clean up any duplicate primary assignments
-- Set all but the most recent assignment to non-primary
WITH ranked_assignments AS (
    SELECT 
        id,
        load_id,
        ROW_NUMBER() OVER (PARTITION BY load_id ORDER BY assigned_at DESC) as rn
    FROM load_drivers 
    WHERE is_primary = true
)
UPDATE load_drivers 
SET is_primary = false
WHERE id IN (
    SELECT id 
    FROM ranked_assignments 
    WHERE rn > 1
);

-- Create a proper unique constraint if it doesn't exist
-- This ensures only one primary driver per load
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_primary_driver_per_load'
    ) THEN
        ALTER TABLE load_drivers DROP CONSTRAINT unique_primary_driver_per_load;
    END IF;
    
    -- Create the correct unique constraint
    ALTER TABLE load_drivers 
    ADD CONSTRAINT unique_primary_driver_per_load 
    UNIQUE (load_id, is_primary) 
    DEFERRABLE INITIALLY DEFERRED;
    
EXCEPTION
    WHEN duplicate_table THEN
        -- Constraint already exists, ignore
        NULL;
END$$;

-- Also ensure we have a proper index for performance
CREATE INDEX IF NOT EXISTS idx_load_drivers_load_primary 
ON load_drivers(load_id, is_primary) 
WHERE is_primary = true;
