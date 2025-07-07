-- Create a function to make the assigned_by column nullable
CREATE OR REPLACE FUNCTION make_assigned_by_nullable()
RETURNS void AS $$
BEGIN
  -- Check if the column exists and is not nullable
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'load_drivers'
    AND column_name = 'assigned_by'
    AND is_nullable = 'NO'
  ) THEN
    -- Make the column nullable
    EXECUTE 'ALTER TABLE load_drivers ALTER COLUMN assigned_by DROP NOT NULL';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT make_assigned_by_nullable();

-- Update any existing records with NULL assigned_by to use a default user
DO $$
DECLARE
  default_user_id UUID;
BEGIN
  -- Try to get a user ID to use as default
  SELECT id INTO default_user_id FROM users LIMIT 1;
  
  -- If we found a user, update records
  IF default_user_id IS NOT NULL THEN
    UPDATE load_drivers
    SET assigned_by = default_user_id
    WHERE assigned_by IS NULL;
  END IF;
END $$;

-- Insert sample drivers if none exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM drivers LIMIT 1) THEN
    INSERT INTO drivers (name, phone, email, status)
    VALUES 
      ('John Driver', '555-123-4567', 'john.driver@example.com', 'available'),
      ('Sarah Trucker', '555-987-6543', 'sarah.trucker@example.com', 'available'),
      ('Mike Hauler', '555-456-7890', 'mike.hauler@example.com', 'on_duty');
  END IF;
END $$;
