-- Add Missing Messaging Columns
-- This script adds the missing columns to the driver_messaging table

-- Add telegram_chat_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'driver_messaging' AND column_name = 'telegram_chat_id') THEN
        ALTER TABLE driver_messaging ADD COLUMN telegram_chat_id VARCHAR(50);
        RAISE NOTICE 'Added telegram_chat_id column to driver_messaging table';
    ELSE
        RAISE NOTICE 'telegram_chat_id column already exists in driver_messaging table';
    END IF;
END $$;

-- Add whatsapp_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'driver_messaging' AND column_name = 'whatsapp_number') THEN
        ALTER TABLE driver_messaging ADD COLUMN whatsapp_number VARCHAR(20);
        RAISE NOTICE 'Added whatsapp_number column to driver_messaging table';
    ELSE
        RAISE NOTICE 'whatsapp_number column already exists in driver_messaging table';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'driver_messaging' 
ORDER BY ordinal_position;

COMMIT;
