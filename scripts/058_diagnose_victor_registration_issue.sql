-- Diagnose the specific issue with victor1rotaru@gmail.com registration
-- This will help us understand what went wrong

-- Check if company was created
SELECT 'Company Records for victor1rotaru@gmail.com:' as check_type;
SELECT 
  id,
  name,
  email,
  created_at,
  dot_number,
  mc_number
FROM companies 
WHERE email = 'victor1rotaru@gmail.com';

-- Check if user profile was created
SELECT 'User Profile Records for victor1rotaru@gmail.com:' as check_type;
SELECT 
  id,
  name,
  email,
  role,
  company_id,
  is_active,
  created_at
FROM users 
WHERE email = 'victor1rotaru@gmail.com';

-- Check for orphaned companies (company without user profile)
SELECT 'Orphaned Companies (no matching user profile):' as check_type;
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.email as company_email,
  c.created_at,
  u.id as user_id
FROM companies c
LEFT JOIN users u ON c.id = u.company_id AND u.role = 'admin'
WHERE c.email = 'victor1rotaru@gmail.com' AND u.id IS NULL;

-- Check for orphaned users (user without company)
SELECT 'Orphaned Users (no matching company):' as check_type;
SELECT 
  u.id as user_id,
  u.name as user_name,
  u.email as user_email,
  u.company_id,
  c.id as company_exists
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.email = 'victor1rotaru@gmail.com' AND c.id IS NULL;

-- Check recent registrations in the last 2 hours
SELECT 'Recent Registrations (last 2 hours):' as check_type;
SELECT 
  'Company' as record_type,
  id::text,
  name,
  email,
  created_at
FROM companies 
WHERE created_at > NOW() - INTERVAL '2 hours'
UNION ALL
SELECT 
  'User' as record_type,
  id::text,
  name,
  email,
  created_at
FROM users 
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;
