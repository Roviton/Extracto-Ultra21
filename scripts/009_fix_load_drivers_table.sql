-- Ensure the load_drivers table exists and has proper structure
CREATE TABLE IF NOT EXISTS load_drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(load_id, driver_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_load_drivers_load_id ON load_drivers(load_id);
CREATE INDEX IF NOT EXISTS idx_load_drivers_driver_id ON load_drivers(driver_id);
CREATE INDEX IF NOT EXISTS idx_load_drivers_is_primary ON load_drivers(is_primary);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_load_drivers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_load_drivers_updated_at ON load_drivers;
CREATE TRIGGER trigger_update_load_drivers_updated_at
    BEFORE UPDATE ON load_drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_load_drivers_updated_at();

-- Insert some test data if no assignments exist
INSERT INTO load_drivers (load_id, driver_id, is_primary, assigned_at)
SELECT 
    l.id as load_id,
    d.id as driver_id,
    true as is_primary,
    NOW() as assigned_at
FROM loads l
CROSS JOIN drivers d
WHERE NOT EXISTS (SELECT 1 FROM load_drivers)
LIMIT 2
ON CONFLICT (load_id, driver_id) DO NOTHING;
