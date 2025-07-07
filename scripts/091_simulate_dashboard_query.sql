SELECT 
    'Dashboard Load Query Results' as query_type,
    l.*,
    c.name as customer_name,
    c.id as customer_id
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
    AND l.status IN ('new', 'assigned', 'accepted', 'in_progress')
ORDER BY l.created_at DESC;

-- Also check what the useLoads hook should fetch
SELECT 
    'useLoads Hook Simulation' as query_type,
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
    l.miles,
    l.created_at,
    l.updated_at,
    c.name as customer_name
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY l.created_at DESC;
</sql>
