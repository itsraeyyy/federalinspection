-- Enhancement: add form fields, tracking code, workflow columns, update status constraint

-- 1. Add missing form fields
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS submission_mode TEXT DEFAULT 'በግል';
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS member_count INTEGER;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS requested_resolution TEXT;

-- 2. Add tracking code
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;

-- 3. Add workflow tracking columns
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS processed_by TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS resolved_by TEXT;

-- 4. Update status constraint: New → Processing → Resolved | Rejected
ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_status_check;
ALTER TABLE public.complaints ADD CONSTRAINT complaints_status_check
  CHECK (status IN ('New', 'Processing', 'Resolved', 'Rejected'));

-- 5. Update any existing 'Under Review' rows to 'Processing'
UPDATE public.complaints SET status = 'Processing' WHERE status = 'Under Review';

-- 6. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_complaints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_complaints_updated_at ON public.complaints;
CREATE TRIGGER trigger_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION update_complaints_updated_at();

-- 7. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaints', 'complaints', true)
ON CONFLICT DO NOTHING;

-- Storage policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon uploads to complaints') THEN
    CREATE POLICY "Allow anon uploads to complaints"
    ON storage.objects FOR INSERT TO anon
    WITH CHECK (bucket_id = 'complaints');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated full access to complaints bucket') THEN
    CREATE POLICY "Allow authenticated full access to complaints bucket"
    ON storage.objects FOR ALL TO authenticated
    USING (bucket_id = 'complaints');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public reads from complaints bucket') THEN
    CREATE POLICY "Allow public reads from complaints bucket"
    ON storage.objects FOR SELECT TO anon
    USING (bucket_id = 'complaints');
  END IF;
END
$$;

-- Allow anon to select by tracking code
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon to read complaints by tracking code') THEN
    CREATE POLICY "Allow anon to read complaints by tracking code"
    ON public.complaints FOR SELECT
    TO anon
    USING (tracking_code IS NOT NULL);
  END IF;
END
$$;

-- Allow authenticated to insert (so admins can test the form)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to insert complaints') THEN
    CREATE POLICY "Allow authenticated users to insert complaints"
    ON public.complaints FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;
END
$$;

