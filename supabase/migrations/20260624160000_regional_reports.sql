-- Create ENUMs (used by user_profiles.region)
DO $$ BEGIN
  CREATE TYPE public.ethiopia_region AS ENUM (
    'ኦሮሚያ',
    'አማራ',
    'ሶማሌ',
    'አፋር',
    'ቤን-ጉሙዝ',
    'ጋምቤላ',
    'ሐረሪ',
    'ሲዳማ',
    'ደ/ም/ኢ/ያ',
    'ደቡብ ኢ/ያ',
    'ማዕ/ኢ/ያ',
    'አዲስ አበባ',
    'ድሬ ዳዋ',
    'ፌዴራል ተቋማት'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.report_period AS ENUM (
    '1ኛ ሩብ አመት',
    '2ኛ ሩብ አመት',
    'የመጀመሪያ ግማሽ አመት',
    '3ኛ ሩብ አመት',
    '4ኛ ሩብ አመት',
    '2ተኛ ግማሽ አመት',
    'የበጀት አመት (ሙሉ)'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Update user_profiles with region column
DO $$ BEGIN
  ALTER TABLE public.user_profiles ADD COLUMN region public.ethiopia_region;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add region_name column to the existing reports table if it doesn't exist already
-- (The reports table was created in a prior migration with a different schema)
DO $$ BEGIN
  ALTER TABLE public.reports ADD COLUMN region_enum public.ethiopia_region;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
