-- Comprehensive fix for victor1rotaru@gmail.com registration issue
-- This script will identify and fix the specific problem

-- Step 1: Diagnose the issue
SELECT '=== DIAGNOSIS REPORT ===' as report_section;

-- Check company
SELECT 'Company Status:' as check_type;
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ No company found'
    WHEN COUNT(*) = 1 THEN '✅ Company exists'
    ELSE '⚠️ Multiple companies found'
  END as status,
  COUNT(*) as count
FROM companies 
WHERE email = 'victor1rotaru@gmail.com';

-- Show company details if exists
SELECT 'Company Details:' as check_type;
SELECT 
  id,
  name,
  email,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_ago
FROM companies 
WHERE email = 'victor1rotaru@gmail.com';

-- Check user profile
SELECT 'User Profile Status:' as check_type;
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ No user profile found'
    WHEN COUNT(*) = 1 THEN '✅ User profile exists'
    ELSE '⚠️ Multiple user profiles found'
  END as status,
  COUNT(*) as count
FROM users 
WHERE email = 'victor1rotaru@gmail.com';

-- Show user details if exists
SELECT 'User Profile Details:' as check_type;
SELECT 
  id,
  name,
  email,
  role,
  company_id,
  is_active,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_ago
FROM users 
WHERE email = 'victor1rotaru@gmail.com';

-- Check for data consistency
SELECT 'Data Consistency Check:' as check_type;
SELECT 
  c.id as company_id,
  c.name as company_name,
  u.id as user_id,
  u.name as user_name,
  u.company_id as user_company_id,
  CASE 
    WHEN u.id IS NULL THEN '❌ Missing user profile - REGISTRATION INCOMPLETE'
    WHEN u.company_id IS NULL THEN '❌ User has no company_id'
    WHEN u.company_id != c.id THEN '❌ User linked to wrong company'
    WHEN u.is_active = false THEN '❌ User is inactive'
    WHEN u.role != 'admin' THEN '❌ User is not admin'
    ELSE '✅ Data is consistent'
  END as diagnosis
FROM companies c
LEFT JOIN users u ON c.email = u.email
WHERE c.email = 'victor1rotaru@gmail.com';

-- Step 2: Show what needs to be fixed
SELECT '=== RECOMMENDED ACTIONS ===' as report_section;

SELECT 
  CASE 
    WHEN NOT EXISTS(SELECT 1 FROM companies WHERE email = 'victor1rotaru@gmail.com') 
    THEN '1. Re-register the company - no company record found'
    WHEN NOT EXISTS(SELECT 1 FROM users WHERE email = 'victor1rotaru@gmail.com')
    THEN '2. Create user profile manually - company exists but user profile missing'
    WHEN EXISTS(
      SELECT 1 FROM users u 
      JOIN companies c ON c.email = 'victor1rotaru@gmail.com'
      WHERE u.email = 'victor1rotaru@gmail.com' 
        AND (u.company_id != c.id OR u.is_active = false OR u.role != 'admin')
    )
    THEN '3. Fix user profile data - profile exists but has wrong data'
    ELSE '4. Check Supabase Auth - database looks correct, issue might be in Auth system'
  END as recommended_action;
