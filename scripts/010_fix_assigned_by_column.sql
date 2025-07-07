-- Fix the load_drivers table to handle assigned_by properly

-- First, let's check if the assigned_by column allows NULL
-- If it doesn't allow NULL, we need to either make it nullable or provide a default

-- Option 1: Make assigned_by nullable (recommended for now)
ALTER TABLE load_drivers 
ALTER COLUMN assigned_by DROP NOT NULL;

-- Option 2: If you want to keep it NOT NULL, add a default value
-- You would need to replace 'default-user-id' with an actual user ID
-- ALTER TABLE load_drivers 
-- ALTER COLUMN assigned_by SET DEFAULT 'default-user-id';

-- Add some sample data if the table is empty
INSERT INTO load_drivers (load_id, driver_id, is_primary, assigned_at, assigned_by)
SELECT 
    l.id as load_id,
    d.id as driver_id,
    true as is_primary,
    NOW() as assigned_at,
    u.id as assigned_by
FROM loads l
CROSS JOIN drivers d
CROSS JOIN users u
WHERE NOT EXISTS (
    SELECT 1 FROM load_drivers ld 
    WHERE ld.load_id = l.id AND ld.driver_id = d.id
)
LIMIT 3
ON CONFLICT DO NOTHING;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_load_drivers_load_id ON load_drivers(load_id);
CREATE INDEX IF NOT EXISTS idx_load_drivers_driver_id ON load_drivers(driver_id);
CREATE INDEX IF NOT EXISTS idx_load_drivers_assigned_by ON load_drivers(assigned_by);
