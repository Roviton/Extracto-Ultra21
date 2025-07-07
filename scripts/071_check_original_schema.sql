-- Check what the original schema defined for companies table
-- This will help us understand what went wrong

-- First, let's see the current table structure
SELECT 
    'Current companies table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any constraints
SELECT 
    'Constraints on companies table:' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'companies'
    AND table_schema = 'public';

-- Check the database types file to see what we expect
-- Let's also check if there are any recent schema changes in the logs
SELECT 
    'Recent companies table changes (if any):' as info;

-- Show current data in companies table
SELECT 
    'Current companies data:' as info,
    *
FROM companies
LIMIT 5;
