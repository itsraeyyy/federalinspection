-- Create the public_files table
CREATE TABLE IF NOT EXISTS public_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('መተዳደርያ ደንብ', 'የኮሚሽኑ መመሪያዎች', 'የፓርቲ መመሪያዎች')),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size TEXT,
    file_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Set up RLS for public_files
ALTER TABLE public_files ENABLE ROW LEVEL SECURITY;

-- Grant privileges
GRANT ALL ON public.public_files TO anon, authenticated, service_role;

-- Allow public read access to public_files
CREATE POLICY "Allow public read access to public_files"
    ON public_files
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated admins to insert/update/delete
CREATE POLICY "Allow authenticated admins to insert public_files"
    ON public_files
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated admins to update public_files"
    ON public_files
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated admins to delete public_files"
    ON public_files
    FOR DELETE
    TO authenticated
    USING (true);

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public_documents', 'public_documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for public_documents bucket
CREATE POLICY "Allow public read access to public_documents bucket"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'public_documents');

CREATE POLICY "Allow authenticated admins to insert into public_documents bucket"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'public_documents');

CREATE POLICY "Allow authenticated admins to update in public_documents bucket"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'public_documents');

CREATE POLICY "Allow authenticated admins to delete from public_documents bucket"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'public_documents');
