-- Create a simple function to get the server timestamp
-- This is useful for testing connections
CREATE OR REPLACE FUNCTION get_server_timestamp()
RETURNS timestamptz
LANGUAGE sql
AS $$
  SELECT now();
$$;
