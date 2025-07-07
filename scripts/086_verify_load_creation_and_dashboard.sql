-- Verify the load was created and check dashboard data structure
DO $$
DECLARE
    load_count INTEGER;
    customer_count INTEGER;
    rec RECORD;
BEGIN
    -- Check if the load exists
    SELECT COUNT(*) INTO load_count 
    FROM loads 
    WHERE company_id = '550e8400-e29b-41d4-a716-446655440000';
    
    RAISE NOTICE 'Total loads for company: %', load_count;
    
    -- Check if the customer exists
    SELECT COUNT(*) INTO customer_count 
    FROM customers 
    WHERE company_id = '550e8400-e29b-41d4-a716-446655440000';
    
    RAISE NOTICE 'Total customers for company: %', customer_count;
    
    -- Show the most recent load details
    FOR rec IN 
        SELECT 
            l.id,
            l.load_number,
            l.reference_number,
            l.status,
            l.company_id,
            l.customer_id,
            c.name as customer_name,
            l.created_at
        FROM loads l
        LEFT JOIN customers c ON l.customer_id = c.id
        WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
        ORDER BY l.created_at DESC
        LIMIT 3
    LOOP
        RAISE NOTICE 'Load: % | Number: % | Status: % | Customer: % | Created: %', 
            rec.id, rec.load_number, rec.status, rec.customer_name, rec.created_at;
    END LOOP;
    
    -- Check what the dashboard query would return
    RAISE NOTICE '--- Dashboard Query Simulation ---';
    FOR rec IN 
        SELECT 
            l.*,
            c.name as customer_name,
            CASE 
                WHEN l.status IN ('new', 'assigned', 'accepted', 'in_progress') THEN 'active'
                WHEN l.status IN ('completed', 'cancelled', 'archived') THEN 'history'
                ELSE 'other'
            END as view_mode
        FROM loads l
        LEFT JOIN customers c ON l.customer_id = c.id
        WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
        AND l.status IN ('new', 'assigned', 'accepted', 'in_progress')
        ORDER BY l.created_at DESC
        LIMIT 5
    LOOP
        RAISE NOTICE 'Active Load: % | Status: % | Customer: %', 
            rec.load_number, rec.status, rec.customer_name;
    END LOOP;
    
END $$;
