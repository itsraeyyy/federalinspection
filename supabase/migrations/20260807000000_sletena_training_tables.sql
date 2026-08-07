-- Migration: Sletena Training Forms & Submissions Tables
-- Date: 2026-08-07

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.sletena_categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date_created DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    category_type TEXT DEFAULT 'NEED',
    submitters_count INT DEFAULT 0,
    shareable_link TEXT,
    selected_directive_ids JSONB DEFAULT '[]'::jsonb,
    questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Need Submissions Table
CREATE TABLE IF NOT EXISTS public.sletena_submissions (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES public.sletena_categories(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    member_id TEXT,
    contact TEXT,
    region TEXT,
    zone TEXT,
    woreda TEXT,
    membership_level TEXT,
    ratings JSONB DEFAULT '{}'::jsonb,
    top_priority_directives JSONB DEFAULT '[]'::jsonb,
    additional_needed_directives JSONB DEFAULT '[]'::jsonb,
    preferred_training_methods JSONB DEFAULT '[]'::jsonb,
    qualitative_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Satisfaction Submissions Table
CREATE TABLE IF NOT EXISTS public.sletena_satisfaction_submissions (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES public.sletena_categories(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    region TEXT,
    trainer_rating INT,
    content_rating INT,
    venue_logistics_rating INT,
    relevance_rating INT,
    overall_rating INT,
    recommend_score INT,
    positive_aspects TEXT,
    improvement_suggestions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sletena_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sletena_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sletena_satisfaction_submissions ENABLE ROW LEVEL SECURITY;

-- Create Public Access Policies
DROP POLICY IF EXISTS "Public read sletena_categories" ON public.sletena_categories;
DROP POLICY IF EXISTS "Public insert sletena_categories" ON public.sletena_categories;
DROP POLICY IF EXISTS "Public update sletena_categories" ON public.sletena_categories;
DROP POLICY IF EXISTS "Public delete sletena_categories" ON public.sletena_categories;

CREATE POLICY "Public read sletena_categories" ON public.sletena_categories FOR SELECT USING (true);
CREATE POLICY "Public insert sletena_categories" ON public.sletena_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sletena_categories" ON public.sletena_categories FOR UPDATE USING (true);
CREATE POLICY "Public delete sletena_categories" ON public.sletena_categories FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read sletena_submissions" ON public.sletena_submissions;
DROP POLICY IF EXISTS "Public insert sletena_submissions" ON public.sletena_submissions;

CREATE POLICY "Public read sletena_submissions" ON public.sletena_submissions FOR SELECT USING (true);
CREATE POLICY "Public insert sletena_submissions" ON public.sletena_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read sletena_satisfaction_submissions" ON public.sletena_satisfaction_submissions;
DROP POLICY IF EXISTS "Public insert sletena_satisfaction_submissions" ON public.sletena_satisfaction_submissions;

CREATE POLICY "Public read sletena_satisfaction_submissions" ON public.sletena_satisfaction_submissions FOR SELECT USING (true);
CREATE POLICY "Public insert sletena_satisfaction_submissions" ON public.sletena_satisfaction_submissions FOR INSERT WITH CHECK (true);
