-- Ensure the default company exists for demo users
INSERT INTO companies (
    id,
    name,
    dot_number,
    mc_number,
    address,
    city,
    state,
    zip_code,
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

-- Verify the company was created/updated
SELECT 
    id,
    name,
    dot_number,
    mc_number,
    is_active,
    created_at
FROM companies 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Also check if there are any users without valid company_id
SELECT 
    u.id,
    u.email,
    u.company_id,
    c.name as company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.company_id IS NULL OR c.id IS NULL;
