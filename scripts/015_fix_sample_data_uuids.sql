-- Fix sample data to use proper UUIDs
-- This script will recreate sample data with proper UUID format

-- First, let's check what we have and clean up if needed
DO $$
BEGIN
    -- Check if we have any non-UUID data and clean it up
    DELETE FROM load_drivers WHERE true;
    DELETE FROM loads WHERE true;
    DELETE FROM drivers WHERE true;
    DELETE FROM customers WHERE true;
    DELETE FROM users WHERE true;
    DELETE FROM companies WHERE true;
    DELETE FROM equipment_types WHERE true;
    
    RAISE NOTICE 'Cleaned up existing sample data';
END $$;

-- Create equipment types with proper UUIDs
INSERT INTO equipment_types (id, name, description) VALUES
(gen_random_uuid(), 'Dry Van', '53ft standard dry van trailer'),
(gen_random_uuid(), 'Refrigerated', '53ft temperature controlled trailer'),
(gen_random_uuid(), 'Flatbed', '48ft flatbed trailer'),
(gen_random_uuid(), 'Step Deck', '48ft step deck trailer')
ON CONFLICT (name) DO NOTHING;

-- Create a sample company with proper UUID
INSERT INTO companies (id, name, address, city, state, zip, phone, email, mc_number, dot_number) VALUES
(gen_random_uuid(), 'FreightFlow Logistics', '123 Logistics Way', 'Dallas', 'TX', '75201', '+1-555-0100', 'info@freightflow.com', 'MC-123456', 'DOT-789012')
ON CONFLICT (name) DO NOTHING;

-- Create sample users with proper UUIDs
INSERT INTO users (id, name, email, role, phone) VALUES
(gen_random_uuid(), 'John Dispatcher', 'john@freightflow.com', 'dispatcher', '+1-555-0101'),
(gen_random_uuid(), 'Sarah Manager', 'sarah@freightflow.com', 'manager', '+1-555-0102'),
(gen_random_uuid(), 'Mike Admin', 'mike@freightflow.com', 'admin', '+1-555-0103')
ON CONFLICT (email) DO NOTHING;

-- Create sample customers with proper UUIDs
INSERT INTO customers (id, name, contact_name, email, phone, address, city, state, zip) VALUES
(gen_random_uuid(), 'Acme Manufacturing', 'Bob Johnson', 'bob@acme.com', '+1-555-0201', '456 Industrial Blvd', 'Houston', 'TX', '77001'),
(gen_random_uuid(), 'Global Retail Corp', 'Lisa Smith', 'lisa@globalretail.com', '+1-555-0202', '789 Commerce St', 'Atlanta', 'GA', '30301'),
(gen_random_uuid(), 'Tech Solutions Inc', 'David Wilson', 'david@techsolutions.com', '+1-555-0203', '321 Innovation Dr', 'Austin', 'TX', '78701')
ON CONFLICT (name) DO NOTHING;

-- Create sample drivers with proper UUIDs
INSERT INTO drivers (id, name, phone, email, status, location, avatar, rating, equipment_type_id) VALUES
(gen_random_uuid(), 'John Smith', '+1-555-0301', 'john.smith@driver.com', 'available', 'Dallas, TX', '/javascript-code.png', 4.8, (SELECT id FROM equipment_types WHERE name = 'Dry Van' LIMIT 1)),
(gen_random_uuid(), 'Sarah Johnson', '+1-555-0302', 'sarah.johnson@driver.com', 'available', 'Houston, TX', '/stylized-letters-sj.png', 4.9, (SELECT id FROM equipment_types WHERE name = 'Refrigerated' LIMIT 1)),
(gen_random_uuid(), 'Mike Williams', '+1-555-0303', 'mike.williams@driver.com', 'on_delivery', 'Austin, TX', '/intertwined-letters.png', 4.7, (SELECT id FROM equipment_types WHERE name = 'Flatbed' LIMIT 1)),
(gen_random_uuid(), 'Tom Davis', '+1-555-0304', 'tom.davis@driver.com', 'available', 'San Antonio, TX', '/abstract-geometric-TD.png', 4.6, (SELECT id FROM equipment_types WHERE name = 'Step Deck' LIMIT 1)),
(gen_random_uuid(), 'Lisa Brown', '+1-555-0305', 'lisa.brown@driver.com', 'available', 'Fort Worth, TX', '/stylized-letter-lb.png', 4.5, (SELECT id FROM equipment_types WHERE name = 'Dry Van' LIMIT 1))
ON CONFLICT (email) DO NOTHING;

