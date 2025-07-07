-- Add missing columns to load_drivers table
ALTER TABLE load_drivers 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'refused', 'completed'));

ALTER TABLE load_drivers 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

ALTER TABLE load_drivers 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id);

-- Update existing records to have default values
UPDATE load_drivers 
SET 
  status = 'assigned',
  is_primary = true
WHERE status IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_load_drivers_is_primary ON load_drivers(load_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_load_drivers_status ON load_drivers(status);
