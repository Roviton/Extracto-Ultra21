-- Simple test to verify we can create a load
DO $$
DECLARE
    test_company_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    test_user_id UUID := '11111111-1111-1111-1111-111111111111';
    test_customer_id UUID;
    test_load_id UUID;
BEGIN
    -- Check if company exists
    IF NOT EXISTS (SELECT 1 FROM companies WHERE id = test_company_id) THEN
        RAISE EXCEPTION 'Demo company does not exist';
    END IF;
    
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = test_user_id) THEN
        RAISE EXCEPTION 'Test user does not exist';
    END IF;
    
    -- Check if test customer exists
    SELECT id INTO test_customer_id 
    FROM customers 
    WHERE name = 'Test Customer' AND company_id = test_company_id
    LIMIT 1;
    
    -- If customer doesn't exist, create it
    IF test_customer_id IS NULL THEN
        INSERT INTO customers (
            id,
            name,
            company_id,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'Test Customer',
            test_company_id,
            NOW(),
            NOW()
        )
        RETURNING id INTO test_customer_id;
        
        RAISE NOTICE 'Created new test customer: %', test_customer_id;
    ELSE
        RAISE NOTICE 'Using existing test customer: %', test_customer_id;
    END IF;
    
    -- Create test load
    INSERT INTO loads (
        id,
        company_id,
        load_number,
        customer_id,
        dispatcher_id,
        created_by,
        pickup_address,
        pickup_city,
        pickup_state,
        pickup_date,
        delivery_address,
        delivery_city,
        delivery_state,
        delivery_date,
        rate,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        test_company_id,
        'TEST-' || extract(epoch from now())::text,
        test_customer_id,
        test_user_id,
        test_user_id,
        '123 Pickup St',
        'Pickup City',
        'TX',
        CURRENT_DATE + 1,
        '456 Delivery Ave',
        'Delivery City',
        'FL',
        CURRENT_DATE + 3,
        1500.00,
        'new',
        NOW(),
        NOW()
    )
    RETURNING id INTO test_load_id;
    
    RAISE NOTICE 'Test load created successfully: %', test_load_id;
    
    -- Clean up test data (only delete the load, keep the customer for future tests)
    DELETE FROM loads WHERE id = test_load_id;
    
    RAISE NOTICE 'Test completed successfully - load creation works!';
    
END $$;
