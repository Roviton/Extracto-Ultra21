-- Check if we have any drivers
DO $$
DECLARE
    driver_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO driver_count FROM drivers;
    
    IF driver_count = 0 THEN
        -- Create sample drivers if none exist
        INSERT INTO drivers (name, email, phone, status, equipment_type_id)
        VALUES 
            ('John Smith', 'john.smith@example.com', '555-123-4567', 'available', (SELECT id FROM equipment_types LIMIT 1)),
            ('Sarah Johnson', 'sarah.johnson@example.com', '555-234-5678', 'available', (SELECT id FROM equipment_types LIMIT 1)),
            ('Mike Williams', 'mike.williams@example.com', '555-345-6789', 'on_delivery', (SELECT id FROM equipment_types LIMIT 1)),
            ('Tom Davis', 'tom.davis@example.com', '555-456-7890', 'available', (SELECT id FROM equipment_types LIMIT 1));
            
        RAISE NOTICE 'Created 4 sample drivers';
    ELSE
        RAISE NOTICE 'Drivers already exist, skipping sample data creation';
    END IF;
END $$;
