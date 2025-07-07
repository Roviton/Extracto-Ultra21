-- Cleanup script for victor1rotaru@gmail.com and system verification
-- This ensures a clean slate for re-registration

-- Step 1: Clean up any remaining references to victor1rotaru@gmail.com
DELETE FROM users WHERE email = 'victor1rotaru@gmail.com';
DELETE FROM companies WHERE email = 'victor1rotaru@gmail.com';

-- Step 2: Verify cleanup was successful
SELECT 'Checking for remaining victor1rotaru@gmail.com records...' as status;

SELECT 'Users table:' as table_name, COUNT(*) as remaining_records 
FROM users WHERE email = 'victor1rotaru@gmail.com'
UNION ALL
SELECT 'Companies table:' as table_name, COUNT(*) as remaining_records 
FROM companies WHERE email = 'victor1rotaru@gmail.com';

-- Step 3: Verify registration system tables are properly structured
SELECT 'Verifying companies table structure...' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;

SELECT 'Verifying users table structure...' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 4: Test that we can insert a sample company and user (then delete them)
INSERT INTO companies (
  id,
  name,
  address,
  phone,
  email,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Test Company Registration',
  '123 Test Street, Test City, TX 12345',
  '+1-555-TEST-123',
  'test-registration@example.com',
  NOW(),
  NOW()
) RETURNING id, name, email;

-- Get the company ID for the test user
WITH test_company AS (
  SELECT id FROM companies WHERE email = 'test-registration@example.com'
)
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
  gen_random_uuid(),
  tc.id,
  'test-registration@example.com',
  'Test User',
  'admin',
  '+1-555-TEST-123',
  true,
  NOW(),
  NOW()
FROM test_company tc
RETURNING id, name, email, role;

-- Verify the test records were created
SELECT 'Test records created successfully:' as status;
SELECT 
  u.name as user_name,
  u.email as user_email,
  u.role,
  c.name as company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.email = 'test-registration@example.com';

-- Clean up test records
DELETE FROM users WHERE email = 'test-registration@example.com';
DELETE FROM companies WHERE email = 'test-registration@example.com';

SELECT 'Test cleanup completed. System ready for registration.' as status;

-- Step 5: Show recent successful registrations to verify system is working
SELECT 'Recent successful registrations (last 10):' as status;
SELECT 
  u.name,
  u.email,
  u.role,
  u.created_at,
  c.name as company_name
FROM users u
JOIN companies c ON u.company_id = c.id
ORDER BY u.created_at DESC
LIMIT 10;
