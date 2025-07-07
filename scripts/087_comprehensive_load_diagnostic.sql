DO $$
DECLARE
    company_uuid uuid := '550e8400-e29b-41d4-a716-446655440000';
    load_uuid uuid := '2d3c1957-8a3f-4b5d-b39a-0cced9237874';
    customer_uuid uuid := 'f9c8e838-3487-482e-a129-819d3e2df523';
    rec RECORD;
BEGIN
    RAISE NOTICE '=== COMPREHENSIVE LOAD DIAGNOSTIC ===';
    
    -- Check if the specific load exists by ID
    RAISE NOTICE '1. Checking for specific load ID: %', load_uuid;
    IF EXISTS (SELECT 1 FROM loads WHERE id = load_uuid) THEN
        RAISE NOTICE '✅ Load exists with ID: %', load_uuid;
    ELSE
        RAISE NOTICE '❌ Load NOT found with ID: %', load_uuid;
    END IF;
    
    -- Check if the specific customer exists by ID
    RAISE NOTICE '2. Checking for specific customer ID: %', customer_uuid;
    IF EXISTS (SELECT 1 FROM customers WHERE id = customer_uuid) THEN
        RAISE NOTICE '✅ Customer exists with ID: %', customer_uuid;
    ELSE
        RAISE NOTICE '❌ Customer NOT found with ID: %', customer_uuid;
    END IF;
    
    -- Count all loads in the system
    RAISE NOTICE '3. Total loads in system: %', (SELECT COUNT(*) FROM loads);
    
    -- Count all customers in the system
    RAISE NOTICE '4. Total customers in system: %', (SELECT COUNT(*) FROM customers);
    
    -- Count loads for our specific company
    RAISE NOTICE '5. Loads for company %: %', company_uuid, (SELECT COUNT(*) FROM loads WHERE company_id = company_uuid);
    
    -- Count customers for our specific company
    RAISE NOTICE '6. Customers for company %: %', company_uuid, (SELECT COUNT(*) FROM customers WHERE company_id = company_uuid);
    
    -- Show recent loads (last 10)
    RAISE NOTICE '7. Recent loads (last 10):';
    FOR rec IN 
        SELECT id, load_number, company_id, status, created_at 
        FROM loads 
        ORDER BY created_at DESC 
        LIMIT 10
    LOOP
        RAISE NOTICE '   Load: % | Number: % | Company: % | Status: % | Created: %', 
            rec.id, rec.load_number, rec.company_id, rec.status, rec.created_at;
    END LOOP;
    
    -- Show recent customers (last 10)
    RAISE NOTICE '8. Recent customers (last 10):';
    FOR rec IN 
        SELECT id, name, company_id, created_at 
        FROM customers 
        ORDER BY created_at DESC 
        LIMIT 10
    LOOP
        RAISE NOTICE '   Customer: % | Name: % | Company: % | Created: %', 
            rec.id, rec.name, rec.company_id, rec.created_at;
    END LOOP;
    
    -- Check if there are any loads with load_number like the one we created
    RAISE NOTICE '9. Checking for loads with number 636-0272-0525:';
    FOR rec IN 
        SELECT id, load_number, company_id, status, created_at 
        FROM loads 
        WHERE load_number LIKE '%636-0272-0525%'
    LOOP
        RAISE NOTICE '   Found load: % | Number: % | Company: % | Status: %', 
            rec.id, rec.load_number, rec.company_id, rec.status;
    END LOOP;
    
    -- Check if there are any customers with name like the one we created
    RAISE NOTICE '10. Checking for customers with name like R & R EXPRESS:';
    FOR rec IN 
        SELECT id, name, company_id, created_at 
        FROM customers 
        WHERE name ILIKE '%R & R EXPRESS%'
    LOOP
        RAISE NOTICE '   Found customer: % | Name: % | Company: %', 
            rec.id, rec.name, rec.company_id;
    END LOOP;
    
    RAISE NOTICE '=== END DIAGNOSTIC ===';
END $$;
