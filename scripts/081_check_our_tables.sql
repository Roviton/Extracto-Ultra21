-- Check what tables we have in the public schema
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_name IN ('users', 'companies', 'customers', 'loads')
ORDER BY 
    table_name;

-- Check if we have a custom users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'users'
ORDER BY 
    ordinal_position;
