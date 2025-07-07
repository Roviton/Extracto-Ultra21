-- Dynamic company fix that works with existing table structure
DO $$
DECLARE
    has_zip boolean := false;
    has_postal_code boolean := false;
    has_zip_code boolean := false;
    demo_company_exists boolean := false;
BEGIN
    -- Check what zip-related columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND table_schema = 'public' 
        AND column_name = 'zip'
    ) INTO has_zip;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND table_schema = 'public' 
        AND column_name = 'postal_code'
    ) INTO has_postal_code;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND table_schema = 'public' 
        AND column_name = 'zip_code'
    ) INTO has_zip_code;
    
    RAISE NOTICE 'Column check: zip=%, postal_code=%, zip_code=%', has_zip, has_postal_code, has_zip_code;
    
    -- Check if demo company already exists
    SELECT EXISTS (
        SELECT 1 FROM companies 
        WHERE id = '550e8400-e29b-41d4-a716-446655440000'
    ) INTO demo_company_exists;
    
    RAISE NOTICE 'Demo company exists: %', demo_company_exists;
    
    -- Insert demo company using only columns that definitely exist
    IF NOT demo_company_exists THEN
        IF has_zip THEN
            INSERT INTO companies (id, name, address, city, state, zip, phone, email, created_at, updated_at)
            VALUES (
                '550e8400-e29b-41d4-a716-446655440000',
                'Demo Transportation Company',
                '123 Demo Street',
                'Demo City',
                'TX',
                '75001',
                '(555) 123-4567',
                'admin@demo-transport.com',
                NOW(),
                NOW()
            );
        ELSIF has_postal_code THEN
            INSERT INTO companies (id, name, address, city, state, postal_code, phone, email, created_at, updated_at)
            VALUES (
                '550e8400-e29b-41d4-a716-446655440000',
                'Demo Transportation Company',
                '123 Demo Street',
                'Demo City',
                'TX',
                '75001',
                '(555) 123-4567',
                'admin@demo-transport.com',
                NOW(),
                NOW()
            );
        ELSIF has_zip_code THEN
            INSERT INTO companies (id, name, address, city, state, zip_code, phone, email, created_at, updated_at)
            VALUES (
                '550e8400-e29b-41d4-a716-446655440000',
                'Demo Transportation Company',
                '123 Demo Street',
                'Demo City',
                'TX',
                '75001',
                '(555) 123-4567',
                'admin@demo-transport.com',
                NOW(),
                NOW()
            );
        ELSE
            -- Insert without zip column if none exist
            INSERT INTO companies (id, name, address, city, state, phone, email, created_at, updated_at)
            VALUES (
                '550e8400-e29b-41d4-a716-446655440000',
                'Demo Transportation Company',
                '123 Demo Street',
                'Demo City',
                'TX',
                '(555) 123-4567',
                'admin@demo-transport.com',
                NOW(),
                NOW()
            );
        END IF;
        
        RAISE NOTICE 'Demo company created successfully';
    ELSE
        RAISE NOTICE 'Demo company already exists, skipping creation';
    END IF;
    
END $$;

-- Verify the company exists
SELECT 
    id,
    name,
    city,
    state,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'zip') 
        THEN zip::text
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'postal_code') 
        THEN postal_code::text
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'zip_code') 
        THEN zip_code::text
        ELSE 'No zip column'
    END as zip_value
FROM companies 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
