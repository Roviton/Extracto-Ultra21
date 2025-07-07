-- Ensure we have at least one company
INSERT INTO companies (id, name, address, city, state, zip, phone, email, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Sample Freight Company',
  '123 Main St',
  'Sample City',
  'TX',
  '12345',
  '555-0123',
  'contact@samplefreight.com',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Ensure we have at least one equipment type
INSERT INTO equipment_types (id, name, description, company_id, supports_partial_loads, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Dry Van',
  'Standard dry van trailer',
  c.id,
  false,
  NOW(),
  NOW()
FROM companies c
LIMIT 1
ON CONFLICT DO NOTHING;

-- Ensure we have at least one user
INSERT INTO users (id, name, email, role, company_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Sample Dispatcher',
  'dispatcher@samplefreight.com',
  'dispatcher',
  c.id,
  NOW(),
  NOW()
FROM companies c
LIMIT 1
ON CONFLICT DO NOTHING;

-- Ensure we have at least one customer
INSERT INTO customers (id, name, company_id, contact_name, email, phone, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Sample Customer',
  c.id,
  'John Doe',
  'john@samplecustomer.com',
  '555-0456',
  NOW(),
  NOW()
FROM companies c
LIMIT 1
ON CONFLICT DO NOTHING;
