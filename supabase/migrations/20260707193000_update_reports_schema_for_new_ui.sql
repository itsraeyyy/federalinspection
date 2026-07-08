-- Add columns to reports table to match the new UI
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS year integer,
ADD COLUMN IF NOT EXISTS period text,
ADD COLUMN IF NOT EXISTS forms_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS admin_feedback text,
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone;
