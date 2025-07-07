-- Ensure we have a test user for the demo company with all required fields
DO $$
DECLARE
    test_user_exists boolean := false;
    test_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Check if test user exists
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE id = test_user_id
    ) INTO test_user_exists;
    
    IF NOT test_user_exists THEN
        INSERT INTO users (
            id,
            email,
            name,  -- Added the required name field
            role,
            company_id,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            test_user_id,
            'test@demo-transport.com',
            'Test User',  -- Added name value
            'dispatcher',
            '550e8400-e29b-41d4-a716-446655440000',
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Test user created: %', test_user_id;
    ELSE
        RAISE NOTICE 'Test user already exists: %', test_user_id;
    END IF;
    
    -- Show the test user
    SELECT 
        'Test user details:' as info,
        id,
        email,
        name,
        role,
        company_id,
        is_active
    FROM users 
    WHERE id = test_user_id;
    
END $$;
