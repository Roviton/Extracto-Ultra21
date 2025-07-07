-- Add the new 'other_archived' status to the load_status enum
-- Note: Adding values to enums in PostgreSQL needs to be done carefully,
-- often within a transaction and sometimes by creating a new type and replacing the old one
-- if direct ALTER TYPE ... ADD VALUE is not supported or causes issues in older versions.
-- Assuming a modern PostgreSQL version that supports ADD VALUE directly:

ALTER TYPE public.load_status ADD VALUE IF NOT EXISTS 'other_archived';

-- Verify the enum now includes 'other_archived'
-- SELECT unnest(enum_range(NULL::public.load_status));
