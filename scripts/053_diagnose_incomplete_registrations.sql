-- Diagnostic script to identify incomplete registrations
-- This helps identify users who have Supabase Auth accounts but missing profiles

-- Check for companies without corresponding admin users
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.email as company_email,
  c.created_at,
  u.id as user_id,
  u.name as user_name,
  u.role
FROM companies c
LEFT JOIN users u ON c.id = u.company_id AND u.role = 'admin'
WHERE u.id IS NULL
ORDER BY c.created_at DESC;

-- Check for recent companies (last 7 days) that might have incomplete setups
SELECT 
  c.*,
  COUNT(u.id) as user_count
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
WHERE c.created_at > NOW() - INTERVAL '7 days'
GROUP BY c.id, c.name, c.email, c.created_at, c.updated_at, c.address, c.phone, c.dot_number, c.mc_number
ORDER BY c.created_at DESC;

-- Show all users and their company associations
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.is_active,
  u.created_at,
  c.name as company_name,
  c.id as company_id
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
ORDER BY u.created_at DESC
LIMIT 20;
