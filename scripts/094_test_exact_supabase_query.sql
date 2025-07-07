-- Test the exact query structure that the frontend is using
-- This will help us identify where the Supabase query is failing

-- First, let's test the basic loads query without joins
SELECT 'Testing basic loads query...' as test_step;
SELECT 
    id, 
    company_id, 
    load_number, 
    status,
    created_at
FROM loads 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC;

-- Test if customers table exists and has data
SELECT 'Testing customers table...' as test_step;
SELECT COUNT(*) as customer_count FROM customers;
SELECT * FROM customers LIMIT 3;

-- Test if load_drivers table exists
SELECT 'Testing load_drivers table...' as test_step;
SELECT COUNT(*) as load_drivers_count FROM load_drivers;

-- Test the customer join specifically
SELECT 'Testing loads with customer join...' as test_step;
SELECT 
    l.id,
    l.load_number,
    l.company_id,
    l.customer_id,
    c.name as customer_name
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000';

-- Test the load_drivers join specifically
SELECT 'Testing loads with load_drivers join...' as test_step;
SELECT 
    l.id,
    l.load_number,
    ld.driver_id,
    d.name as driver_name
FROM loads l
LEFT JOIN load_drivers ld ON l.id = ld.load_id
LEFT JOIN drivers d ON ld.driver_id = d.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000';

-- Test the complete query as used by the frontend
SELECT 'Testing complete frontend query...' as test_step;
SELECT 
    l.*,
    row_to_json(c.*) as customer,
    COALESCE(
        json_agg(
            json_build_object(
                'id', ld.id,
                'driver_id', ld.driver_id,
                'status', ld.status,
                'is_primary', ld.is_primary,
                'driver', row_to_json(d.*)
            )
        ) FILTER (WHERE ld.id IS NOT NULL),
        '[]'::json
    ) as load_drivers
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
LEFT JOIN load_drivers ld ON l.id = ld.load_id
LEFT JOIN drivers d ON ld.driver_id = d.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY l.id, c.id
ORDER BY l.created_at DESC;

-- Check if there are any RLS policies blocking the query
SELECT 'Checking RLS policies...' as test_step;
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrls
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('loads', 'customers', 'drivers', 'load_drivers');

-- Check current user and role
SELECT 'Current user context...' as test_step;
SELECT 
    current_user,
    session_user,
    current_setting('role') as current_role;
