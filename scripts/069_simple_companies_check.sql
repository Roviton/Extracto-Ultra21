-- Simple check to see what columns actually exist in companies table
\d companies;

-- Alternative way to check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if the table exists at all
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'companies'
) as table_exists;

-- Show a sample record if any exist
SELECT * FROM companies LIMIT 1;
