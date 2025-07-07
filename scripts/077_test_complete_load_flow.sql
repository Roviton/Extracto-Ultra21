-- Test complete load creation flow
DO $$
DECLARE
    test_customer_id UUID;
    test_load_id UUID;
    test_user_id UUID := '11111111-1111-1111-1111-111111111111';
    company_id UUID := '550e8400-e29b-41d4-a716-446655440000';
BEGIN
    RAISE NOTICE 'Starting complete load creation test...';
    
    -- 1. Create test customer
    INSERT INTO customers (name, company_id, created_at, updated_at)
    VALUES (
        'API Test Customer',
        company_id,
        NOW(),
        NOW()
    )
    RETURNING id INTO test_customer_id;
    
    RAISE NOTICE 'Test customer created: %', test_customer_id;
    
    -- 2. Create test load
    INSERT INTO loads (
        load_number,
        company_id,
        customer_id,
        dispatcher_id,
        created_by,
        status,
        pickup_location,
        delivery_location,
        pickup_date,
        delivery_date,
        rate,
        created_at,
        updated_at
    ) VALUES (
        'TEST-LOAD-' || EXTRACT(EPOCH FROM NOW())::bigint,
        company_id,
        test_customer_id,
        test_user_id,
        test_user_id,
        'new',
        'Test Pickup Location',
        'Test Delivery Location',
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '3 days',
        1500.00,
        NOW(),
        NOW()
    )
    RETURNING id INTO test_load_id;
    
    RAISE NOTICE 'Test load created: %', test_load_id;
    
    -- 3. Verify the load was created correctly
    PERFORM 1 FROM loads 
    WHERE id = test_load_id 
    AND company_id = company_id 
    AND customer_id = test_customer_id;
    
    IF FOUND THEN
        RAISE NOTICE 'SUCCESS: Load creation test passed!';
    ELSE
        RAISE NOTICE 'ERROR: Load not found after creation';
    END IF;
    
    -- 4. Clean up test data
    DELETE FROM loads WHERE id = test_load_id;
    DELETE FROM customers WHERE id = test_customer_id;
    
    RAISE NOTICE 'Test data cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR in load creation test: %', SQLERRM;
    -- Try to clean up even if there was an error
    BEGIN
        DELETE FROM loads WHERE id = test_load_id;
        DELETE FROM customers WHERE id = test_customer_id;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore cleanup errors
    END;
END $$;
