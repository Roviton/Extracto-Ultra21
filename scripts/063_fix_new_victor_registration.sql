-- Fix the new Victor registration with ID: 8e5eb010-5dd9-409d-ac25-7f451b750d8
-- From the JWT token in the confirmation link

-- First, check what exists
SELECT 'Current state check:' as step;

-- Check if company exists for this email
SELECT 'Company check:' as check_type, COUNT(*) as count
FROM companies WHERE email = 'victor1rotaru@gmail.com'
UNION ALL
-- Check if user profile exists for the new ID
SELECT 'User profile check:' as check_type, COUNT(*) as count
FROM users WHERE id = '8e5eb010-5dd9-409d-ac25-7f451b750d8';

-- Show existing companies for this email
SELECT 'Existing companies:' as step;
SELECT id, name, email, created_at
FROM companies 
WHERE email = 'victor1rotaru@gmail.com'
ORDER BY created_at DESC;

-- Show existing user profiles for this email
SELECT 'Existing user profiles:' as step;
SELECT id, name, email, role, company_id, created_at
FROM users 
WHERE email = 'victor1rotaru@gmail.com'
ORDER BY created_at DESC;

-- Create the missing user profile for the new registration
-- Using the latest company record
INSERT INTO users (
  id,
  company_id,
  email,
  name,
  role,
  phone,
  is_active,
  created_at,
  updated_at
)
SELECT 
  '8e5eb010-5dd9-409d-ac25-7f451b750d8'::uuid as id,  -- From JWT token
  c.id as company_id,
  'victor1rotaru@gmail.com' as email,
  'Vic trou' as name,  -- From JWT token user_metadata
  'admin' as role,
  '+232323232323' as phone,  -- From JWT token user_metadata
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM companies c
WHERE c.email = 'victor1rotaru@gmail.com'
ORDER BY c.created_at DESC
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the fix
SELECT 'Final verification:' as step;
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.phone,
  u.company_id,
  u.is_active,
  c.name as company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.id = '8e5eb010-5dd9-409d-ac25-7f451b750d8';
