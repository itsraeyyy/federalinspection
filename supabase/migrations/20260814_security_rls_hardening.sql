-- ============================================================================
-- ICODiS / Federal Inspection - Supabase Security Hardening Migration (v2)
-- Date: 2026-08-14
-- Description: Fixes 42P17 infinite recursion error on admin_profiles by using
--              SECURITY DEFINER helper functions (is_admin, is_super_admin).
-- ============================================================================

-- 1. Helper Security Definer Functions (bypasses RLS recursion safely)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'committee_leader')
      AND (status = 'Active' OR status IS NULL)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() 
      AND role = 'super_admin'
      AND (status = 'Active' OR status IS NULL)
  );
$$;

-- Grant execution to authenticated & anon roles
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, anon;

-- 2. Enable Row Level Security (RLS) on sensitive tables
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sletena_submissions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. POLICIES FOR admin_profiles (Uses SECURITY DEFINER functions to prevent 42P17 recursion)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view admin profiles"
ON public.admin_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR public.is_admin()
);

DROP POLICY IF EXISTS "Super admins can update admin profiles" ON public.admin_profiles;
CREATE POLICY "Super admins can update admin profiles"
ON public.admin_profiles
FOR ALL
TO authenticated
USING (
  public.is_super_admin()
);

-- ----------------------------------------------------------------------------
-- 4. POLICIES FOR users
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own profile or admins view all" ON public.users;
CREATE POLICY "Users view own profile or admins view all"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR public.is_admin()
);

-- ----------------------------------------------------------------------------
-- 5. POLICIES FOR complaints
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can submit complaints" ON public.complaints;
CREATE POLICY "Public can submit complaints"
ON public.complaints
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view complaints" ON public.complaints;
CREATE POLICY "Staff can view complaints"
ON public.complaints
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- ----------------------------------------------------------------------------
-- 6. POLICIES FOR feedbacks
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can submit feedback" ON public.feedbacks;
CREATE POLICY "Public can submit feedback"
ON public.feedbacks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view feedback" ON public.feedbacks;
CREATE POLICY "Admins can view feedback"
ON public.feedbacks
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- ----------------------------------------------------------------------------
-- 7. POLICIES FOR sletena_submissions
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can submit sletena" ON public.sletena_submissions;
CREATE POLICY "Public can submit sletena"
ON public.sletena_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view sletena" ON public.sletena_submissions;
CREATE POLICY "Staff can view sletena"
ON public.sletena_submissions
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);
