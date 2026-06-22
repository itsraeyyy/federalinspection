CREATE TABLE public.personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_am TEXT,
  position TEXT NOT NULL,
  position_am TEXT NOT NULL,
  office_category TEXT NOT NULL,
  office_category_am TEXT NOT NULL,
  department TEXT,
  email TEXT,
  phone TEXT,
  photo TEXT,
  message TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grants
GRANT ALL ON TABLE public.personnel TO anon, authenticated, service_role;

-- Enable RLS
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;

-- Database RLS Policies
CREATE POLICY "Public can view personnel" ON public.personnel FOR SELECT USING (true);
CREATE POLICY "Admins can manage personnel" ON public.personnel FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Register Storage Bucket for photos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('personnel_photos', 'personnel_photos', true, 5242880) -- 5MB limit
ON CONFLICT (id) DO NOTHING;

-- Storage Objects RLS Policies
CREATE POLICY "Public can view personnel photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'personnel_photos');

CREATE POLICY "Admins can manage personnel photos" 
ON storage.objects FOR ALL 
USING (bucket_id = 'personnel_photos' AND public.is_admin()) 
WITH CHECK (bucket_id = 'personnel_photos' AND public.is_admin());
