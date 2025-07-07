-- Verify users table structure and add company_id if missing
DO $$
BEGIN
    -- Check if company_id column exists in users table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'company_id'
        AND table_schema = 'public'
    ) THEN
        -- Add company_id column if it doesn't exist
        ALTER TABLE public.users ADD COLUMN company_id UUID REFERENCES public.companies(id);
        
        -- Update existing users to have a default company_id (using the first company)
        UPDATE public.users 
        SET company_id = (SELECT id FROM public.companies LIMIT 1)
        WHERE company_id IS NULL;
        
        -- Make company_id NOT NULL after setting default values
        ALTER TABLE public.users ALTER COLUMN company_id SET NOT NULL;
        
        RAISE NOTICE 'Added company_id column to users table';
    ELSE
        RAISE NOTICE 'company_id column already exists in users table';
    END IF;
    
    -- Verify sample data has company_id
    UPDATE public.users 
    SET company_id = (SELECT id FROM public.companies LIMIT 1)
    WHERE company_id IS NULL;
    
END $$;

-- Show current users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show users with their company associations
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.company_id,
    c.name as company_name
FROM public.users u
LEFT JOIN public.companies c ON u.company_id = c.id;
