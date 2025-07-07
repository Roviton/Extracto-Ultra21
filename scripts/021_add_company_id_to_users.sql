-- Step 1: Add the company_id column to the users table
-- It's made nullable initially to allow adding it to a table with existing data.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS company_id UUID;

-- Step 2: Add a foreign key constraint to link users to companies
-- This ensures data integrity.
-- We add a specific name to the constraint to make it easy to manage.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_company_id_fkey' AND conrelid = 'public.users'::regclass
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_company_id_fkey
        FOREIGN KEY (company_id) REFERENCES public.companies(id)
        ON DELETE SET NULL; -- Or ON DELETE CASCADE depending on desired behavior
    END IF;
END;
$$;

-- Step 3: Populate the company_id for existing users
-- This is a CRITICAL step for existing data.
-- It finds the first company in the companies table and assigns it to all users
-- who don't have a company_id yet.
-- In a real-world scenario with multiple companies, you would need a more
-- sophisticated script to assign users to the correct companies.
DO $$
DECLARE
    default_company_id UUID;
BEGIN
    -- Select the ID of the first company to use as a default
    SELECT id INTO default_company_id FROM public.companies LIMIT 1;

    -- If a default company exists, update all users that have a NULL company_id
    IF default_company_id IS NOT NULL THEN
        UPDATE public.users
        SET company_id = default_company_id
        WHERE company_id IS NULL;
    ELSE
        RAISE WARNING 'No companies found in the companies table. Could not assign a default company to users.';
    END IF;
END;
$$;

-- Step 4: (Optional but Recommended) Make the company_id column NOT NULL
-- After populating it for all existing users, you can enforce that all new users must have a company.
-- Only run this if you are sure all users have a company_id assigned.
-- ALTER TABLE public.users
-- ALTER COLUMN company_id SET NOT NULL;

COMMENT ON COLUMN public.users.company_id IS 'Links the user to a specific company for multi-tenancy.';
