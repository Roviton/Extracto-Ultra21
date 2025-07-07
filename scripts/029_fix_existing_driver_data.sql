-- Fix Existing Driver Data and Status Constraint
-- This script safely updates existing data before changing the constraint

-- First, let's see what status values currently exist
DO $$
BEGIN
    RAISE NOTICE 'Current status values in drivers table:';
END $$;

-- Update any existing invalid status values to valid ones
UPDATE drivers 
SET status = CASE 
    WHEN status = 'AVAILABLE' THEN 'available'
    WHEN status = 'ON_DUTY' THEN 'on_duty'
    WHEN status = 'OFF_DUTY' THEN 'off_duty'
    WHEN status = 'ON_BREAK' THEN 'on_break'
    WHEN status = 'INACTIVE' THEN 'off_duty'
    WHEN status IS NULL THEN 'available'
    ELSE 'available'  -- Default fallback
END
WHERE status NOT IN ('available', 'on_duty', 'off_duty', 'on_break');

-- Now safely drop and recreate the constraint
ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_status_check;

-- Add the updated constraint with all status values
ALTER TABLE drivers ADD CONSTRAINT drivers_status_check 
CHECK (status IN ('available', 'on_duty', 'off_duty', 'on_break'));

-- Ensure all drivers have a valid status
UPDATE drivers 
SET status = 'available' 
WHERE status IS NULL;

-- Make sure all drivers have required fields
UPDATE drivers 
SET 
    is_active = COALESCE(is_active, true),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE is_active IS NULL OR created_at IS NULL OR updated_at IS NULL;

-- Add missing columns if they don't exist (safe operation)
DO $$ 
BEGIN
    -- Add driver_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'driver_type') THEN
        ALTER TABLE drivers ADD COLUMN driver_type VARCHAR(50) DEFAULT 'company';
    END IF;
    
    -- Add equipment_preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'equipment_preferences') THEN
        ALTER TABLE drivers ADD COLUMN equipment_preferences TEXT[];
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'date_of_birth') THEN
        ALTER TABLE drivers ADD COLUMN date_of_birth DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'address_line_1') THEN
        ALTER TABLE drivers ADD COLUMN address_line_1 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'address_line_2') THEN
        ALTER TABLE drivers ADD COLUMN address_line_2 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'zip_code') THEN
        ALTER TABLE drivers ADD COLUMN zip_code VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE drivers ADD COLUMN emergency_contact_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE drivers ADD COLUMN emergency_contact_phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'hire_date') THEN
        ALTER TABLE drivers ADD COLUMN hire_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'license_state') THEN
        ALTER TABLE drivers ADD COLUMN license_state VARCHAR(2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'license_expiry') THEN
        ALTER TABLE drivers ADD COLUMN license_expiry DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'fuel_card_number') THEN
        ALTER TABLE drivers ADD COLUMN fuel_card_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'truck_number') THEN
        ALTER TABLE drivers ADD COLUMN truck_number VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'trailer_number') THEN
        ALTER TABLE drivers ADD COLUMN trailer_number VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'co_driver_id') THEN
        ALTER TABLE drivers ADD COLUMN co_driver_id UUID REFERENCES drivers(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'notes') THEN
        ALTER TABLE drivers ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'avatar_url') THEN
        ALTER TABLE drivers ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Update existing drivers to have proper driver_type
UPDATE drivers 
SET driver_type = 'company' 
WHERE driver_type IS NULL;

-- Create the driver_performance table if it doesn't exist
CREATE TABLE IF NOT EXISTS driver_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    total_miles INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_loads INTEGER DEFAULT 0,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0,
    load_acceptance_rate DECIMAL(5,2) DEFAULT 0,
    average_rpm DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(driver_id)
);

-- Create the driver_messaging table if it doesn't exist
CREATE TABLE IF NOT EXISTS driver_messaging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    telegram_enabled BOOLEAN DEFAULT false,
    whatsapp_enabled BOOLEAN DEFAULT false,
    sms_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    telegram_chat_id VARCHAR(50),
    whatsapp_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(driver_id)
);

-- Create the driver_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT,
    blob_url TEXT,
    issue_date DATE,
    expiration_date DATE,
    document_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize performance records for existing drivers that don't have them
