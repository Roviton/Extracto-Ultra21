-- Check the actual structure of the loads table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'loads' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also show a sample of existing data to understand the structure
SELECT * FROM loads LIMIT 1;
