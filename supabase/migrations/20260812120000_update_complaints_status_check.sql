-- Migration: Drop restrictive complaints_status_check constraint to allow dynamic workflow status values & grant update access
ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_status_check;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'complaints' AND policyname = 'Allow anon users to update complaints') THEN
    CREATE POLICY "Allow anon users to update complaints"
    ON public.complaints FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);
  END IF;
END
$$;
