-- Add rate_confirmation_pdf_id column to loads table
ALTER TABLE loads ADD COLUMN IF NOT EXISTS rate_confirmation_pdf_id TEXT;

-- Add index for better performance when querying by PDF ID
CREATE INDEX IF NOT EXISTS idx_loads_rate_confirmation_pdf_id ON loads(rate_confirmation_pdf_id);

-- Add comment to document the column purpose
COMMENT ON COLUMN loads.rate_confirmation_pdf_id IS 'Reference ID for the rate confirmation PDF stored in tempDocumentStorage';
