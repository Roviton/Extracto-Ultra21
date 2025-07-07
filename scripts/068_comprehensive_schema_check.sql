-- Comprehensive schema verification
-- Check all main tables and their structures

-- 1. Companies table
SELECT 'COMPANIES TABLE STRUCTURE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Users table
SELECT 'USERS TABLE STRUCTURE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check foreign key constraints
SELECT 'FOREIGN KEY CONSTRAINTS' as info;
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND (tc.table_name = 'users' OR tc.table_name = 'customers' OR tc.table_name = 'loads')
ORDER BY tc.table_name, kcu.column_name;

-- 4. Check data integrity
SELECT 'DATA INTEGRITY CHECK' as info;

-- Count records in main tables
SELECT 'companies' as table_name, COUNT(*) as record_count FROM companies
UNION ALL
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'loads' as table_name, COUNT(*) as record_count FROM loads;

-- Check for orphaned records
SELECT 'ORPHANED RECORDS CHECK' as info;

-- Users without valid companies
SELECT 
    'users_without_companies' as issue,
    COUNT(*) as count
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.company_id IS NOT NULL AND c.id IS NULL;
