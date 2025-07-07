-- Fix demo users company_id mismatch
-- The demo users in auth context have wrong company_id

DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Update all demo users to use the correct company_id
    UPDATE users 
    SET company_id = '550e8400-e29b-41d4-a716-446655440000',
        updated_at = NOW()
    WHERE id IN (
        '550e8400-e29b-41d4-a716-446655440010', -- admin@example.com
        '550e8400-e29b-41d4-a716-446655440011', -- dispatcher@example.com  
        '550e8400-e29b-41d4-a716-446655440012'  -- dispatcher2@example.com
    );

    -- Verify the updates
    RAISE NOTICE 'Updated demo users company_id. Current demo users:';
    
    -- Show updated users
    FOR rec IN 
        SELECT id, email, name, role, company_id 
        FROM users 
        WHERE id IN (
            '550e8400-e29b-41d4-a716-446655440010',
            '550e8400-e29b-41d4-a716-446655440011', 
            '550e8400-e29b-41d4-a716-446655440012'
        )
        ORDER BY email
    LOOP
        RAISE NOTICE 'User: % (%) - Role: % - Company: %', 
            rec.email, rec.name, rec.role, rec.company_id;
    END LOOP;

    -- Also ensure the demo company exists with the correct ID
    INSERT INTO companies (
        id,
        name,
        address,
        city,
        state,
        zip,
        phone,
        email,
        dot_number,
        mc_number,
        created_at,
        updated_at
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440000',
        'Demo Transportation Company',
        '123 Demo Street',
        'Demo City', 
        'TX',
        '75001',
        '(555) 123-4567',
        'admin@demo-transport.com',
        '12345678',
        'MC-123456',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        updated_at = NOW();

    RAISE NOTICE 'Demo company ensured with ID: 550e8400-e29b-41d4-a716-446655440000';

END $$;
