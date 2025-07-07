-- First check what columns actually exist in companies table
DO $$
DECLARE
    companies_exists boolean;
BEGIN
    -- Check if companies table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
    ) INTO companies_exists;
    
    IF NOT companies_exists THEN
        RAISE NOTICE 'Companies table does not exist. Creating it first.';
        
        -- Create companies table if it doesn't exist
        CREATE TABLE companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            dot_number VARCHAR(50),
            mc_number VARCHAR(50),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(2),
            postal_code VARCHAR(20),
            phone VARCHAR(20),
            email VARCHAR(255),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Companies table created successfully.';
    ELSE
        RAISE NOTICE 'Companies table already exists.';
    END IF;
END $$;

-- Now insert or update the default company
INSERT INTO companies (
    id,
    name,
    dot_number,
    mc_number,
    address,
    city,
    state,
    postal_code,
    phone,
    email,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Demo Transportation Company',
    '12345678',
    'MC-123456',
    '123 Demo Street',
    'Demo City',
    'TX',
    '75001',
    '(555) 123-4567',
    'admin@demo-transport.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- Verify the company was created/updated
SELECT 
    id,
    name,
    dot_number,
    mc_number,
    is_active,
    created_at
FROM companies 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Also check if there are any users without valid company_id
SELECT 
    u.id,
    u.email,
    u.company_id,
    c.name as company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.company_id IS NULL OR c.id IS NULL
LIMIT 10;
