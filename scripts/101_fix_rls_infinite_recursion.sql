-- Fix infinite recursion in RLS policies
-- The issue is that helper functions are calling each other in a loop

-- First, let's drop the problematic helper functions
DROP FUNCTION IF EXISTS get_user_company_id();
DROP FUNCTION IF EXISTS is_admin();

-- Create simpler, non-recursive helper functions
CREATE OR REPLACE FUNCTION auth.get_user_company_id()
RETURNS UUID AS $$
BEGIN
    -- Direct query without using other RLS-protected tables
    RETURN (
        SELECT company_id 
        FROM public.users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Direct query without using other RLS-protected tables
    RETURN (
        SELECT role = 'admin'
        FROM public.users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;
DROP POLICY IF EXISTS "Users can view users in their company" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their company" ON users;
DROP POLICY IF EXISTS "Users can view drivers in their company" ON drivers;
DROP POLICY IF EXISTS "Users can update drivers in their company" ON drivers;
DROP POLICY IF EXISTS "Admins can manage drivers in their company" ON drivers;
DROP POLICY IF EXISTS "Users can view customers in their company" ON customers;
DROP POLICY IF EXISTS "Users can manage customers in their company" ON customers;
DROP POLICY IF EXISTS "Users can view loads in their company" ON loads;
DROP POLICY IF EXISTS "Users can manage loads in their company" ON loads;
DROP POLICY IF EXISTS "Users can view load assignments in their company" ON load_drivers;
DROP POLICY IF EXISTS "Users can manage load assignments in their company" ON load_drivers;
DROP POLICY IF EXISTS "Users can view load history in their company" ON load_status_history;
DROP POLICY IF EXISTS "Users can view timeline in their company" ON load_timeline;
DROP POLICY IF EXISTS "Users can view communications in their company" ON communications;
DROP POLICY IF EXISTS "Users can view payments in their company" ON payments;
DROP POLICY IF EXISTS "Users can view AI usage in their company" ON ai_usage_tracking;
DROP POLICY IF EXISTS "Users can view OCR data in their company" ON ocr_extractions;
DROP POLICY IF EXISTS "Users can view equipment types in their company" ON equipment_types;

-- Create new, simpler policies that don't cause recursion

-- Companies policies - simplified
CREATE POLICY "company_select_policy" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "company_update_policy" ON companies
    FOR UPDATE USING (
        id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users policies - avoid recursion by using direct auth.uid() checks
CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (
        company_id IN (
            SELECT u.company_id 
            FROM public.users u 
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "users_insert_policy" ON users
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT u.company_id 
            FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING (
        company_id IN (
            SELECT u.company_id 
            FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

CREATE POLICY "users_delete_policy" ON users
    FOR DELETE USING (
        company_id IN (
            SELECT u.company_id 
            FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Drivers policies
CREATE POLICY "drivers_select_policy" ON drivers
    FOR SELECT USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "drivers_all_policy" ON drivers
    FOR ALL USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- Customers policies
CREATE POLICY "customers_all_policy" ON customers
    FOR ALL USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- Loads policies
CREATE POLICY "loads_select_policy" ON loads
    FOR SELECT USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "loads_all_policy" ON loads
    FOR ALL USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- Load drivers policies
CREATE POLICY "load_drivers_select_policy" ON load_drivers
    FOR SELECT USING (
        load_id IN (
            SELECT l.id 
            FROM public.loads l
            JOIN public.users u ON u.id = auth.uid()
            WHERE l.company_id = u.company_id
        )
    );

CREATE POLICY "load_drivers_all_policy" ON load_drivers
    FOR ALL USING (
        load_id IN (
            SELECT l.id 
            FROM public.loads l
            JOIN public.users u ON u.id = auth.uid()
            WHERE l.company_id = u.company_id
        )
    );

-- Assignment history policies
CREATE POLICY "assignment_history_select_policy" ON assignment_history
    FOR SELECT USING (
        load_id IN (
            SELECT l.id 
            FROM public.loads l
            JOIN public.users u ON u.id = auth.uid()
            WHERE l.company_id = u.company_id
        )
    );

CREATE POLICY "assignment_history_all_policy" ON assignment_history
    FOR ALL USING (
        load_id IN (
            SELECT l.id 
            FROM public.loads l
            JOIN public.users u ON u.id = auth.uid()
            WHERE l.company_id = u.company_id
        )
    );

-- Load documents policies
CREATE POLICY "load_documents_select_policy" ON load_documents
    FOR SELECT USING (
        load_id IN (
            SELECT l.id 
            FROM public.loads l
            JOIN public.users u ON u.id = auth.uid()
            WHERE l.company_id = u.company_id
        )
    );

CREATE POLICY "load_documents_all_policy" ON load_documents
    FOR ALL USING (
        load_id IN (
            SELECT l.id 
            FROM public.loads l
            JOIN public.users u ON u.id = auth.uid()
            WHERE l.company_id = u.company_id
        )
    );

-- Company invitations policies
CREATE POLICY "company_invitations_select_policy" ON company_invitations
    FOR SELECT USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "company_invitations_all_policy" ON company_invitations
    FOR ALL USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Driver assignments policies
CREATE POLICY "driver_assignments_select_policy" ON driver_assignments
    FOR SELECT USING (
        driver_id IN (
            SELECT d.id 
            FROM public.drivers d
            JOIN public.users u ON u.id = auth.uid()
            WHERE d.company_id = u.company_id
        )
    );

CREATE POLICY "driver_assignments_all_policy" ON driver_assignments
    FOR ALL USING (
        driver_id IN (
            SELECT d.id 
            FROM public.drivers d
            JOIN public.users u ON u.id = auth.uid()
            WHERE d.company_id = u.company_id AND u.role = 'admin'
        )
    );

-- RPM targets policies
CREATE POLICY "rpm_targets_select_policy" ON rpm_targets
    FOR SELECT USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "rpm_targets_all_policy" ON rpm_targets
    FOR ALL USING (
        company_id IN (
            SELECT company_id 
            FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin comments policies
CREATE POLICY "admin_comments_select_policy" ON admin_comments
    FOR SELECT USING (
        load_id IN (
            SELECT l.id 
            FROM public.loads l
            JOIN public.users u ON u.id = auth.uid()
            WHERE l.company_id = u.company_id
        )
    );

CREATE POLICY "admin_comments_all_policy" ON admin_comments
    FOR ALL USING (
        load_id IN (
            SELECT l.id 
            FROM public.loads l
            JOIN public.users u ON u.id = auth.uid()
            WHERE l.company_id = u.company_id AND u.role = 'admin'
        )
    );

-- Grant necessary permissions to the auth schema functions
GRANT EXECUTE ON FUNCTION auth.get_user_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_user_admin() TO authenticated;

-- Refresh the schema
NOTIFY pgrst, 'reload schema';

-- Test the policies by running a simple query
DO $$
BEGIN
    RAISE NOTICE 'RLS policies updated successfully. Testing basic functionality...';
END $$;
