-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table (multi-tenant)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    mc_number VARCHAR(50),
    dot_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (Admin and Dispatchers)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'dispatcher')),
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment types for partial load logic
CREATE TABLE IF NOT EXISTS equipment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    supports_partial_loads BOOLEAN DEFAULT false,
    max_weight INTEGER,
    max_volume INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    license_number VARCHAR(100),
    license_type VARCHAR(50),
    license_expiry DATE,
    equipment_type_id UUID REFERENCES equipment_types(id),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'booked')),
    telegram_user_id VARCHAR(100),
    telegram_username VARCHAR(100),
    avatar_url TEXT,
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers/Brokers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    payment_terms INTEGER DEFAULT 30, -- days
    credit_limit DECIMAL(12,2),
    preferred_rate DECIMAL(8,2), -- per mile
    contract_start_date DATE,
    contract_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create load_status ENUM type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'load_status') THEN
        CREATE TYPE public.load_status AS ENUM (
            'new',
            'assigned',
            'accepted',
            'refused',
            'in_progress',
            'completed',
            'cancelled'
        );
    END IF;
END$$;

-- Loads table (core entity)
CREATE TABLE IF NOT EXISTS loads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    load_number VARCHAR(100) NOT NULL,
    reference_number VARCHAR(100),
    customer_id UUID NOT NULL REFERENCES customers(id),
    dispatcher_id UUID NOT NULL REFERENCES users(id),
    
    -- Pickup information
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100) NOT NULL,
    pickup_state VARCHAR(50) NOT NULL,
    pickup_zip VARCHAR(20),
    pickup_date DATE NOT NULL,
    pickup_time TIME,
    pickup_contact_name VARCHAR(255),
    pickup_contact_phone VARCHAR(50),
    pickup_instructions TEXT,
    
    -- Delivery information
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_state VARCHAR(50) NOT NULL,
    delivery_zip VARCHAR(20),
    delivery_date DATE NOT NULL,
    delivery_time TIME,
    delivery_contact_name VARCHAR(255),
    delivery_contact_phone VARCHAR(50),
    delivery_instructions TEXT,
    
    -- Load details
    commodity VARCHAR(255),
    weight INTEGER, -- in pounds
    pieces INTEGER,
    dimensions VARCHAR(100),
    equipment_type_id UUID REFERENCES equipment_types(id),
    rate DECIMAL(10,2) NOT NULL,
    distance INTEGER, -- in miles
    rpm DECIMAL(5,2), -- calculated rate per mile
    
    -- Vehicle information (for car hauling)
    vin VARCHAR(50),
    vehicle_year INTEGER,
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    
    -- Status and tracking
    status public.load_status DEFAULT 'new', -- Use the ENUM type
    is_partial_load BOOLEAN DEFAULT false,
    parent_load_id UUID REFERENCES loads(id), -- for partial loads
    
    -- Special requirements
    is_hazmat BOOLEAN DEFAULT false,
    temperature_controlled BOOLEAN DEFAULT false,
    temperature_range VARCHAR(50),
    
    -- Additional information
    special_instructions TEXT,
    dispatcher_notes TEXT,
    manager_comments TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(company_id, load_number)
);

-- Load-Driver assignments (many-to-many for team driving)
CREATE TABLE IF NOT EXISTS load_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID NOT NULL REFERENCES users(id),
    
    UNIQUE(load_id, driver_id)
);

-- Load status history (audit trail)
CREATE TABLE IF NOT EXISTS load_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    old_status public.load_status, -- Use the ENUM type
    new_status public.load_status NOT NULL, -- Use the ENUM type
    changed_by UUID NOT NULL REFERENCES users(id),
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Load timeline events
CREATE TABLE IF NOT EXISTS load_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'arrived_pickup', 'departed_pickup', 'arrived_delivery', 'delivered'
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    driver_id UUID REFERENCES drivers(id),
    location TEXT,
    notes TEXT,
    source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'telegram', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communications table (AI emails, Telegram messages)
CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    load_id UUID REFERENCES loads(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id),
    customer_id UUID REFERENCES customers(id),
    user_id UUID REFERENCES users(id),
    
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'telegram', 'sms')),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    
    -- Email specific
    from_email VARCHAR(255),
    to_email VARCHAR(255),
    cc_email VARCHAR(255),
    
    -- Telegram specific
    telegram_message_id VARCHAR(100),
    telegram_chat_id VARCHAR(100),
    
    -- AI generation info
    is_ai_generated BOOLEAN DEFAULT false,
    ai_model VARCHAR(50),
    ai_prompt_tokens INTEGER,
    ai_completion_tokens INTEGER,
    
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer payments tracking
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    load_id UUID REFERENCES loads(id),
    
    invoice_number VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI usage tracking
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    operation_type VARCHAR(50) NOT NULL, -- 'ocr_extraction', 'email_generation', 'driver_instructions'
    ai_provider VARCHAR(20) NOT NULL, -- 'openai', 'anthropic'
    model_name VARCHAR(50) NOT NULL,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    cost_estimate DECIMAL(8,4),
    
    load_id UUID REFERENCES loads(id),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OCR extracted data
CREATE TABLE IF NOT EXISTS ocr_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    
    -- Original extraction metadata
    extraction_method VARCHAR(20) NOT NULL, -- 'claude-vision', 'openai-vision', 'sample-fallback'
    ai_model VARCHAR(50),
    confidence_score DECIMAL(3,2),
    
    -- Cleaned extracted data (JSON format)
    extracted_data JSONB NOT NULL,
    
    -- Processing info
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
