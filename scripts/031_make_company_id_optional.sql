-- First, check if the company_id column exists and has a NOT NULL constraint
DO $$
BEGIN
  -- Make company_id nullable if it exists and is not nullable
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'drivers' 
    AND column_name = 'company_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE drivers ALTER COLUMN company_id DROP NOT NULL;
    RAISE NOTICE 'Made company_id column nullable';
  ELSE
    RAISE NOTICE 'company_id column is already nullable or does not exist';
  END IF;
END $$;

-- Add a default company for testing if it doesn't exist
INSERT INTO companies (id, name, created_at, updated_at)
SELECT 
  '00000000-0000-0000-0000-000000000001', 
  'Default Testing Company', 
  NOW(), 
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM companies WHERE id = '00000000-0000-0000-0000-000000000001'
);
