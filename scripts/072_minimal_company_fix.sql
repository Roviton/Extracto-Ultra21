-- Minimal company fix - only use columns that definitely exist
DO $$
DECLARE
    demo_company_exists boolean := false;
    companies_table_exists boolean := false;
BEGIN
    -- Check if companies table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
    ) INTO companies_table_exists;
    
    IF NOT companies_table_exists THEN
        RAISE NOTICE 'Companies table does not exist! Creating basic table...';
        
        CREATE TABLE companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Basic companies table created';
    END IF;
    
    -- Check if demo company exists
    SELECT EXISTS (
        SELECT 1 FROM companies 
        WHERE id = '550e8400-e29b-41d4-a716-446655440000'
    ) INTO demo_company_exists;
    
    RAISE NOTICE 'Demo company exists: %', demo_company_exists;
    
    -- Insert demo company with only guaranteed columns
    IF NOT demo_company_exists THEN
        INSERT INTO companies (id, name, created_at, updated_at)
        VALUES (
            '550e8400-e29b-41d4-a716-446655440000',
            'Demo Transportation Company',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Demo company created with minimal data';
    ELSE
        RAISE NOTICE 'Demo company already exists';
    END IF;
    
END $$;

-- Show what we have now
SELECT 
    'Demo company verification:' as info,
    id,
    name,
    created_at
FROM companies 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
