CREATE TABLE public.document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  parent_id UUID REFERENCES public.document_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES public.document_folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  visibility TEXT DEFAULT 'Internal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.document_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  accessed_by TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Register Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', false, 52428800) -- 50MB limit
ON CONFLICT (id) DO NOTHING;

-- Grants
GRANT ALL ON TABLE public.document_folders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.documents TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.document_access_logs TO anon, authenticated, service_role;

-- Enable RLS
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

-- Database RLS Policies
CREATE POLICY "Admins can manage folders" ON public.document_folders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can manage documents" ON public.documents FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can manage access logs" ON public.document_access_logs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Storage Objects RLS Policies
CREATE POLICY "Admins can manage document storage" 
ON storage.objects FOR ALL 
USING (bucket_id = 'documents' AND public.is_admin()) 
WITH CHECK (bucket_id = 'documents' AND public.is_admin());

-- Seed initial root folders
INSERT INTO public.document_folders (id, name, code) VALUES 
('a0000000-0000-0000-0000-000000000001', 'ኮሚሽን ዋና ጽ/ቤት (Main Office)', 'ADMIN_DEFINED'),
('a0000000-0000-0000-0000-000000000002', 'የኮሚሽን ቅርንጫፍ ጽ/ቤቶች (Branches)', '14');
