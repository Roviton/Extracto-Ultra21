-- Test the constraint by trying to insert invalid data
DO $$
BEGIN
    -- This should fail with constraint violation
    BEGIN
        INSERT INTO drivers (id, company_id, name, status) 
        VALUES (gen_random_uuid(), (SELECT id FROM companies LIMIT 1), 'Test Driver', 'invalid_status');
        RAISE EXCEPTION 'Constraint test failed - invalid status was allowed';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'SUCCESS: Constraint properly rejected invalid status';
        WHEN OTHERS THEN
            RAISE NOTICE 'UNEXPECTED ERROR: %', SQLERRM;
    END;
    
    -- This should succeed
    BEGIN
        INSERT INTO drivers (id, company_id, name, status) 
        VALUES (gen_random_uuid(), (SELECT id FROM companies LIMIT 1), 'Test Driver Valid', 'available');
        RAISE NOTICE 'SUCCESS: Valid status was accepted';
        
        -- Clean up the test record
        DELETE FROM drivers WHERE name = 'Test Driver Valid';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERROR inserting valid driver: %', SQLERRM;
    END;
END $$;

-- Final status report
SELECT 
    'Final Driver Status Summary' as report,
    status,
    COUNT(*) as count
FROM drivers
GROUP BY status
ORDER BY status;
