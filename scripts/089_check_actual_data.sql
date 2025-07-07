-- Check actual data in the database
SELECT 'LOADS DATA' as section;

SELECT 
    id,
    load_number,
    reference_number,
    company_id,
    customer_id,
    status,
    created_at
FROM loads 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'CUSTOMERS DATA' as section;

SELECT 
    id,
    name,
    company_id,
    created_at
FROM customers 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'USERS DATA' as section;

SELECT 
    id,
    name,
    email,
    role,
    company_id,
    is_active
FROM users 
ORDER BY created_at DESC;

SELECT 'COMPANIES DATA' as section;

SELECT 
    id,
    name,
    created_at
FROM companies 
ORDER BY created_at DESC;

SELECT 'LOADS FOR DEMO COMPANY' as section;

SELECT 
    l.id,
    l.load_number,
    l.status,
    l.company_id,
    c.name as customer_name,
    l.created_at
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
WHERE l.company_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY l.created_at DESC;

SELECT 'SEARCH FOR SPECIFIC LOAD' as section;

SELECT 
    l.id,
    l.load_number,
    l.reference_number,
    l.status,
    l.company_id,
    c.name as customer_name
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
WHERE l.load_number = '636-0272-0525'
   OR l.reference_number = '636-0272-0525';

SELECT 'SEARCH FOR R&R CUSTOMER' as section;

SELECT 
    id,
    name,
    company_id,
    created_at
FROM customers 
WHERE name ILIKE '%R & R%' 
   OR name ILIKE '%R&R%'
   OR name ILIKE '%EXPRESS%';
