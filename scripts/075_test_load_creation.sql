-- Test load creation functionality
SELECT 'Testing load creation prerequisites...' as status;

-- 1. Verify demo company exists
SELECT 
    'Demo company check:' as test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM companies WHERE id = '550e8400-e29b-41d4-a716-446655440000') 
        THEN 'PASS - Demo company exists'
        ELSE 'FAIL - Demo company missing'
    END as result;

-- 2. Check if we have any users for this company
SELECT 
    'User check:' as test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM users WHERE company_id = '550e8400-e29b-41d4-a716-446655440000') 
        THEN 'PASS - Users exist for demo company'
        ELSE 'FAIL - No users for demo company'
    END as result;

-- 3. Show existing users for demo company
SELECT 
    'Existing users for demo company:' as info,
    id,
    email,
    role,
    is_active
FROM users 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440000'
LIMIT 5;

-- 4. Test customer creation
DO $$
DECLARE
    test_customer_id UUID;
BEGIN
    INSERT INTO customers (name, company_id, created_at, updated_at)
    VALUES (
        'Test Customer for Load',
        '550e8400-e29b-41d4-a716-446655440000',
        NOW(),
        NOW()
    )
    RETURNING id INTO test_customer_id;
    
    RAISE NOTICE 'SUCCESS: Test customer created with ID: %', test_customer_id;
    
    -- Clean up
    DELETE FROM customers WHERE id = test_customer_id;
    RAISE NOTICE 'Test customer cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR creating test customer: %', SQLERRM;
END $$;

-- 5. Check loads table structure
SELECT 'Loads table check:' as test;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'loads' 
AND table_schema = 'public'
ORDER BY ordinal_position;
