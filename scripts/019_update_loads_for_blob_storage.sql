-- Update the loads table to use blob URLs instead of temp IDs
-- First, let's rename the existing column to be more descriptive
DO $$
BEGIN
    -- Check if the old column exists and rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'loads' 
        AND column_name = 'rate_confirmation_pdf_id'
    ) THEN
        ALTER TABLE loads RENAME COLUMN rate_confirmation_pdf_id TO rate_confirmation_pdf_url;
        RAISE NOTICE 'Renamed rate_confirmation_pdf_id to rate_confirmation_pdf_url';
    END IF;
    
    -- If the column doesn't exist at all, create it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'loads' 
        AND column_name = 'rate_confirmation_pdf_url'
    ) THEN
        ALTER TABLE loads ADD COLUMN rate_confirmation_pdf_url TEXT;
        RAISE NOTICE 'Added rate_confirmation_pdf_url column';
    END IF;
END $$;

-- Update the column comment to reflect the new purpose
COMMENT ON COLUMN loads.rate_confirmation_pdf_url IS 'Vercel Blob URL for the rate confirmation PDF';

-- Add an index for better performance when querying by PDF URL
CREATE INDEX IF NOT EXISTS idx_loads_rate_confirmation_pdf_url ON loads(rate_confirmation_pdf_url);

-- Add a check constraint to ensure URLs are valid (optional)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'loads_pdf_url_format'
    ) THEN
        ALTER TABLE loads ADD CONSTRAINT loads_pdf_url_format 
        CHECK (rate_confirmation_pdf_url IS NULL OR rate_confirmation_pdf_url ~ '^https://[a-zA-Z0-9.-]+\.vercel-storage\.com/.*');
        RAISE NOTICE 'Added URL format constraint';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not add URL constraint (this is optional): %', SQLERRM;
END $$;
