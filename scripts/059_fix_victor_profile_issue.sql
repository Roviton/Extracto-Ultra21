-- Fix the profile issue for victor1rotaru@gmail.com
-- This script will create the missing user profile if the company exists

DO $$
DECLARE
  company_record RECORD;
  user_exists BOOLEAN;
BEGIN
  -- Check if company exists
  SELECT * INTO company_record 
  FROM companies 
  WHERE email = 'victor1rotaru@gmail.com';
  
  IF company_record.id IS NULL THEN
    RAISE NOTICE '❌ No company found for victor1rotaru@gmail.com';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Company found: % (ID: %)', company_record.name, company_record.id;
  
  -- Check if user profile exists
  SELECT EXISTS(
    SELECT 1 FROM users 
    WHERE email = 'victor1rotaru@gmail.com'
  ) INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE '✅ User profile already exists for victor1rotaru@gmail.com';
    
    -- Check if user is properly linked to company
    UPDATE users 
    SET company_id = company_record.id,
        is_active = true,
        updated_at = NOW()
    WHERE email = 'victor1rotaru@gmail.com' 
      AND (company_id IS NULL OR company_id != company_record.id OR is_active = false);
    
    IF FOUND THEN
      RAISE NOTICE '✅ Updated user profile with correct company_id and active status';
    END IF;
  ELSE
    RAISE NOTICE '❌ User profile missing - this needs to be created manually';
    RAISE NOTICE 'Company ID: %', company_record.id;
    RAISE NOTICE 'Company Name: %', company_record.name;
    RAISE NOTICE 'Email: %', company_record.email;
    
    -- We cannot create the user profile here because we need the Supabase Auth user ID
    -- This needs to be done through the application or manually with the correct Auth ID
  END IF;
END $$;

-- Show the current state after any fixes
SELECT 'Final State Check:' as status;
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.email as company_email,
  u.id as user_id,
  u.name as user_name,
  u.role,
  u.is_active,
  CASE 
    WHEN u.id IS NULL THEN '❌ Missing user profile'
    WHEN u.company_id != c.id THEN '❌ Wrong company_id'
    WHEN u.is_active = false THEN '❌ User inactive'
    ELSE '✅ Complete'
  END as status
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
WHERE c.email = 'victor1rotaru@gmail.com';
