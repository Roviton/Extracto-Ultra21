-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Companies policies
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (id = get_user_company_id());

CREATE POLICY "Admins can update their company" ON companies
    FOR UPDATE USING (id = get_user_company_id() AND is_admin());

-- Users policies
CREATE POLICY "Users can view users in their company" ON users
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage users in their company" ON users
    FOR ALL USING (company_id = get_user_company_id() AND is_admin());

-- Drivers policies
CREATE POLICY "Users can view drivers in their company" ON drivers
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can update drivers in their company" ON drivers
    FOR UPDATE USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage drivers in their company" ON drivers
    FOR ALL USING (company_id = get_user_company_id() AND is_admin());

-- Customers policies
CREATE POLICY "Users can view customers in their company" ON customers
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage customers in their company" ON customers
    FOR ALL USING (company_id = get_user_company_id());

-- Loads policies
CREATE POLICY "Users can view loads in their company" ON loads
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage loads in their company" ON loads
    FOR ALL USING (company_id = get_user_company_id());

-- Load drivers policies
CREATE POLICY "Users can view load assignments in their company" ON load_drivers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_drivers.load_id 
            AND loads.company_id = get_user_company_id()
        )
    );

CREATE POLICY "Users can manage load assignments in their company" ON load_drivers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_drivers.load_id 
            AND loads.company_id = get_user_company_id()
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Users can view load history in their company" ON load_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_status_history.load_id 
            AND loads.company_id = get_user_company_id()
        )
    );

CREATE POLICY "Users can view timeline in their company" ON load_timeline
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_timeline.load_id 
            AND loads.company_id = get_user_company_id()
        )
    );

CREATE POLICY "Users can view communications in their company" ON communications
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Users can view payments in their company" ON payments
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Users can view AI usage in their company" ON ai_usage_tracking
    FOR ALL USING (company_id = get_user_company_id());

CREATE POLICY "Users can view OCR data in their company" ON ocr_extractions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = ocr_extractions.load_id 
            AND loads.company_id = get_user_company_id()
        )
    );

CREATE POLICY "Users can view equipment types in their company" ON equipment_types
    FOR ALL USING (company_id = get_user_company_id());
