SELECT 
    'Checking for specific load ID' as check_type,
    id,
    load_number,
    status,
    company_id,
    customer_id,
    created_at
FROM loads 
WHERE id = '2d3c1957-8a3f-4b5d-b39a-0cced9237874';

SELECT 
    'All loads for demo company' as check_type,
    id,
    load_number,
    status,
    company_id,
    customer_id,
    created_at
FROM loads 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC
LIMIT 10;

SELECT 
    'Load with number 636-0272-0525' as check_type,
    id,
    load_number,
    status,
    company_id,
    customer_id,
    created_at
FROM loads 
WHERE load_number = '636-0272-0525';

SELECT 
    'All loads (any company)' as check_type,
    id,
    load_number,
    status,
    company_id,
    customer_id,
    created_at
FROM loads 
ORDER BY created_at DESC
LIMIT 5;

SELECT 
    'Load status distribution' as check_type,
    status,
    COUNT(*) as count
FROM loads 
GROUP BY status;

SELECT 
    'Dashboard query simulation' as check_type,
    l.id,
    l.load_number,
    l.status,
    l.company_id,
    c.name as customer_name,
    l.created_at
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
  AND l.status NOT IN ('delivered', 'cancelled', 'archived')
ORDER BY l.created_at DESC;
