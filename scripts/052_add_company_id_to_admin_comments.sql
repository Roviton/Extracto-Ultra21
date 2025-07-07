-- Check if admin_comments table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_comments'
  ) THEN
    -- Check if company_id column already exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'admin_comments' 
      AND column_name = 'company_id'
    ) THEN
      -- Add company_id column to admin_comments table
      ALTER TABLE public.admin_comments ADD COLUMN company_id UUID;
      
      -- Update existing records with company_id from loads table
      UPDATE public.admin_comments ac
      SET company_id = l.company_id
      FROM public.loads l
      WHERE ac.load_id = l.id;
      
      -- Add foreign key constraint
      ALTER TABLE public.admin_comments
      ADD CONSTRAINT admin_comments_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES public.companies(id);
      
      RAISE NOTICE 'Added company_id column to admin_comments table';
    ELSE
      RAISE NOTICE 'company_id column already exists in admin_comments table';
    END IF;
  ELSE
    RAISE NOTICE 'admin_comments table does not exist';
  END IF;
END $$;
