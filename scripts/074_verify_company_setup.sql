-- Simple verification that everything is working
SELECT 
    'Companies table structure:' as info;

-- Show table structure
\d companies;

-- Show demo company data
SELECT 
    'Demo company data:' as info,
    *
FROM companies 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Test that we can create a customer for this company
DO $$
DECLARE
    test_customer_id UUID;
BEGIN
    -- Try to insert a test customer
    INSERT INTO customers (name, company_id, created_at, updated_at)
    VALUES (
        'Test Customer',
        '550e8400-e29b-41d4-a716-446655440000',
        NOW(),
        NOW()
    )
    RETURNING id INTO test_customer_id;
    
    RAISE NOTICE 'Test customer created successfully: %', test_customer_id;
    
    -- Clean up test customer
    DELETE FROM customers WHERE id = test_customer_id;
    RAISE NOTICE 'Test customer cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating test customer: %', SQLERRM;
END $$;
