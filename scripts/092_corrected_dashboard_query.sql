-- Dashboard Load Query Results (corrected column names)
SELECT 
    'Dashboard Load Query Results' as query_type,
    l.id,
    l.load_number,
    l.reference_number,
    l.status,
    l.pickup_city,
    l.pickup_state,
    l.delivery_city,
    l.delivery_state,
    l.pickup_date,
    l.delivery_date,
    l.rate,
    l.distance,
    l.mileage,
    l.rpm,
    l.created_at,
    l.updated_at,
    c.name as customer_name,
    c.id as customer_id
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
    AND l.status IN ('new', 'assigned', 'accepted', 'in_progress')
ORDER BY l.created_at DESC;

-- Show ALL loads for this company (regardless of status)
SELECT 
    'All Loads for Company' as query_type,
    l.id,
    l.load_number,
    l.status,
    l.pickup_city || ', ' || l.pickup_state as origin,
    l.delivery_city || ', ' || l.delivery_state as destination,
    l.pickup_date,
    l.delivery_date,
    l.rate,
    l.created_at,
    c.name as customer_name
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY l.created_at DESC;

-- Check if there are any loads with different statuses
SELECT 
    'Load Status Distribution' as query_type,
    status,
    COUNT(*) as count
FROM loads 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY status;
</sql>
