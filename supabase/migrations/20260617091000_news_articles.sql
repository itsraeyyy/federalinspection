CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'English',
  status TEXT NOT NULL DEFAULT 'Draft',
  author TEXT NOT NULL,
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published TIMESTAMP WITH TIME ZONE,
  category TEXT,
  content TEXT
);

GRANT ALL ON TABLE public.news_articles TO anon, authenticated, service_role;

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Allow public to read only published articles
CREATE POLICY "Public can view published news"
ON public.news_articles FOR SELECT
USING (status = 'Published');

-- Create a SECURITY DEFINER function to check if user is any kind of admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Admins can do everything
CREATE POLICY "Admins can insert news"
ON public.news_articles FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update news"
ON public.news_articles FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete news"
ON public.news_articles FOR DELETE
USING (public.is_admin());

CREATE POLICY "Admins can view all news"
ON public.news_articles FOR SELECT
USING (public.is_admin());
