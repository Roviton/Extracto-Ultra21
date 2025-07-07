-- Indexes for performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_drivers_company_id ON drivers(company_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_loads_company_id ON loads(company_id);
CREATE INDEX idx_loads_status ON loads(status);
CREATE INDEX idx_loads_dispatcher_id ON loads(dispatcher_id);
CREATE INDEX idx_loads_customer_id ON loads(customer_id);
CREATE INDEX idx_loads_pickup_date ON loads(pickup_date);
CREATE INDEX idx_loads_created_at ON loads(created_at);
CREATE INDEX idx_load_drivers_load_id ON load_drivers(load_id);
CREATE INDEX idx_load_drivers_driver_id ON load_drivers(driver_id);
CREATE INDEX idx_load_status_history_load_id ON load_status_history(load_id);
CREATE INDEX idx_load_timeline_load_id ON load_timeline(load_id);
CREATE INDEX idx_communications_load_id ON communications(load_id);
CREATE INDEX idx_communications_company_id ON communications(company_id);
CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_ai_usage_company_id ON ai_usage_tracking(company_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loads_updated_at BEFORE UPDATE ON loads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate RPM when rate or distance changes
CREATE OR REPLACE FUNCTION calculate_rpm()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rate IS NOT NULL AND NEW.distance IS NOT NULL AND NEW.distance > 0 THEN
        NEW.rpm = NEW.rate / NEW.distance;
    ELSE
        NEW.rpm = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-calculate RPM
CREATE TRIGGER calculate_load_rpm BEFORE INSERT OR UPDATE ON loads FOR EACH ROW EXECUTE FUNCTION calculate_rpm();

-- Function to track load status changes
CREATE OR REPLACE FUNCTION track_load_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only insert if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO load_status_history (load_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.dispatcher_id);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for load status tracking
CREATE TRIGGER track_load_status_changes AFTER UPDATE ON loads FOR EACH ROW EXECUTE FUNCTION track_load_status_change();

-- Function to update driver status based on load assignments
CREATE OR REPLACE FUNCTION update_driver_status()
RETURNS TRIGGER AS $$
DECLARE
    active_loads_count INTEGER;
BEGIN
    -- Count active loads for the driver
    SELECT COUNT(*) INTO active_loads_count
    FROM load_drivers ld
    JOIN loads l ON ld.load_id = l.id
    WHERE ld.driver_id = COALESCE(NEW.driver_id, OLD.driver_id)
    AND l.status IN ('assigned', 'accepted', 'in_progress');
    
    -- Update driver status
    UPDATE drivers 
    SET status = CASE 
        WHEN active_loads_count > 0 THEN 'booked'
        ELSE 'available'
    END
    WHERE id = COALESCE(NEW.driver_id, OLD.driver_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers for driver status updates
CREATE TRIGGER update_driver_status_on_assignment AFTER INSERT OR DELETE ON load_drivers FOR EACH ROW EXECUTE FUNCTION update_driver_status();
