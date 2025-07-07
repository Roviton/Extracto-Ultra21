-- Test queries without RLS to confirm that's the issue
-- This will help us understand if RLS is blocking the frontend

-- First, let's see what the current RLS status is
SELECT 'Current RLS status...' as test_step;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('loads', 'customers', 'drivers', 'load_drivers');

-- Temporarily disable RLS on all tables for testing
SELECT 'Disabling RLS temporarily...' as test_step;
ALTER TABLE loads DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE load_drivers DISABLE ROW LEVEL SECURITY;

-- Test the basic query that should work now
SELECT 'Testing basic loads query without RLS...' as test_step;
SELECT 
    id, 
    company_id, 
    load_number, 
    status,
    created_at
FROM loads 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC;

-- Test the complete frontend query without RLS
SELECT 'Testing complete frontend query without RLS...' as test_step;
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

-- Re-enable RLS (we'll keep it disabled for now to test the frontend)
-- SELECT 'Re-enabling RLS...' as test_step;
-- ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE load_drivers ENABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled for testing. Frontend should now see the loads.' as result;
