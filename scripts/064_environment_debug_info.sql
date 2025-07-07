-- Debug information for environment and configuration issues

SELECT 'Environment Debug Information' as title;

-- Check all companies for victor1rotaru@gmail.com
SELECT 'All companies for victor1rotaru@gmail.com:' as section;
SELECT 
  id,
  name,
  email,
  created_at,
  updated_at
FROM companies 
WHERE email = 'victor1rotaru@gmail.com'
ORDER BY created_at DESC;

-- Check all user profiles for victor1rotaru@gmail.com
SELECT 'All user profiles for victor1rotaru@gmail.com:' as section;
SELECT 
  id,
  name,
  email,
  role,
  company_id,
  phone,
  is_active,
  created_at,
  updated_at
FROM users 
WHERE email = 'victor1rotaru@gmail.com'
ORDER BY created_at DESC;

-- Check for orphaned companies (no matching user)
SELECT 'Orphaned companies (no matching user):' as section;
SELECT 
  c.id,
  c.name,
  c.email,
  c.created_at
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
WHERE c.email = 'victor1rotaru@gmail.com'
  AND u.id IS NULL;

-- Check for orphaned users (no matching company)
SELECT 'Orphaned users (no matching company):' as section;
SELECT 
  u.id,
  u.name,
  u.email,
  u.company_id,
  u.created_at
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.email = 'victor1rotaru@gmail.com'
  AND c.id IS NULL;

-- Show recent registrations to compare
SELECT 'Recent successful registrations (for comparison):' as section;
SELECT 
  u.name,
  u.email,
  u.role,
  u.created_at,
  c.name as company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.created_at > NOW() - INTERVAL '24 hours'
ORDER BY u.created_at DESC
LIMIT 5;
