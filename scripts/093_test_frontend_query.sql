-- Test the exact query structure that the frontend useLoads hook is using
-- This simulates the Supabase query with all the joins

-- First, let's test a simple load query
SELECT 'Simple load query' as test_type, count(*) as count
FROM loads 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440000';

-- Test load with customer join
SELECT 'Load with customer join' as test_type, count(*) as count
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000';

-- Test if load_drivers table exists and has data
SELECT 'Load drivers table check' as test_type, count(*) as count
FROM information_schema.tables 
WHERE table_name = 'load_drivers';

-- Test if the load has any driver assignments
SELECT 'Driver assignments for our load' as test_type, count(*) as count
FROM load_drivers ld
WHERE ld.load_id = '2d3c1957-8a3f-4b5d-b39a-0cced9237874';

-- Test the full complex query similar to frontend
SELECT 
    'Full frontend simulation' as test_type,
    l.id,
    l.load_number,
    l.status,
    l.company_id,
    c.name as customer_name,
    l.created_at
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
LEFT JOIN load_drivers ld ON l.id = ld.load_id
LEFT JOIN drivers d ON ld.driver_id = d.id
LEFT JOIN users u ON l.assigned_by = u.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY l.id, l.load_number, l.status, l.company_id, c.name, l.created_at
ORDER BY l.created_at DESC;

-- Check if assigned_by column has valid user references
SELECT 'Assigned by check' as test_type, l.assigned_by, u.name as assigned_by_name
FROM loads l
LEFT JOIN users u ON l.assigned_by = u.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000';
