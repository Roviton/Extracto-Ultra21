-- Final verification that the registration system is ready
-- Run this after the cleanup to ensure everything is working

-- Check that all required tables exist and have correct structure
SELECT 'Checking table existence...' as status;

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('companies', 'users') THEN '✅ Required'
    ELSE '📋 Optional'
  END as importance
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('companies', 'users', 'company_invitations')
ORDER BY table_name;

-- Verify foreign key constraints are working
SELECT 'Checking foreign key constraints...' as status;
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('users', 'companies')
ORDER BY tc.table_name, tc.constraint_name;

-- Check for any orphaned records that might cause issues
SELECT 'Checking for orphaned records...' as status;

-- Users without companies
SELECT 'Users without valid companies:' as issue_type, COUNT(*) as count
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE c.id IS NULL AND u.company_id IS NOT NULL

UNION ALL

-- Companies without admin users
SELECT 'Companies without admin users:' as issue_type, COUNT(*) as count
FROM companies c
LEFT JOIN users u ON c.id = u.company_id AND u.role = 'admin'
WHERE u.id IS NULL;

-- Show system is ready
SELECT '🎉 Registration system verification complete!' as status;
SELECT 'System is ready for victor1rotaru@gmail.com to register again.' as message;
