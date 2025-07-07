-- Check the structure of the drivers table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'drivers';

-- Check for any sample data to see the actual column names
SELECT * FROM drivers LIMIT 5;