-- Create sample loads with proper UUIDs
INSERT INTO loads (
    id, load_number, reference_number, customer_id, dispatcher_id, company_id, equipment_type_id,
    pickup_address, pickup_city, pickup_state, pickup_zip, pickup_date, pickup_time,
    pickup_contact_name, pickup_contact_phone,
    delivery_address, delivery_city, delivery_state, delivery_zip, delivery_date, delivery_time,
    delivery_contact_name, delivery_contact_phone,
    commodity, weight, pieces, rate, distance, status, special_instructions
) VALUES
(
    gen_random_uuid(), 'L-2024-001', 'REF-001',
    (SELECT id FROM customers WHERE name = 'Acme Manufacturing' LIMIT 1),
    (SELECT id FROM users WHERE role = 'dispatcher' LIMIT 1),
    (SELECT id FROM companies LIMIT 1),
    (SELECT id FROM equipment_types WHERE name = 'Dry Van' LIMIT 1),
    '123 Pickup St', 'Dallas', 'TX', '75201', CURRENT_DATE + INTERVAL '1 day', '08:00',
    'John Pickup', '+1-555-1001',
    '456 Delivery Ave', 'Houston', 'TX', '77001', CURRENT_DATE + INTERVAL '2 days', '14:00',
    'Jane Delivery', '+1-555-1002',
    'Electronics', 15000, 10, 2500.00, 240, 'new', 'Handle with care'
),
(
    gen_random_uuid(), 'L-2024-002', 'REF-002',
    (SELECT id FROM customers WHERE name = 'Global Retail Corp' LIMIT 1),
    (SELECT id FROM users WHERE role = 'dispatcher' LIMIT 1),
    (SELECT id FROM companies LIMIT 1),
    (SELECT id FROM equipment_types WHERE name = 'Refrigerated' LIMIT 1),
    '789 Cold Storage Rd', 'Atlanta', 'GA', '30301', CURRENT_DATE + INTERVAL '1 day', '06:00',
    'Bob Cold', '+1-555-2001',
    '321 Fresh Market St', 'Miami', 'FL', '33101', CURRENT_DATE + INTERVAL '3 days', '10:00',
    'Alice Fresh', '+1-555-2002',
    'Frozen Foods', 25000, 15, 3200.00, 650, 'new', 'Keep frozen at -10°F'
),
(
    gen_random_uuid(), 'L-2024-003', 'REF-003',
    (SELECT id FROM customers WHERE name = 'Tech Solutions Inc' LIMIT 1),
    (SELECT id FROM users WHERE role = 'dispatcher' LIMIT 1),
    (SELECT id FROM companies LIMIT 1),
    (SELECT id FROM equipment_types WHERE name = 'Flatbed' LIMIT 1),
    '555 Heavy Equipment Way', 'Austin', 'TX', '78701', CURRENT_DATE + INTERVAL '2 days', '07:00',
    'Mike Heavy', '+1-555-3001',
    '777 Construction Site Blvd', 'Phoenix', 'AZ', '85001', CURRENT_DATE + INTERVAL '4 days', '16:00',
    'Steve Build', '+1-555-3002',
    'Machinery', 40000, 1, 4500.00, 850, 'new', 'Oversized load - permits required'
);

-- Verify the data was created correctly
DO $$
DECLARE
    company_count INTEGER;
    user_count INTEGER;
    customer_count INTEGER;
    driver_count INTEGER;
    load_count INTEGER;
    equipment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO company_count FROM companies;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO customer_count FROM customers;
    SELECT COUNT(*) INTO driver_count FROM drivers;
    SELECT COUNT(*) INTO load_count FROM loads;
    SELECT COUNT(*) INTO equipment_count FROM equipment_types;
    
    RAISE NOTICE 'Sample data created successfully:';
    RAISE NOTICE '- Companies: %', company_count;
    RAISE NOTICE '- Users: %', user_count;
    RAISE NOTICE '- Customers: %', customer_count;
    RAISE NOTICE '- Drivers: %', driver_count;
    RAISE NOTICE '- Loads: %', load_count;
    RAISE NOTICE '- Equipment Types: %', equipment_count;
    
    IF company_count = 0 OR user_count = 0 OR customer_count = 0 OR driver_count = 0 OR equipment_count = 0 THEN
        RAISE EXCEPTION 'Failed to create required sample data';
    END IF;
END $$;

-- Show some sample IDs to verify they are proper UUIDs
SELECT 'Companies' as table_name, id, name FROM companies LIMIT 2
UNION ALL
SELECT 'Users' as table_name, id, name FROM users LIMIT 2
UNION ALL
SELECT 'Drivers' as table_name, id, name FROM drivers LIMIT 2
UNION ALL
SELECT 'Customers' as table_name, id, name FROM customers LIMIT 2;
