-- Test the exact query that the frontend is making
-- This simulates the Supabase client query from the React app

SELECT 'Testing exact frontend query structure...' as step;

-- Test 1: Basic loads query (what the frontend starts with)
SELECT 'Test 1: Basic loads query' as test;
SELECT COUNT(*) as load_count
FROM loads 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440000';

-- Test 2: Query with customer join (like frontend)
SELECT 'Test 2: Query with customer join' as test;
SELECT 
    l.id,
    l.load_number,
    l.status,
    c.name as customer_name
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
LIMIT 5;

-- Test 3: Query with load_drivers join (like frontend)
SELECT 'Test 3: Query with load_drivers join' as test;
SELECT 
    l.id,
    l.load_number,
    l.status,
    ld.driver_id
FROM loads l
LEFT JOIN load_drivers ld ON l.id = ld.load_id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
LIMIT 5;

-- Test 4: Complete query (exactly like frontend)
SELECT 'Test 4: Complete frontend query' as test;
SELECT 
    l.*,
    c.name as customer_name,
    c.email as customer_email,
    ld.driver_id,
    d.name as driver_name
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
LEFT JOIN load_drivers ld ON l.id = ld.load_id
LEFT JOIN drivers d ON ld.driver_id = d.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
AND l.status IN ('new', 'assigned', 'accepted', 'in_progress')
ORDER BY l.created_at DESC
LIMIT 10;

-- Test 5: Check if we have any active loads at all
SELECT 'Test 5: All active loads regardless of company' as test;
SELECT 
    id,
    company_id,
    load_number,
    status,
    created_at
FROM loads 
WHERE status IN ('new', 'assigned', 'accepted', 'in_progress')
ORDER BY created_at DESC
LIMIT 10;

-- Test 6: Check RLS is working properly
SELECT 'Test 6: RLS status check' as test;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('loads', 'customers', 'drivers', 'load_drivers')
AND schemaname = 'public';

SELECT 'Frontend query testing complete.' as result;
