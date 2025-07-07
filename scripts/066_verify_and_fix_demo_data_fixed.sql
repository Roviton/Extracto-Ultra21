-- Check current state of companies table
SELECT 'Companies' as table_name, COUNT(*) as count FROM companies;

-- Check current state of users table and their company associations
SELECT 
    'Users with valid companies' as description,
    COUNT(*) as count
FROM users u
INNER JOIN companies c ON u.company_id = c.id;

-- Check users with invalid company references
SELECT 
    'Users with invalid companies' as description,
    COUNT(*) as count
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE c.id IS NULL;

-- Show users with invalid company references (limit to avoid too much output)
SELECT 
    u.id,
    u.email,
    u.company_id,
    'Missing company' as issue
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE c.id IS NULL
LIMIT 5;

-- Ensure the demo company exists with correct column names
INSERT INTO companies (
    id,
    name,
    dot_number,
    mc_number,
    address,
    city,
    state,
    postal_code,
    phone,
    email,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Demo Transportation Company',
    '12345678',
    'MC-123456',
    '123 Demo Street',
    'Demo City',
    'TX',
    '75001',
    '(555) 123-4567',
    'admin@demo-transport.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- Verify the fix worked
SELECT 
    'After fix - Users with valid companies' as description,
    COUNT(*) as count
FROM users u
INNER JOIN companies c ON u.company_id = c.id;

-- Show final state
SELECT 
    c.id,
    c.name,
    c.is_active,
    COUNT(u.id) as user_count
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
GROUP BY c.id, c.name, c.is_active
ORDER BY c.name;
