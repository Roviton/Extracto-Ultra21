-- Fix RLS policies for company registration
-- During registration, we need to allow users to create companies

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can only view their own company" ON companies;
DROP POLICY IF EXISTS "Users can only update their own company" ON companies;

-- Create more permissive policies for registration
CREATE POLICY "Users can view companies they belong to" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR auth.uid() IS NULL -- Allow during registration before user profile exists
  );

CREATE POLICY "Allow company creation during registration" ON companies
  FOR INSERT WITH CHECK (true); -- Allow any authenticated user to create a company

CREATE POLICY "Users can update their own company" ON companies
  FOR UPDATE USING (
    id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Also fix users table RLS for registration
DROP POLICY IF EXISTS "Users can view users in their company" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users can view users in their company" ON users
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR auth.uid() IS NULL -- Allow during registration
  );

CREATE POLICY "Allow user profile creation during registration" ON users
  FOR INSERT WITH CHECK (
    id = auth.uid() -- Users can only create their own profile
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Fix customers table RLS as well
DROP POLICY IF EXISTS "Users can view customers in their company" ON customers;
CREATE POLICY "Users can view customers in their company" ON customers
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can manage customers in their company" ON customers
  FOR ALL USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Ensure the service role can bypass RLS for API operations
GRANT ALL ON companies TO service_role;
GRANT ALL ON users TO service_role;
GRANT ALL ON customers TO service_role;
