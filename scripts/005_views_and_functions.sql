-- View for load performance metrics
CREATE VIEW load_performance_metrics AS
SELECT 
    l.company_id,
    l.dispatcher_id,
    u.name as dispatcher_name,
    DATE_TRUNC('month', l.pickup_date) as month,
    COUNT(*) as total_loads,
    SUM(l.rate) as total_revenue,
    SUM(l.distance) as total_miles,
    AVG(l.rpm) as average_rpm,
    COUNT(CASE WHEN l.status = 'completed' THEN 1 END) as completed_loads,
    COUNT(CASE WHEN l.status = 'refused' THEN 1 END) as refused_loads
FROM loads l
JOIN users u ON l.dispatcher_id = u.id
GROUP BY l.company_id, l.dispatcher_id, u.name, DATE_TRUNC('month', l.pickup_date);

-- View for driver performance
CREATE VIEW driver_performance_metrics AS
SELECT 
    d.company_id,
    d.id as driver_id,
    d.name as driver_name,
    COUNT(ld.load_id) as total_loads,
    SUM(l.rate) as total_revenue,
    SUM(l.distance) as total_miles,
    AVG(l.rpm) as average_rpm,
    COUNT(CASE WHEN l.status = 'completed' THEN 1 END) as completed_loads
FROM drivers d
LEFT JOIN load_drivers ld ON d.id = ld.driver_id
LEFT JOIN loads l ON ld.load_id = l.id
GROUP BY d.company_id, d.id, d.name;

-- Function to get active loads for dashboard
CREATE OR REPLACE FUNCTION get_dashboard_loads(company_uuid UUID)
RETURNS TABLE (
    load_id UUID,
    load_number VARCHAR,
    customer_name VARCHAR,
    pickup_city VARCHAR,
    pickup_state VARCHAR,
    delivery_city VARCHAR,
    delivery_state VARCHAR,
    pickup_date DATE,
    status VARCHAR,
    driver_names TEXT,
    rate DECIMAL,
    rpm DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.load_number,
        c.name,
        l.pickup_city,
        l.pickup_state,
        l.delivery_city,
        l.delivery_state,
        l.pickup_date,
        l.status,
        STRING_AGG(d.name, ', ') as driver_names,
        l.rate,
        l.rpm
    FROM loads l
    JOIN customers c ON l.customer_id = c.id
    LEFT JOIN load_drivers ld ON l.id = ld.load_id
    LEFT JOIN drivers d ON ld.driver_id = d.id
    WHERE l.company_id = company_uuid
    AND l.status IN ('new', 'assigned', 'accepted', 'in_progress')
    GROUP BY l.id, l.load_number, c.name, l.pickup_city, l.pickup_state, 
             l.delivery_city, l.delivery_state, l.pickup_date, l.status, l.rate, l.rpm
    ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to archive completed loads when driver gets new assignment
CREATE OR REPLACE FUNCTION archive_completed_loads_for_driver(driver_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER := 0;
BEGIN
    -- Update completed loads to archived status when driver gets new assignment
    UPDATE loads 
    SET status = 'completed',
        completed_at = NOW()
    WHERE id IN (
        SELECT l.id 
        FROM loads l
        JOIN load_drivers ld ON l.id = ld.load_id
        WHERE ld.driver_id = driver_uuid
        AND l.status = 'in_progress'
    );
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check if driver can take partial load
CREATE OR REPLACE FUNCTION can_driver_take_partial_load(driver_uuid UUID, new_load_weight INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    equipment_supports_partial BOOLEAN := false;
    current_weight INTEGER := 0;
    max_weight INTEGER := 0;
BEGIN
    -- Check if driver's equipment supports partial loads
    SELECT et.supports_partial_loads, et.max_weight
    INTO equipment_supports_partial, max_weight
    FROM drivers d
    JOIN equipment_types et ON d.equipment_type_id = et.id
    WHERE d.id = driver_uuid;
    
    IF NOT equipment_supports_partial THEN
        RETURN false;
    END IF;
    
    -- Calculate current weight of active loads
    SELECT COALESCE(SUM(l.weight), 0)
    INTO current_weight
    FROM loads l
    JOIN load_drivers ld ON l.id = ld.load_id
    WHERE ld.driver_id = driver_uuid
    AND l.status IN ('assigned', 'accepted', 'in_progress');
    
    -- Check if new load would exceed capacity
    RETURN (current_weight + new_load_weight) <= max_weight;
END;
$$ LANGUAGE plpgsql;
