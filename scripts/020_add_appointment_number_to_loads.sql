-- Add appointment_number column to the loads table
ALTER TABLE public.loads
ADD COLUMN IF NOT EXISTS appointment_number VARCHAR(100) NULL;

-- Optional: Add a comment to the column for clarity
COMMENT ON COLUMN public.loads.appointment_number IS 'Appointment number for pickup or delivery, if applicable.';
