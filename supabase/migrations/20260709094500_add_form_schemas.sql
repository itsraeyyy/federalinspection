-- Create form_schemas table
CREATE TABLE IF NOT EXISTS public.form_schemas (
    id text PRIMARY KEY,
    table_title text NOT NULL,
    columns jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.form_schemas ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read form schemas
CREATE POLICY "Allow all authenticated users to read form schemas" ON public.form_schemas
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow admins to manage form schemas
CREATE POLICY "Allow admins to manage form schemas" ON public.form_schemas
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles
            WHERE admin_profiles.id = auth.uid()
        )
    );

-- Grant access to standard roles
GRANT ALL ON TABLE public.form_schemas TO anon, authenticated, service_role;

-- Add schema_snapshot to reports table to preserve old data structures
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS schema_snapshot jsonb;
alter table "public"."reports" drop constraint "reports_status_check";

alter table "public"."final_scores" drop column "score_30";

alter table "public"."news_articles" alter column "article_type" drop not null;

CREATE UNIQUE INDEX reports_region_year_period_key ON public.reports USING btree (region, year, period);

alter table "public"."evaluations" add constraint "eval_not_self" CHECK ((evaluator_id <> target_user_id)) not valid;

alter table "public"."evaluations" validate constraint "eval_not_self";

alter table "public"."reports" add constraint "reports_region_year_period_key" UNIQUE using index "reports_region_year_period_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.finalize_period_scores(p_period_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total_members INT;
  v_locked_self_assessments INT;
  v_locked_evaluations INT;
  v_locked_approver_evaluations INT;
  v_number_of_evaluators INT;
  v_number_of_approvers INT;
BEGIN
  -- Security check: Must be approver or admin
  IF NOT (public.is_assessment_admin() OR public.get_period_role(p_period_id, auth.uid()) = 'approver') THEN
    RAISE EXCEPTION 'Unauthorized: Only approver or admin can finalize scores';
  END IF;

  -- Get total members
  SELECT count(*) INTO v_total_members FROM public.period_members WHERE period_id = p_period_id;
  
  -- Check 10-point self assessments
  SELECT count(*) INTO v_locked_self_assessments FROM public.self_assessments WHERE period_id = p_period_id AND is_locked = true;
  IF v_locked_self_assessments < v_total_members THEN
    RAISE EXCEPTION 'Cannot finalize: Not all members have completed their self assessments.';
  END IF;

  -- Check 20-point evaluations
  SELECT count(*) INTO v_number_of_evaluators FROM public.period_members WHERE period_id = p_period_id AND role = 'evaluator';
  SELECT count(*) INTO v_locked_evaluations FROM public.evaluations WHERE period_id = p_period_id AND is_locked = true;
  IF v_locked_evaluations = 0 AND v_number_of_evaluators > 0 THEN
    RAISE EXCEPTION 'Cannot finalize: Evaluations are missing.';
  END IF;

  -- Check 70-point approver evaluations
  SELECT count(*) INTO v_number_of_approvers FROM public.period_members WHERE period_id = p_period_id AND role = 'approver';
  SELECT count(*) INTO v_locked_approver_evaluations FROM public.approver_evaluations WHERE period_id = p_period_id AND is_locked = true;
  
  -- Relaxed check: approvers don't evaluate themselves out of 70
  IF v_locked_approver_evaluations < (v_total_members - v_number_of_approvers) THEN
    RAISE EXCEPTION 'Cannot finalize: Not all approver evaluations (70 points) have been completed.';
  END IF;

  -- Calculate and insert final scores (10 + 20 + 70)
  INSERT INTO public.final_scores (user_id, period_id, final_score_100)
  SELECT 
    pm.user_id,
    p_period_id,
    COALESCE(sa.score_10, 0) + COALESCE(le.avg_score_20, 0) + COALESCE(ae.avg_score_70, 0) AS final_score_100
  FROM public.period_members pm
  LEFT JOIN public.self_assessments sa ON sa.period_id = p_period_id AND sa.user_id = pm.user_id
  LEFT JOIN (
    SELECT target_user_id, AVG(score_20) as avg_score_20
    FROM public.evaluations
    WHERE period_id = p_period_id
    GROUP BY target_user_id
  ) le ON le.target_user_id = pm.user_id
  LEFT JOIN (
    SELECT target_user_id, AVG(score_70) as avg_score_70
    FROM public.approver_evaluations
    WHERE period_id = p_period_id
    GROUP BY target_user_id
  ) ae ON ae.target_user_id = pm.user_id
  WHERE pm.period_id = p_period_id
  ON CONFLICT (period_id, user_id) DO UPDATE 
  SET final_score_100 = EXCLUDED.final_score_100;

  -- Update period status
  UPDATE public.assessment_periods SET status = 'finalized' WHERE id = p_period_id;

  RETURN true;
END;
$function$
;


  create policy "Allow public insert to report_attachments"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'report_attachments'::text));



  create policy "Allow public select from report_attachments"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'report_attachments'::text));



