drop policy "Members viewable by period members or admins" on "public"."period_members";


  create table "public"."otp_requests" (
    "id" uuid not null default gen_random_uuid(),
    "phone_number" text not null,
    "otp_code" text not null,
    "expires_at" timestamp with time zone not null,
    "used" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."otp_requests" enable row level security;


  create table "public"."page_views" (
    "id" uuid not null default gen_random_uuid(),
    "timestamp" timestamp with time zone default now(),
    "path" text,
    "referrer" text,
    "ip_address" text,
    "user_agent" text,
    "device_type" text,
    "country" text
      );


alter table "public"."page_views" enable row level security;


  create table "public"."report_feedbacks" (
    "id" uuid not null default gen_random_uuid(),
    "report_id" uuid not null,
    "reviewer_id" uuid not null,
    "feedback_level" text not null,
    "description" text not null,
    "file_url" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."report_feedbacks" enable row level security;


  create table "public"."reporting_profiles" (
    "user_id" uuid not null,
    "hierarchy_level" text not null,
    "region_name" text,
    "subcity_name" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."reporting_profiles" enable row level security;


  create table "public"."reports" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "report_type" text not null,
    "period_category" text not null,
    "budget_year" text not null,
    "submitter_id" uuid not null,
    "submitter_level" text not null,
    "region_name" text,
    "subcity_name" text,
    "status" text not null default 'draft'::text,
    "numerical_data" jsonb default '{}'::jsonb,
    "file_url" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."reports" enable row level security;

alter table "public"."evaluations" add column "responses" jsonb default '{}'::jsonb;

CREATE INDEX idx_otp_requests_phone ON public.otp_requests USING btree (phone_number);

CREATE INDEX idx_page_views_ip_address ON public.page_views USING btree (ip_address);

CREATE INDEX idx_page_views_path ON public.page_views USING btree (path);

CREATE INDEX idx_page_views_timestamp ON public.page_views USING btree ("timestamp");

CREATE UNIQUE INDEX otp_requests_pkey ON public.otp_requests USING btree (id);

CREATE UNIQUE INDEX page_views_pkey ON public.page_views USING btree (id);

CREATE UNIQUE INDEX report_feedbacks_pkey ON public.report_feedbacks USING btree (id);

CREATE UNIQUE INDEX reporting_profiles_pkey ON public.reporting_profiles USING btree (user_id);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

alter table "public"."otp_requests" add constraint "otp_requests_pkey" PRIMARY KEY using index "otp_requests_pkey";

alter table "public"."page_views" add constraint "page_views_pkey" PRIMARY KEY using index "page_views_pkey";

alter table "public"."report_feedbacks" add constraint "report_feedbacks_pkey" PRIMARY KEY using index "report_feedbacks_pkey";

alter table "public"."reporting_profiles" add constraint "reporting_profiles_pkey" PRIMARY KEY using index "reporting_profiles_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."report_feedbacks" add constraint "report_feedbacks_feedback_level_check" CHECK ((feedback_level = ANY (ARRAY['region'::text, 'federal'::text]))) not valid;

alter table "public"."report_feedbacks" validate constraint "report_feedbacks_feedback_level_check";

alter table "public"."report_feedbacks" add constraint "report_feedbacks_report_id_fkey" FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE not valid;

alter table "public"."report_feedbacks" validate constraint "report_feedbacks_report_id_fkey";

alter table "public"."report_feedbacks" add constraint "report_feedbacks_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."report_feedbacks" validate constraint "report_feedbacks_reviewer_id_fkey";

alter table "public"."reporting_profiles" add constraint "reporting_profiles_hierarchy_level_check" CHECK ((hierarchy_level = ANY (ARRAY['federal'::text, 'region'::text, 'subcity'::text]))) not valid;

alter table "public"."reporting_profiles" validate constraint "reporting_profiles_hierarchy_level_check";

alter table "public"."reporting_profiles" add constraint "reporting_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reporting_profiles" validate constraint "reporting_profiles_user_id_fkey";

alter table "public"."reports" add constraint "reports_period_category_check" CHECK ((period_category = ANY (ARRAY['q1'::text, 'q2'::text, 'h1'::text, 'q3'::text, 'q4'::text, 'h2'::text, 'yearly'::text]))) not valid;

alter table "public"."reports" validate constraint "reports_period_category_check";

alter table "public"."reports" add constraint "reports_report_type_check" CHECK ((report_type = ANY (ARRAY['numerical'::text, 'narration'::text]))) not valid;

alter table "public"."reports" validate constraint "reports_report_type_check";

alter table "public"."reports" add constraint "reports_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'submitted_to_region'::text, 'accepted_by_region'::text, 'submitted_to_federal'::text, 'accepted_by_federal'::text]))) not valid;

alter table "public"."reports" validate constraint "reports_status_check";

alter table "public"."reports" add constraint "reports_submitter_id_fkey" FOREIGN KEY (submitter_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_submitter_id_fkey";

alter table "public"."reports" add constraint "reports_submitter_level_check" CHECK ((submitter_level = ANY (ARRAY['subcity'::text, 'region'::text, 'federal'::text]))) not valid;

alter table "public"."reports" validate constraint "reports_submitter_level_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_analytics_summary(start_date timestamp with time zone, end_date timestamp with time zone)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    result json;
    time_series_data json;
    top_pages_data json;
    entry_pages_data json;
    exit_pages_data json;
    top_referrers_data json;
    devices_data json;
    locations_data json;
    total_views_count integer;
    unique_visitors_count integer;
    bounce_rate_calc numeric;
    session_duration_calc text;
    interval_step interval;
BEGIN
    -- Determine interval step for time series based on date range
    IF (end_date - start_date) <= interval '2 days' THEN
        interval_step := interval '2 hours';
    ELSIF (end_date - start_date) <= interval '31 days' THEN
        interval_step := interval '1 day';
    ELSE
        interval_step := interval '1 week';
    END IF;

    -- 1. Time Series
    WITH series AS (
        SELECT generate_series(
            date_trunc('hour', start_date),
            end_date,
            interval_step
        ) as bucket
    ),
    bucket_sessions AS (
        SELECT 
            CASE 
                WHEN interval_step = interval '2 hours' THEN 
                     date_trunc('hour', timestamp) - (EXTRACT(hour FROM timestamp)::int % 2) * interval '1 hour'
                WHEN interval_step = interval '1 day' THEN date_trunc('day', timestamp)
                ELSE date_trunc('week', timestamp)
            END as date,
            ip_address,
            COUNT(*) as view_count,
            MIN(timestamp) as session_start,
            MAX(timestamp) as session_end
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY 1, 2
    ),
    bucket_metrics AS (
        SELECT
            date,
            SUM(view_count) as views,
            COUNT(DISTINCT ip_address) as unique,
            COUNT(*) as total_sessions,
            COUNT(*) FILTER (WHERE view_count = 1) as bounce_sessions,
            AVG(EXTRACT(EPOCH FROM (session_end - session_start))) FILTER (WHERE view_count > 1) as avg_duration_seconds
        FROM bucket_sessions
        GROUP BY date
    )
    SELECT 
        COALESCE(json_agg(
            json_build_object(
                'date', s.bucket,
                'views', COALESCE(bm.views, 0),
                'unique', COALESCE(bm.unique, 0),
                'bounce_rate', CASE WHEN COALESCE(bm.total_sessions, 0) = 0 THEN 0 ELSE ROUND((COALESCE(bm.bounce_sessions, 0)::numeric * 100.0) / bm.total_sessions, 1) END,
                'duration_seconds', COALESCE(bm.avg_duration_seconds, 0)
            ) ORDER BY s.bucket
        ), '[]'::json)
    INTO time_series_data
    FROM series s
    LEFT JOIN bucket_metrics bm ON 
        (interval_step = interval '2 hours' AND bm.date = (s.bucket - (EXTRACT(hour FROM s.bucket)::int % 2) * interval '1 hour')) OR
        (interval_step != interval '2 hours' AND bm.date = s.bucket);

    -- 2. Sessions (Entry, Exit, Duration, Bounce)
    WITH user_sessions AS (
        SELECT 
            ip_address,
            MIN(timestamp) as session_start,
            MAX(timestamp) as session_end,
            COUNT(*) as view_count,
            (ARRAY_AGG(path ORDER BY timestamp ASC))[1] as entry_page,
            (ARRAY_AGG(path ORDER BY timestamp DESC))[1] as exit_page
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY ip_address, date_trunc('day', timestamp)
    ),
    session_metrics AS (
        SELECT 
            COUNT(*) as total_sessions,
            COUNT(*) FILTER (WHERE view_count = 1) as bounce_sessions,
            AVG(EXTRACT(EPOCH FROM (session_end - session_start))) FILTER (WHERE view_count > 1) as avg_duration_seconds
        FROM user_sessions
    )
    SELECT 
        CASE WHEN total_sessions = 0 THEN 0 ELSE ROUND((bounce_sessions::numeric * 100.0) / total_sessions, 1) END,
        CASE 
            WHEN avg_duration_seconds IS NULL THEN '0m 0s'
            ELSE floor(avg_duration_seconds / 60)::text || 'm ' || round(avg_duration_seconds % 60)::text || 's'
        END
    INTO bounce_rate_calc, session_duration_calc
    FROM session_metrics;

    -- Entry pages
    WITH user_sessions AS (
        SELECT (ARRAY_AGG(path ORDER BY timestamp ASC))[1] as entry_page
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY ip_address, date_trunc('day', timestamp)
    )
    SELECT COALESCE(json_agg(json_build_object('path', entry_page, 'views', views)), '[]'::json)
    INTO entry_pages_data
    FROM (
        SELECT entry_page, COUNT(*) as views
        FROM user_sessions
        GROUP BY entry_page
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Exit pages
    WITH user_sessions AS (
        SELECT (ARRAY_AGG(path ORDER BY timestamp DESC))[1] as exit_page
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY ip_address, date_trunc('day', timestamp)
    )
    SELECT COALESCE(json_agg(json_build_object('path', exit_page, 'views', views)), '[]'::json)
    INTO exit_pages_data
    FROM (
        SELECT exit_page, COUNT(*) as views
        FROM user_sessions
        GROUP BY exit_page
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Totals
    SELECT COUNT(*), COUNT(DISTINCT ip_address)
    INTO total_views_count, unique_visitors_count
    FROM page_views
    WHERE timestamp BETWEEN start_date AND end_date;

    -- Top Pages
    SELECT COALESCE(json_agg(json_build_object('path', path, 'views', views)), '[]'::json)
    INTO top_pages_data
    FROM (
        SELECT path, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY path
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Referrers
    SELECT COALESCE(json_agg(json_build_object('referrer', referrer, 'views', views)), '[]'::json)
    INTO top_referrers_data
    FROM (
        SELECT referrer, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date AND referrer IS NOT NULL AND referrer != ''
        GROUP BY referrer
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Devices
    SELECT COALESCE(json_agg(json_build_object('device_type', device_type, 'views', views)), '[]'::json)
    INTO devices_data
    FROM (
        SELECT device_type, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY device_type
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Locations
    SELECT COALESCE(json_agg(json_build_object('country', country, 'views', views)), '[]'::json)
    INTO locations_data
    FROM (
        SELECT country, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY country
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Build final JSON
    result := json_build_object(
        'total_views', COALESCE(total_views_count, 0),
        'unique_visitors', COALESCE(unique_visitors_count, 0),
        'bounce_rate', COALESCE(bounce_rate_calc, 0),
        'session_duration', COALESCE(session_duration_calc, '0m 0s'),
        'time_series', time_series_data,
        'top_pages', top_pages_data,
        'entry_pages', entry_pages_data,
        'exit_pages', exit_pages_data,
        'top_referrers', top_referrers_data,
        'devices', devices_data,
        'locations', locations_data
    );

    RETURN result;
END;
$function$
;

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

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_assessment_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If super_admin from existing global profiles, return true
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_super_admin') THEN
    IF public.is_super_admin() THEN RETURN true; END IF;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.period_members
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$function$
;

grant references on table "public"."otp_requests" to "anon";

grant trigger on table "public"."otp_requests" to "anon";

grant truncate on table "public"."otp_requests" to "anon";

grant references on table "public"."otp_requests" to "authenticated";

grant trigger on table "public"."otp_requests" to "authenticated";

grant truncate on table "public"."otp_requests" to "authenticated";

grant references on table "public"."otp_requests" to "service_role";

grant trigger on table "public"."otp_requests" to "service_role";

grant truncate on table "public"."otp_requests" to "service_role";

grant delete on table "public"."page_views" to "anon";

grant insert on table "public"."page_views" to "anon";

grant references on table "public"."page_views" to "anon";

grant select on table "public"."page_views" to "anon";

grant trigger on table "public"."page_views" to "anon";

grant truncate on table "public"."page_views" to "anon";

grant update on table "public"."page_views" to "anon";

grant delete on table "public"."page_views" to "authenticated";

grant insert on table "public"."page_views" to "authenticated";

grant references on table "public"."page_views" to "authenticated";

grant select on table "public"."page_views" to "authenticated";

grant trigger on table "public"."page_views" to "authenticated";

grant truncate on table "public"."page_views" to "authenticated";

grant update on table "public"."page_views" to "authenticated";

grant delete on table "public"."page_views" to "service_role";

grant insert on table "public"."page_views" to "service_role";

grant references on table "public"."page_views" to "service_role";

grant select on table "public"."page_views" to "service_role";

grant trigger on table "public"."page_views" to "service_role";

grant truncate on table "public"."page_views" to "service_role";

grant update on table "public"."page_views" to "service_role";

grant delete on table "public"."report_feedbacks" to "anon";

grant insert on table "public"."report_feedbacks" to "anon";

grant references on table "public"."report_feedbacks" to "anon";

grant select on table "public"."report_feedbacks" to "anon";

grant trigger on table "public"."report_feedbacks" to "anon";

grant truncate on table "public"."report_feedbacks" to "anon";

grant update on table "public"."report_feedbacks" to "anon";

grant delete on table "public"."report_feedbacks" to "authenticated";

grant insert on table "public"."report_feedbacks" to "authenticated";

grant references on table "public"."report_feedbacks" to "authenticated";

grant select on table "public"."report_feedbacks" to "authenticated";

grant trigger on table "public"."report_feedbacks" to "authenticated";

grant truncate on table "public"."report_feedbacks" to "authenticated";

grant update on table "public"."report_feedbacks" to "authenticated";

grant delete on table "public"."report_feedbacks" to "service_role";

grant insert on table "public"."report_feedbacks" to "service_role";

grant references on table "public"."report_feedbacks" to "service_role";

grant select on table "public"."report_feedbacks" to "service_role";

grant trigger on table "public"."report_feedbacks" to "service_role";

grant truncate on table "public"."report_feedbacks" to "service_role";

grant update on table "public"."report_feedbacks" to "service_role";

grant delete on table "public"."reporting_profiles" to "anon";

grant insert on table "public"."reporting_profiles" to "anon";

grant references on table "public"."reporting_profiles" to "anon";

grant select on table "public"."reporting_profiles" to "anon";

grant trigger on table "public"."reporting_profiles" to "anon";

grant truncate on table "public"."reporting_profiles" to "anon";

grant update on table "public"."reporting_profiles" to "anon";

grant delete on table "public"."reporting_profiles" to "authenticated";

grant insert on table "public"."reporting_profiles" to "authenticated";

grant references on table "public"."reporting_profiles" to "authenticated";

grant select on table "public"."reporting_profiles" to "authenticated";

grant trigger on table "public"."reporting_profiles" to "authenticated";

grant truncate on table "public"."reporting_profiles" to "authenticated";

grant update on table "public"."reporting_profiles" to "authenticated";

grant delete on table "public"."reporting_profiles" to "service_role";

grant insert on table "public"."reporting_profiles" to "service_role";

grant references on table "public"."reporting_profiles" to "service_role";

grant select on table "public"."reporting_profiles" to "service_role";

grant trigger on table "public"."reporting_profiles" to "service_role";

grant truncate on table "public"."reporting_profiles" to "service_role";

grant update on table "public"."reporting_profiles" to "service_role";

grant delete on table "public"."reports" to "anon";

grant insert on table "public"."reports" to "anon";

grant references on table "public"."reports" to "anon";

grant select on table "public"."reports" to "anon";

grant trigger on table "public"."reports" to "anon";

grant truncate on table "public"."reports" to "anon";

grant update on table "public"."reports" to "anon";

grant delete on table "public"."reports" to "authenticated";

grant insert on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "authenticated";

grant select on table "public"."reports" to "authenticated";

grant trigger on table "public"."reports" to "authenticated";

grant truncate on table "public"."reports" to "authenticated";

grant update on table "public"."reports" to "authenticated";

grant delete on table "public"."reports" to "service_role";

grant insert on table "public"."reports" to "service_role";

grant references on table "public"."reports" to "service_role";

grant select on table "public"."reports" to "service_role";

grant trigger on table "public"."reports" to "service_role";

grant truncate on table "public"."reports" to "service_role";

grant update on table "public"."reports" to "service_role";


  create policy "Federal can view feedback"
  on "public"."report_feedbacks"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.reporting_profiles rp
  WHERE ((rp.user_id = auth.uid()) AND (rp.hierarchy_level = 'federal'::text)))));



  create policy "Regions can view feedback"
  on "public"."report_feedbacks"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM (public.reports r
     JOIN public.reporting_profiles rp ON ((rp.user_id = auth.uid())))
  WHERE ((r.id = report_feedbacks.report_id) AND (rp.hierarchy_level = 'region'::text) AND (rp.region_name = r.region_name)))));



  create policy "Reviewers can insert feedback"
  on "public"."report_feedbacks"
  as permissive
  for insert
  to public
with check ((auth.uid() = reviewer_id));



  create policy "Users can view feedback on their reports"
  on "public"."report_feedbacks"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.reports r
  WHERE ((r.id = report_feedbacks.report_id) AND (r.submitter_id = auth.uid())))));



  create policy "Users can insert own reporting profile"
  on "public"."reporting_profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can read own reporting profile"
  on "public"."reporting_profiles"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can update own reporting profile"
  on "public"."reporting_profiles"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Federal can update submitted reports"
  on "public"."reports"
  as permissive
  for update
  to public
using (((EXISTS ( SELECT 1
   FROM public.reporting_profiles rp
  WHERE ((rp.user_id = auth.uid()) AND (rp.hierarchy_level = 'federal'::text)))) AND (status = ANY (ARRAY['submitted_to_federal'::text, 'accepted_by_federal'::text]))));



  create policy "Federal can view submitted reports"
  on "public"."reports"
  as permissive
  for select
  to public
using (((EXISTS ( SELECT 1
   FROM public.reporting_profiles rp
  WHERE ((rp.user_id = auth.uid()) AND (rp.hierarchy_level = 'federal'::text)))) AND (status = ANY (ARRAY['submitted_to_federal'::text, 'accepted_by_federal'::text]))));



  create policy "Regions can update reports they received"
  on "public"."reports"
  as permissive
  for update
  to public
using (((EXISTS ( SELECT 1
   FROM public.reporting_profiles rp
  WHERE ((rp.user_id = auth.uid()) AND (rp.hierarchy_level = 'region'::text) AND (rp.region_name = reports.region_name)))) AND (status = ANY (ARRAY['submitted_to_region'::text, 'accepted_by_region'::text, 'submitted_to_federal'::text]))));



  create policy "Regions can view and update submitted reports"
  on "public"."reports"
  as permissive
  for select
  to public
using (((EXISTS ( SELECT 1
   FROM public.reporting_profiles rp
  WHERE ((rp.user_id = auth.uid()) AND (rp.hierarchy_level = 'region'::text) AND (rp.region_name = reports.region_name)))) AND (status = ANY (ARRAY['submitted_to_region'::text, 'accepted_by_region'::text, 'submitted_to_federal'::text, 'accepted_by_federal'::text]))));



  create policy "Users can manage their own reports"
  on "public"."reports"
  as permissive
  for all
  to public
using ((auth.uid() = submitter_id))
with check ((auth.uid() = submitter_id));



  create policy "Members viewable by period members or admins"
  on "public"."period_members"
  as permissive
  for select
  to public
using ((public.is_assessment_admin() OR (user_id = auth.uid()) OR public.is_period_member(period_id)));



