-- Check the registration for office@aden.md
SELECT 
  'Auth Users' as table_name,
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'office@aden.md'

UNION ALL

SELECT 
  'Users Table' as table_name,
  id::text,
  email,
  created_at::text,
  name
FROM users 
WHERE email = 'office@aden.md'

UNION ALL

SELECT 
  'Companies Table' as table_name,
  id::text,
  name,
  created_at::text,
  email
FROM companies 
WHERE email = 'office@aden.md'
ORDER BY table_name;

-- Check if there are any companies without users
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.email as company_email,
  u.id as user_id,
  u.name as user_name,
  u.email as user_email
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
WHERE c.email = 'office@aden.md';
