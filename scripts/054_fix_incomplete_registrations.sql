-- Script to manually fix incomplete registrations
-- Use this if you find users who have companies but no user profiles

-- Example: Create missing user profile for a specific company
-- Replace the values below with actual data from your investigation

/*
-- Template for creating missing user profile:
INSERT INTO users (
  id, -- This should be the Supabase Auth user ID
  company_id,
  email,
  name,
  role,
  phone,
  is_active,
  created_at,
  updated_at
) VALUES (
  'auth-user-id-here', -- Get this from Supabase Auth dashboard
  'company-id-here',   -- Get this from companies table
  'user@example.com',
  'User Name',
  'admin',
  '+1234567890',
  true,
  NOW(),
  NOW()
);
*/

-- Check if the fix worked
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  c.name as company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.email = 'your-email-here@example.com';
