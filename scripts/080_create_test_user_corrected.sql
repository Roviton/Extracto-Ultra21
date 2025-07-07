-- Ensure we have a test user for the demo company with all required fields
DO $$
DECLARE
    test_user_exists boolean := false;
    test_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Check if test user exists in our custom users table
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = test_user_id
    ) INTO test_user_exists;
    
    IF NOT test_user_exists THEN
        INSERT INTO public.users (
            id,
            email,
            name,
            role,
            company_id,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            test_user_id,
            'test@demo-transport.com',
            'Test User',
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
    
    -- Show the test user using PERFORM to avoid the error
    PERFORM 'Test user created/verified' as status;
    
END $$;

-- Now show the test user details
SELECT 
    'Test user details:' as info,
    id,
    email,
    name,
    role,
    company_id,
    is_active
FROM public.users 
WHERE id = '11111111-1111-1111-1111-111111111111';
