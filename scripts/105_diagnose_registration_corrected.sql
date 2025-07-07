-- Check the registration for office@aden.md with correct column references
SELECT 
  'Auth Users' as table_name,
  id::text as id,
  email,
  email_confirmed_at::text as confirmed_at,
  created_at::text as created_at,
  COALESCE(raw_user_meta_data->>'name', 'N/A') as name,
  'N/A' as company_name
FROM auth.users 
WHERE email = 'office@aden.md'

UNION ALL

SELECT 
  'Users Table' as table_name,
  id::text as id,
  email,
  'N/A' as confirmed_at,
  created_at::text as created_at,
  COALESCE(name, 'N/A') as name,
  'N/A' as company_name
FROM users 
WHERE email = 'office@aden.md'

UNION ALL

SELECT 
  'Companies Table' as table_name,
  id::text as id,
  COALESCE(email, 'N/A') as email,
  'N/A' as confirmed_at,
  created_at::text as created_at,
  COALESCE(name, 'N/A') as name,
  COALESCE(name, 'N/A') as company_name
FROM companies 
WHERE email = 'office@aden.md'

ORDER BY table_name;

-- Separate query to check company-user relationships
SELECT 
  'Company-User Relationship' as check_type,
  c.id::text as company_id,
  c.name as company_name,
  c.email as company_email,
  u.id::text as user_id,
  u.name as user_name,
  u.email as user_email
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
WHERE c.email = 'office@aden.md' OR u.email = 'office@aden.md';

-- Check if the user exists in auth but not in users table
SELECT 
  'Missing Profile Check' as check_type,
  au.id::text as auth_user_id,
  au.email as auth_email,
  au.email_confirmed_at::text as confirmed_at,
  CASE WHEN u.id IS NULL THEN 'MISSING PROFILE' ELSE 'PROFILE EXISTS' END as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email = 'office@aden.md';

-- Check what columns actually exist in companies table
SELECT 
  'Companies Schema' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default,
  'N/A' as extra1,
  'N/A' as extra2
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
