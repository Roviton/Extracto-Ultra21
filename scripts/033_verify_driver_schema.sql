-- Verify the actual drivers table schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'drivers' 
ORDER BY ordinal_position;

-- Check if Forward Strong LLC company exists (without is_active if it doesn't exist)
SELECT id, name
FROM companies 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Show sample driver data structure (without is_active column)
SELECT id, company_id, name, email, phone, status, created_at
FROM drivers 
LIMIT 3;

-- Check what columns actually exist in companies table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;
