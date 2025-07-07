-- Insert sample company
INSERT INTO companies (id, name, address, phone, email, mc_number, dot_number) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Forward Strong LLC', '123 Transport Ave, Dallas, TX 75201', '(555) 123-4567', 'dispatch@forwardstrong.com', 'MC-123456', 'DOT-789012');

-- Insert equipment types
INSERT INTO equipment_types (id, company_id, name, description, supports_partial_loads, max_weight) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Dry Van', 'Standard 53ft dry van trailer', false, 80000),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Car Carrier', 'Multi-car transport trailer', true, 80000),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Flatbed', '48ft flatbed trailer', false, 48000),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Reefer', 'Refrigerated trailer', false, 80000);

-- Insert sample users
INSERT INTO users (id, company_id, email, password_hash, name, role, phone) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'admin@forwardstrong.com', '$2b$10$example', 'Admin User', 'admin', '(555) 123-4567'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'dispatcher1@forwardstrong.com', '$2b$10$example', 'Sarah Johnson', 'dispatcher', '(555) 234-5678'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'dispatcher2@forwardstrong.com', '$2b$10$example', 'Mike Reynolds', 'dispatcher', '(555) 345-6789');

-- Insert sample drivers
INSERT INTO drivers (id, company_id, name, email, phone, license_number, license_type, equipment_type_id, telegram_username) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'John Smith', 'john.smith@example.com', '(555) 555-0123', 'CDL123456', 'Class A CDL', '550e8400-e29b-41d4-a716-446655440002', '@johnsmith_driver'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', 'Maria Garcia', 'maria.garcia@example.com', '(555) 555-0124', 'CDL123457', 'Class A CDL', '550e8400-e29b-41d4-a716-446655440001', '@maria_driver'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', 'Tom Davis', 'tom.davis@example.com', '(555) 555-0125', 'CDL123458', 'Class A CDL', '550e8400-e29b-41d4-a716-446655440003', '@tomdavis_driver');

-- Insert sample customers
INSERT INTO customers (id, company_id, name, contact_name, email, phone, address, city, state, zip, payment_terms, preferred_rate) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'Acme Logistics', 'Mike Johnson', 'mike@acmelogistics.com', '(555) 789-0123', '456 Logistics Blvd', 'Atlanta', 'GA', '30309', 30, 3.20),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', 'Global Transport Inc.', 'Lisa Brown', 'lisa@globaltransport.com', '(555) 890-1234', '789 Freight Ave', 'Chicago', 'IL', '60601', 45, 3.10),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', 'FastFreight Co.', 'Robert Chen', 'robert@fastfreight.com', '(555) 901-2345', '321 Shipping Lane', 'Los Angeles', 'CA', '90001', 30, 3.30);
