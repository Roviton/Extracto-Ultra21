-- Real-time monitoring script for registration process
-- Run this in a separate query window while testing registration

-- Monitor new companies being created
SELECT 'Monitoring new companies (refresh to see updates)...' as status;
SELECT 
  id,
  name,
  email,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at)) as seconds_ago
FROM companies 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Monitor new users being created
SELECT 'Monitoring new users (refresh to see updates)...' as status;
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.created_at,
  c.name as company_name,
  EXTRACT(EPOCH FROM (NOW() - u.created_at)) as seconds_ago
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.created_at > NOW() - INTERVAL '1 hour'
ORDER BY u.created_at DESC;

-- Check for incomplete registrations in the last hour
SELECT 'Checking for incomplete registrations...' as status;
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.email as company_email,
  c.created_at,
  CASE 
    WHEN u.id IS NULL THEN '❌ Missing user profile'
    ELSE '✅ Complete'
  END as status
FROM companies c
LEFT JOIN users u ON c.id = u.company_id AND u.role = 'admin'
WHERE c.created_at > NOW() - INTERVAL '1 hour'
ORDER BY c.created_at DESC;
