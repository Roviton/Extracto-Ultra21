-- Fix Driver Status Constraint
-- This script updates the status check constraint to include all needed values

-- First, drop the existing constraint
ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_status_check;

-- Add the updated constraint with all status values
ALTER TABLE drivers ADD CONSTRAINT drivers_status_check 
CHECK (status IN ('available', 'on_duty', 'off_duty', 'on_break', 'inactive'));

-- Now safely insert the sample drivers with correct status values
INSERT INTO drivers (
    name, email, phone, city, state, status, driver_type,
    license_number, license_state, equipment_preferences, truck_number, company_id
) 
SELECT 
    'John Smith', 'john.smith@example.com', '(555) 123-4567', 
    'Los Angeles', 'CA', 'available', 'company',
    'CDL123456', 'CA', ARRAY['Dry Van', 'Refrigerated'], 'T001',
    (SELECT id FROM companies LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'John Smith');

INSERT INTO drivers (
    name, email, phone, city, state, status, driver_type,
    license_number, license_state, equipment_preferences, truck_number, company_id
) 
SELECT 
    'Sarah Johnson', 'sarah.johnson@example.com', '(555) 234-5678', 
    'Phoenix', 'AZ', 'on_duty', 'owner_operator',
    'CDL789012', 'AZ', ARRAY['Flatbed'], 'T002',
    (SELECT id FROM companies LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Sarah Johnson');

INSERT INTO drivers (
    name, email, phone, city, state, status, driver_type,
    license_number, license_state, equipment_preferences, truck_number, company_id
) 
SELECT 
    'Mike Rodriguez', 'mike.rodriguez@example.com', '(555) 345-6789', 
    'Dallas', 'TX', 'off_duty', 'company',
    'CDL345678', 'TX', ARRAY['Dry Van', 'Flatbed'], 'T003',
    (SELECT id FROM companies LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Mike Rodriguez');

INSERT INTO drivers (
    name, email, phone, city, state, status, driver_type,
    license_number, license_state, equipment_preferences, truck_number, company_id
) 
SELECT 
    'Lisa Chen', 'lisa.chen@example.com', '(555) 456-7890', 
    'Seattle', 'WA', 'on_break', 'lease_operator',
    'CDL456789', 'WA', ARRAY['Refrigerated'], 'T004',
    (SELECT id FROM companies LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Lisa Chen');

-- Initialize performance records for all sample drivers
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

INSERT INTO driver_performance (driver_id, total_miles, total_revenue, total_loads, on_time_delivery_rate, load_acceptance_rate, average_rpm)
SELECT 
    d.id, 21300, 71200, 38, 97.4, 94.0, 3.34
FROM drivers d 
WHERE d.name = 'Lisa Chen'
AND NOT EXISTS (SELECT 1 FROM driver_performance WHERE driver_id = d.id);

-- Initialize messaging preferences for all drivers
INSERT INTO driver_messaging (driver_id, telegram_enabled, whatsapp_enabled, sms_enabled, email_enabled)
SELECT d.id, true, true, true, true
FROM drivers d 
WHERE NOT EXISTS (SELECT 1 FROM driver_messaging WHERE driver_id = d.id);

-- Add some sample documents for the drivers
INSERT INTO driver_documents (driver_id, document_type, document_name, status, expiration_date)
SELECT 
    d.id, 'cdl', 'CDL License', 'approved', '2025-12-31'
FROM drivers d 
WHERE d.name = 'John Smith'
AND NOT EXISTS (SELECT 1 FROM driver_documents WHERE driver_id = d.id AND document_type = 'cdl');

INSERT INTO driver_documents (driver_id, document_type, document_name, status, expiration_date)
SELECT 
    d.id, 'medical_card', 'DOT Medical Card', 'approved', '2025-06-30'
FROM drivers d 
WHERE d.name = 'John Smith'
AND NOT EXISTS (SELECT 1 FROM driver_documents WHERE driver_id = d.id AND document_type = 'medical_card');

INSERT INTO driver_documents (driver_id, document_type, document_name, status, expiration_date)
SELECT 
    d.id, 'cdl', 'CDL License', 'approved', '2026-03-15'
FROM drivers d 
WHERE d.name = 'Sarah Johnson'
AND NOT EXISTS (SELECT 1 FROM driver_documents WHERE driver_id = d.id AND document_type = 'cdl');

INSERT INTO driver_documents (driver_id, document_type, document_name, status, expiration_date)
SELECT 
    d.id, 'drug_test', 'Drug Test Results', 'approved', NULL
FROM drivers d 
WHERE d.name = 'Sarah Johnson'
AND NOT EXISTS (SELECT 1 FROM driver_documents WHERE driver_id = d.id AND document_type = 'drug_test');

COMMIT;
