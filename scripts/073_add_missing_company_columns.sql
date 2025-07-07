-- Add missing columns to companies table if they don't exist
DO $$
DECLARE
    col_exists boolean;
BEGIN
    -- Check and add address column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND table_schema = 'public' 
        AND column_name = 'address'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE companies ADD COLUMN address TEXT;
        RAISE NOTICE 'Added address column';
    END IF;
    
    -- Check and add city column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND table_schema = 'public' 
        AND column_name = 'city'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE companies ADD COLUMN city VARCHAR(100);
        RAISE NOTICE 'Added city column';
    END IF;
    
    -- Check and add state column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND table_schema = 'public' 
        AND column_name = 'state'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE companies ADD COLUMN state VARCHAR(2);
        RAISE NOTICE 'Added state column';
    END IF;
    
    -- Check and add zip column (using 'zip' as the simplest name)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND table_schema = 'public' 
        AND column_name = 'zip'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE companies ADD COLUMN zip VARCHAR(10);
        RAISE NOTICE 'Added zip column';
    END IF;
    
    -- Check and add phone column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND table_schema = 'public' 
        AND column_name = 'phone'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE companies ADD COLUMN phone VARCHAR(20);
        RAISE NOTICE 'Added phone column';
    END IF;
    
    -- Check and add email column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND table_schema = 'public' 
        AND column_name = 'email'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE companies ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Added email column';
    END IF;
    
END $$;

-- Update the demo company with additional info if columns now exist
UPDATE companies 
SET 
    address = COALESCE(address, '123 Demo Street'),
    city = COALESCE(city, 'Demo City'),
    state = COALESCE(state, 'TX'),
    zip = COALESCE(zip, '75001'),
    phone = COALESCE(phone, '(555) 123-4567'),
    email = COALESCE(email, 'admin@demo-transport.com'),
    updated_at = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Show final result
SELECT * FROM companies WHERE id = '550e8400-e29b-41d4-a716-446655440000';
