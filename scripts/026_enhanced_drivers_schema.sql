-- Enhanced Drivers Schema
-- This script creates comprehensive driver management tables

-- Create enhanced drivers table if it doesn't exist
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    hire_date DATE,
    driver_type VARCHAR(20) DEFAULT 'company' CHECK (driver_type IN ('company', 'owner_operator', 'lease_operator')),
    status VARCHAR(20) DEFAULT 'off_duty' CHECK (status IN ('available', 'on_duty', 'off_duty', 'on_break')),
    license_number VARCHAR(50),
    license_state VARCHAR(2),
    license_expiration DATE,
    equipment_preferences TEXT[], -- Array of equipment types
    fuel_card_number VARCHAR(50),
    truck_number VARCHAR(20),
    trailer_number VARCHAR(20),
    co_driver_id UUID REFERENCES drivers(id),
    notes TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create driver performance tracking table
CREATE TABLE IF NOT EXISTS driver_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    total_miles INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_loads INTEGER DEFAULT 0,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0,
    load_acceptance_rate DECIMAL(5,2) DEFAULT 0,
    average_rpm DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(driver_id)
);

-- Create driver messaging preferences table
CREATE TABLE IF NOT EXISTS driver_messaging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    telegram_enabled BOOLEAN DEFAULT false,
    whatsapp_enabled BOOLEAN DEFAULT false,
    sms_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    telegram_chat_id VARCHAR(100),
    whatsapp_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(driver_id)
);

-- Create driver documents table
CREATE TABLE IF NOT EXISTS driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'cdl', 'medical_card', 'drug_test', 'mvr', 'ssn_card', 
        'employment_verification', 'application', 'insurance', 'other'
    )),
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT,
    blob_url TEXT,
    issue_date DATE,
    expiration_date DATE,
    document_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_company_id ON drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);
CREATE INDEX IF NOT EXISTS idx_driver_performance_driver_id ON driver_performance(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_messaging_driver_id ON driver_messaging(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_type ON driver_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_driver_documents_expiration ON driver_documents(expiration_date);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_driver_performance_updated_at ON driver_performance;
CREATE TRIGGER update_driver_performance_updated_at
    BEFORE UPDATE ON driver_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_driver_messaging_updated_at ON driver_messaging;
CREATE TRIGGER update_driver_messaging_updated_at
    BEFORE UPDATE ON driver_messaging
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_driver_documents_updated_at ON driver_documents;
CREATE TRIGGER update_driver_documents_updated_at
    BEFORE UPDATE ON driver_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample drivers if the table is empty
INSERT INTO drivers (
    first_name, last_name, email, phone, city, state, status, driver_type,
    license_number, license_state, equipment_preferences, truck_number
) 
SELECT 
    'John', 'Smith', 'john.smith@example.com', '(555) 123-4567', 
    'Los Angeles', 'CA', 'available', 'company',
    'CDL123456', 'CA', ARRAY['Dry Van', 'Refrigerated'], 'T001'
WHERE NOT EXISTS (SELECT 1 FROM drivers LIMIT 1);

INSERT INTO drivers (
    first_name, last_name, email, phone, city, state, status, driver_type,
    license_number, license_state, equipment_preferences, truck_number
) 
SELECT 
    'Sarah', 'Johnson', 'sarah.johnson@example.com', '(555) 234-5678', 
    'Phoenix', 'AZ', 'on_duty', 'owner_operator',
    'CDL789012', 'AZ', ARRAY['Flatbed'], 'T002'
WHERE (SELECT COUNT(*) FROM drivers) < 2;

-- Initialize performance records for sample drivers
INSERT INTO driver_performance (driver_id, total_miles, total_revenue, total_loads, on_time_delivery_rate, load_acceptance_rate, average_rpm)
SELECT 
    d.id, 24500, 78400, 42, 98.5, 95.0, 3.2
FROM drivers d 
WHERE d.first_name = 'John' AND d.last_name = 'Smith'
AND NOT EXISTS (SELECT 1 FROM driver_performance WHERE driver_id = d.id);

INSERT INTO driver_performance (driver_id, total_miles, total_revenue, total_loads, on_time_delivery_rate, load_acceptance_rate, average_rpm)
SELECT 
    d.id, 18700, 62300, 35, 100.0, 92.0, 3.33
FROM drivers d 
WHERE d.first_name = 'Sarah' AND d.last_name = 'Johnson'
AND NOT EXISTS (SELECT 1 FROM driver_performance WHERE driver_id = d.id);

-- Initialize messaging preferences for sample drivers
INSERT INTO driver_messaging (driver_id, telegram_enabled, whatsapp_enabled, sms_enabled, email_enabled)
SELECT d.id, true, true, true, true
FROM drivers d 
WHERE NOT EXISTS (SELECT 1 FROM driver_messaging WHERE driver_id = d.id);

COMMIT;
