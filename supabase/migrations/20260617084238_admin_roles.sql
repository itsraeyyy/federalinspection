-- 1. Create a custom enum for Roles
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin');

-- 2. Create the admin_profiles table
CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.admin_role NOT NULL DEFAULT 'admin',
  permissions TEXT[] NOT NULL DEFAULT '{}',
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant privileges so the Supabase API can access the table
GRANT ALL ON TABLE public.admin_profiles TO anon, authenticated, service_role;

-- 3. Row-Level Security (RLS)
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Allow admins to read their own profile
CREATE POLICY "Admins can view their own profile"
ON public.admin_profiles FOR SELECT
USING (auth.uid() = id);

-- Create a SECURITY DEFINER function to securely check super_admin status without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Allow super_admins to view all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.admin_profiles FOR SELECT
USING (public.is_super_admin());

-- Allow super_admins to insert, update, and delete profiles
CREATE POLICY "Super admins can insert profiles"
ON public.admin_profiles FOR INSERT
WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can update profiles"
ON public.admin_profiles FOR UPDATE
USING (public.is_super_admin());

CREATE POLICY "Super admins can delete profiles"
ON public.admin_profiles FOR DELETE
USING (public.is_super_admin());
