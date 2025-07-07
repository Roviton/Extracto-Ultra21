-- Comprehensive verification that victor1rotaru@gmail.com can now log in

SELECT '=== VICTOR LOGIN READINESS CHECK ===' as check_section;

-- 1. Check Supabase Auth ID exists in users table
SELECT 'Auth ID Check:' as check_type;
SELECT 
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ User profile exists'
    WHEN COUNT(*) = 0 THEN '❌ User profile missing'
    ELSE '⚠️ Multiple profiles found'
  END as status,
  COUNT(*) as count
FROM users 
WHERE id = '526c6f91-10bc-4af2-830d-7829d9423476';

-- 2. Check email match
SELECT 'Email Match Check:' as check_type;
SELECT 
  CASE 
    WHEN email = 'victor1rotaru@gmail.com' THEN '✅ Email matches'
    ELSE '❌ Email mismatch: ' || email
  END as status
FROM users 
WHERE id = '526c6f91-10bc-4af2-830d-7829d9423476';

-- 3. Check company association
SELECT 'Company Association Check:' as check_type;
SELECT 
  CASE 
    WHEN u.company_id IS NOT NULL AND c.id IS NOT NULL THEN '✅ Company linked'
    WHEN u.company_id IS NULL THEN '❌ No company_id'
    ELSE '❌ Company not found'
  END as status,
  u.company_id,
  c.name as company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.id = '526c6f91-10bc-4af2-830d-7829d9423476';

-- 4. Check role and active status
SELECT 'Role and Status Check:' as check_type;
SELECT 
  CASE 
    WHEN role = 'admin' AND is_active = true THEN '✅ Admin role, active'
    WHEN role != 'admin' THEN '❌ Wrong role: ' || role
    WHEN is_active = false THEN '❌ User inactive'
    ELSE '❌ Unknown issue'
  END as status,
  role,
  is_active
FROM users 
WHERE id = '526c6f91-10bc-4af2-830d-7829d9423476';

-- 5. Simulate exact login query from auth context
SELECT 'Login Query Simulation:' as check_type;
SELECT 
  '✅ Login query will succeed' as status,
  u.id, 
  u.name, 
  u.email, 
  u.role, 
  u.company_id, 
  u.phone, 
  u.avatar_url, 
  u.is_active
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.id = '526c6f91-10bc-4af2-830d-7829d9423476';

-- 6. Final readiness summary
SELECT 'FINAL READINESS:' as check_type;
SELECT 
  CASE 
    WHEN COUNT(*) = 1 AND 
         MAX(CASE WHEN email = 'victor1rotaru@gmail.com' THEN 1 ELSE 0 END) = 1 AND
         MAX(CASE WHEN company_id IS NOT NULL THEN 1 ELSE 0 END) = 1 AND
         MAX(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) = 1 AND
         MAX(CASE WHEN is_active = true THEN 1 ELSE 0 END) = 1
    THEN '🎉 READY TO LOGIN - All checks passed!'
    ELSE '❌ Still has issues'
  END as final_status
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.id = '526c6f91-10bc-4af2-830d-7829d9423476';