INSERT INTO driver_performance (driver_id, total_miles, total_revenue, total_loads, on_time_delivery_rate, load_acceptance_rate, average_rpm)
SELECT 
    d.id, 
    0, -- total_miles
    0, -- total_revenue
    0, -- total_loads
    0, -- on_time_delivery_rate
    0, -- load_acceptance_rate
    0  -- average_rpm
FROM drivers d 
WHERE NOT EXISTS (SELECT 1 FROM driver_performance WHERE driver_id = d.id);

-- Initialize messaging preferences for existing drivers that don't have them
INSERT INTO driver_messaging (driver_id, telegram_enabled, whatsapp_enabled, sms_enabled, email_enabled)
SELECT 
    d.id, 
    false, -- telegram_enabled
    false, -- whatsapp_enabled
    true,  -- sms_enabled
    true   -- email_enabled
FROM drivers d 
WHERE NOT EXISTS (SELECT 1 FROM driver_messaging WHERE driver_id = d.id);

-- Add some sample drivers if the table is empty or has very few drivers
INSERT INTO drivers (
    name, email, phone, city, state, status, driver_type,
    license_number, license_state, equipment_preferences, truck_number, company_id
) 
SELECT 
    'John Smith', 'john.smith@example.com', '(555) 123-4567', 
    'Los Angeles', 'CA', 'available', 'company',
    'CDL123456', 'CA', ARRAY['Dry Van', 'Refrigerated'], 'T001',
    (SELECT id FROM companies LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'John Smith')
AND (SELECT id FROM companies LIMIT 1) IS NOT NULL;

INSERT INTO drivers (
    name, email, phone, city, state, status, driver_type,
    license_number, license_state, equipment_preferences, truck_number, company_id
) 
SELECT 
    'Sarah Johnson', 'sarah.johnson@example.com', '(555) 234-5678', 
    'Phoenix', 'AZ', 'on_duty', 'owner_operator',
    'CDL789012', 'AZ', ARRAY['Flatbed'], 'T002',
    (SELECT id FROM companies LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Sarah Johnson')
AND (SELECT id FROM companies LIMIT 1) IS NOT NULL;

INSERT INTO drivers (
    name, email, phone, city, state, status, driver_type,
    license_number, license_state, equipment_preferences, truck_number, company_id
) 
SELECT 
    'Mike Rodriguez', 'mike.rodriguez@example.com', '(555) 345-6789', 
    'Dallas', 'TX', 'off_duty', 'company',
    'CDL345678', 'TX', ARRAY['Dry Van', 'Flatbed'], 'T003',
    (SELECT id FROM companies LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Mike Rodriguez')
AND (SELECT id FROM companies LIMIT 1) IS NOT NULL;

-- Initialize performance and messaging for the new sample drivers
INSERT INTO driver_performance (driver_id, total_miles, total_revenue, total_loads, on_time_delivery_rate, load_acceptance_rate, average_rpm)
SELECT 
    d.id, 24500, 78400, 42, 98.5, 95.0, 3.2
FROM drivers d 
WHERE d.name = 'John Smith'
AND NOT EXISTS (SELECT 1 FROM driver_performance WHERE driver_id = d.id);

INSERT INTO driver_performance (driver_id, total_miles, total_revenue, total_loads, on_time_delivery_rate, load_acceptance_rate, average_rpm)
SELECT 
    d.id, 18700, 62300, 35, 100.0, 92.0, 3.33
FROM drivers d 
WHERE d.name = 'Sarah Johnson'
AND NOT EXISTS (SELECT 1 FROM driver_performance WHERE driver_id = d.id);

INSERT INTO driver_performance (driver_id, total_miles, total_revenue, total_loads, on_time_delivery_rate, load_acceptance_rate, average_rpm)
SELECT 
    d.id, 15200, 48900, 28, 96.4, 89.0, 3.22
FROM drivers d 
WHERE d.name = 'Mike Rodriguez'
AND NOT EXISTS (SELECT 1 FROM driver_performance WHERE driver_id = d.id);

-- Initialize messaging for new drivers
INSERT INTO driver_messaging (driver_id, telegram_enabled, whatsapp_enabled, sms_enabled, email_enabled)
SELECT d.id, true, true, true, true
FROM drivers d 
WHERE d.name IN ('John Smith', 'Sarah Johnson', 'Mike Rodriguez')
AND NOT EXISTS (SELECT 1 FROM driver_messaging WHERE driver_id = d.id);

COMMIT;
