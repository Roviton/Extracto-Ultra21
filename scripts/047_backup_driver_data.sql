-- Create a backup table to see original driver data
DROP TABLE IF EXISTS drivers_backup_original;

CREATE TABLE drivers_backup_original AS 
SELECT * FROM drivers;

-- Show summary of what we backed up
SELECT 
    'Original Data Backup' as info,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN status IS NULL THEN 1 END) as null_status_count,
    COUNT(CASE WHEN status IS NOT NULL AND status NOT IN ('available', 'booked', 'out_of_service', 'on_vacation') THEN 1 END) as invalid_status_count
FROM drivers_backup_original;

-- Show all unique status values from original data
SELECT 
    'Original Status Values' as category,
    COALESCE(status, 'NULL') as status_value,
    COUNT(*) as count
FROM drivers_backup_original
GROUP BY status
ORDER BY status NULLS FIRST;
