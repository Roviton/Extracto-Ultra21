-- scripts/018_add_updated_at_to_load_documents.sql

-- Attempt to add an 'updated_at' column to the 'load_documents' table.
-- This is to address an error: "column "updated_at" of relation "load_documents" does not exist",
-- which suggests a trigger or function is trying to update this column when the 'loads' table is updated.

DO $$
BEGIN
    -- Check if the table 'load_documents' exists in the public schema
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'load_documents'
    ) THEN
        -- Check if the column 'updated_at' does NOT exist in 'load_documents'
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'load_documents' 
            AND column_name = 'updated_at'
        ) THEN
            -- Add the 'updated_at' column
            ALTER TABLE public.load_documents
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

            RAISE NOTICE 'Column "updated_at" ADDED to "public.load_documents" table.';

            -- Attempt to create a trigger to automatically update this new 'updated_at' column.
            -- This assumes a function like 'update_modified_column' already exists in the public schema
            -- (it's typically defined in a script like 002_indexes_and_triggers.sql for other tables).
            IF EXISTS (
                SELECT 1 FROM pg_proc 
                WHERE proname = 'update_modified_column' 
                AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            ) THEN
                -- Using EXECUTE for dynamic DDL to prevent errors if trigger already exists in some form
                -- A more robust check for trigger existence could be added if needed.
                BEGIN
                    EXECUTE '
                        CREATE TRIGGER update_load_documents_modtime
                        BEFORE UPDATE ON public.load_documents
                        FOR EACH ROW
                        EXECUTE FUNCTION public.update_modified_column();
                    ';
                    RAISE NOTICE 'Trigger "update_load_documents_modtime" created for "public.load_documents" table.';
                EXCEPTION
                    WHEN duplicate_object THEN
                        RAISE NOTICE 'Trigger "update_load_documents_modtime" already exists on "public.load_documents".';
                    WHEN OTHERS THEN
                        RAISE WARNING 'Could not create trigger "update_load_documents_modtime" on "public.load_documents": %', SQLERRM;
                END;
            ELSE
                RAISE WARNING 'Function "public.update_modified_column" not found. Standard trigger for "load_documents.updated_at" was NOT created.';
            END IF;
        ELSE
            RAISE NOTICE 'Column "updated_at" already exists in "public.load_documents" table. No changes made to the column.';
        END IF;
    ELSE
        RAISE WARNING 'Table "public.load_documents" does not exist. Cannot add "updated_at" column.';
        RAISE NOTICE 'If the "load_documents" table is essential, it should be defined in your schema (e.g., 001_initial_schema.sql).';
        RAISE NOTICE 'Example definition for "load_documents" if it were new:';
        RAISE NOTICE '-- CREATE TABLE IF NOT EXISTS public.load_documents (';
        RAISE NOTICE '--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),';
        RAISE NOTICE '--     load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,';
        RAISE NOTICE '--     document_type VARCHAR(50), -- e.g., ''rate_confirmation'', ''bol'', ''pod''';
        RAISE NOTICE '--     file_name VARCHAR(255),';
        RAISE NOTICE '--     storage_path TEXT, -- or reference to a blob storage ID';
        RAISE NOTICE '--     uploaded_by UUID REFERENCES public.users(id),';
        RAISE NOTICE '--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),';
        RAISE NOTICE '--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()';
        RAISE NOTICE '-- );';
        RAISE NOTICE '-- CREATE INDEX IF NOT EXISTS idx_load_documents_load_id ON public.load_documents(load_id);';
    END IF;
END;
$$ LANGUAGE plpgsql;
