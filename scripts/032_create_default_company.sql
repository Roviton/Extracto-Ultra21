-- Create a default company with proper UUID for testing
INSERT INTO companies (id, name, address, city, state, zip, phone, email, mc_number, dot_number)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Default Transport Company',
  '123 Main Street',
  'Los Angeles',
  'CA',
  '90210',
  '(555) 123-4567',
  'contact@defaulttransport.com',
  'MC123456',
  'DOT789012'
) ON CONFLICT (id) DO NOTHING;

-- Create a default user for testing with password hash
INSERT INTO users (id, company_id, email, password_hash, name, role, is_active)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@defaulttransport.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for "password"
  'Default Admin',
  'admin',
  true
) ON CONFLICT (id) DO NOTHING;
