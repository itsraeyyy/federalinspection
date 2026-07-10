ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS target_region TEXT,
ADD COLUMN IF NOT EXISTS target_zone TEXT;
