-- Create the missing user profile for victor1rotaru@gmail.com
-- We have the Supabase Auth ID from the console logs: 526c6f91-10bc-4af2-830d-7829d9423476

-- First, let's verify the company exists
SELECT 'Company check:' as step;
SELECT 
  id,
  name,
  email,
  created_at
FROM companies 
WHERE email = 'victor1rotaru@gmail.com';

-- Now create the missing user profile
SELECT 'Creating user profile:' as step;

-- Insert the user profile with the exact Supabase Auth ID from the logs
INSERT INTO users (
  id,
  company_id,
  email,
  name,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT 
  '526c6f91-10bc-4af2-830d-7829d9423476'::uuid as id,  -- From console logs
  c.id as company_id,
  'victor1rotaru@gmail.com' as email,
  'Victor Rotaru' as name,  -- Assuming name from email
  'admin' as role,
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM companies c
WHERE c.email = 'victor1rotaru@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the user profile was created
SELECT 'Verification:' as step;
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.company_id,
  u.is_active,
  c.name as company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.id = '526c6f91-10bc-4af2-830d-7829d9423476';

-- Final check - simulate the login query
SELECT 'Login query simulation:' as step;
SELECT 
  u.id, 
  u.name, 
  u.email, 
  u.role, 
  u.company_id, 
  u.phone, 
  u.avatar_url, 
  u.is_active,
  json_build_object(
    'id', c.id,
    'name', c.name,
    'dot_number', c.dot_number,
    'mc_number', c.mc_number
  ) as companies
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.id = '526c6f91-10bc-4af2-830d-7829d9423476';
