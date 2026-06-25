-- Create user_profiles table
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  gender TEXT,
  age INTEGER,
  education_level TEXT,
  professional_field TEXT,
  experience_professional INTEGER,
  experience_leadership INTEGER,
  institution TEXT,
  current_responsibility_gov TEXT,
  current_responsibility_com TEXT,
  system_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins have full access to user profiles" ON public.user_profiles 
  FOR ALL USING (public.is_assessment_admin()) WITH CHECK (public.is_assessment_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

GRANT ALL ON TABLE public.user_profiles TO anon, authenticated, service_role;
