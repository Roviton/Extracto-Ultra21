-- Simplify the drivers table for MVP - remove messaging columns
ALTER TABLE drivers DROP COLUMN IF EXISTS telegram_username;
ALTER TABLE drivers DROP COLUMN IF EXISTS whatsapp_number;
ALTER TABLE drivers DROP COLUMN IF EXISTS preferred_contact_method;

-- Simplify users table - keep only admin and dispatcher roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'dispatcher'));

-- Update existing users to valid roles
UPDATE users SET role = 'admin' WHERE role NOT IN ('admin', 'dispatcher');

-- Ensure load_drivers table has the essential columns
ALTER TABLE load_drivers 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'refused', 'completed'));

ALTER TABLE load_drivers 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT true;

ALTER TABLE load_drivers 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_company_role ON users(company_id, role);
CREATE INDEX IF NOT EXISTS idx_load_drivers_primary ON load_drivers(load_id, is_primary);
