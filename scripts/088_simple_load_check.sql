-- Check if the specific load exists
SELECT 'Load Check' as check_type, id, load_number, company_id, status, created_at 
FROM loads 
WHERE id = '2d3c1957-8a3f-4b5d-b39a-0cced9237874';

-- Check if the specific customer exists
SELECT 'Customer Check' as check_type, id, name, company_id, created_at 
FROM customers 
WHERE id = 'f9c8e838-3487-482e-a129-819d3e2df523';

-- Count all loads in the system
SELECT 'Total Loads' as metric, COUNT(*) as count FROM loads;

-- Count all customers in the system
SELECT 'Total Customers' as metric, COUNT(*) as count FROM customers;

-- Count loads for our specific company
SELECT 'Company Loads' as metric, COUNT(*) as count 
FROM loads 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440000';

-- Count customers for our specific company
SELECT 'Company Customers' as metric, COUNT(*) as count 
FROM customers 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440000';

-- Show recent loads (last 5)
SELECT 'Recent Loads' as data_type, id, load_number, company_id, status, created_at 
FROM loads 
ORDER BY created_at DESC 
LIMIT 5;

-- Show recent customers (last 5)
SELECT 'Recent Customers' as data_type, id, name, company_id, created_at 
FROM customers 
ORDER BY created_at DESC 
LIMIT 5;

-- Check for loads with similar number
SELECT 'Load Number Search' as search_type, id, load_number, company_id, status 
FROM loads 
WHERE load_number LIKE '%636-0272-0525%';

-- Check for customers with similar name
SELECT 'Customer Name Search' as search_type, id, name, company_id 
FROM customers 
WHERE name ILIKE '%R & R EXPRESS%';

-- Check table existence and row counts
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
       pg_total_relation_size(t.table_name) as table_size_bytes,
       (SELECT COUNT(*) FROM (SELECT 1 FROM t.table_name LIMIT 10) s) as has_rows
FROM (
    VALUES ('loads'), ('customers'), ('users'), ('companies'), ('drivers')
) as t(table_name);
