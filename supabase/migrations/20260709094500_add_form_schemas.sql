-- Create form_schemas table
CREATE TABLE IF NOT EXISTS public.form_schemas (
    id text PRIMARY KEY,
    table_title text NOT NULL,
    columns jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.form_schemas ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read form schemas
CREATE POLICY "Allow all authenticated users to read form schemas" ON public.form_schemas
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow admins to manage form schemas
CREATE POLICY "Allow admins to manage form schemas" ON public.form_schemas
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

-- Grant access to standard roles
GRANT ALL ON TABLE public.form_schemas TO anon, authenticated, service_role;

-- Add schema_snapshot to reports table to preserve old data structures
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS schema_snapshot jsonb;
