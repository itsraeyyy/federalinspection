set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.enforce_complaint_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  headers json;
  client_ip text;
  req_count int;
BEGIN
  -- Extract IP from Supabase request headers
  headers := current_setting('request.headers', true)::json;
  client_ip := headers->>'x-forwarded-for';
  
  IF client_ip IS NOT NULL THEN
    client_ip := split_part(client_ip, ',', 1);
    
    -- Cleanup old records
    DELETE FROM public.rate_limits WHERE last_request_at < NOW() - INTERVAL '30 minutes';
    
    -- Get current count
    SELECT count INTO req_count FROM public.rate_limits WHERE ip_address = client_ip AND action_type = 'submit_complaint';
    
    IF req_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please try again later. (Max 5 submissions per 30 minutes)';
    END IF;
    
    IF req_count IS NULL THEN
      INSERT INTO public.rate_limits (ip_address, action_type, count, last_request_at) 
      VALUES (client_ip, 'submit_complaint', 1, NOW());
    ELSE
      UPDATE public.rate_limits 
      SET count = count + 1, last_request_at = NOW() 
      WHERE ip_address = client_ip AND action_type = 'submit_complaint';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.finalize_team_scores(p_team_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sebsabi_count INT;
  v_total_members INT;
  v_locked_self_assessments INT;
  v_locked_evaluations INT;
  v_required_evaluations INT;
  v_number_of_leaders INT;
BEGIN
  -- Security check: Must be sebsabi of the team or an admin
  IF NOT (public.is_assessment_admin() OR public.get_team_role(p_team_id, auth.uid()) = 'sebsabi') THEN
    RAISE EXCEPTION 'Unauthorized: Only sebsabi or admin can finalize scores';
  END IF;

  -- Get total members in the team
  SELECT count(*) INTO v_total_members FROM public.team_members WHERE team_id = p_team_id;
  
  -- Get locked self assessments
  SELECT count(*) INTO v_locked_self_assessments FROM public.self_assessments WHERE team_id = p_team_id AND is_locked = true;
  
  -- Gate Check 1: All members must have locked self assessments
  IF v_locked_self_assessments < v_total_members THEN
    RAISE EXCEPTION 'Cannot finalize: Not all team members have completed their self assessments.';
  END IF;

  -- Get number of leaders
  SELECT count(*) INTO v_number_of_leaders FROM public.team_members WHERE team_id = p_team_id AND role IN ('sebsabi', 'tsehafi', 'mktl_tsehafi');

  -- Get locked leadership evaluations
  SELECT count(*) INTO v_locked_evaluations FROM public.leadership_evaluations WHERE team_id = p_team_id AND is_locked = true;
  
  -- Gate Check 2: All leaders must have evaluated all team members
  -- The PRD states: count(leadership_evaluations where is_locked = true) == (count(team_members) * number_of_leaders)
  v_required_evaluations := v_total_members * v_number_of_leaders;
  IF v_locked_evaluations < v_required_evaluations THEN
    RAISE EXCEPTION 'Cannot finalize: Not all leadership evaluations have been completed and locked.';
  END IF;

  -- Calculate and insert final scores
  INSERT INTO public.final_scores (user_id, team_id, final_score_30)
  SELECT 
    tm.user_id,
    p_team_id,
    COALESCE(sa.total_score_10, 0) + COALESCE(le.avg_score_20, 0) AS final_score_30
  FROM public.team_members tm
  LEFT JOIN public.self_assessments sa ON sa.team_id = p_team_id AND sa.user_id = tm.user_id
  LEFT JOIN (
    SELECT target_user_id, AVG(score_20) as avg_score_20
    FROM public.leadership_evaluations
    WHERE team_id = p_team_id
    GROUP BY target_user_id
  ) le ON le.target_user_id = tm.user_id
  WHERE tm.team_id = p_team_id
  ON CONFLICT (team_id, user_id) DO UPDATE 
  SET final_score_30 = EXCLUDED.final_score_30;

  -- Update team status
  UPDATE public.teams SET status = 'finalized' WHERE id = p_team_id;

  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_period_role(p_period_id uuid, p_user_id uuid)
 RETURNS public.assessment_role
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.period_members
  WHERE period_id = p_period_id AND user_id = p_user_id
  LIMIT 1;
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

CREATE OR REPLACE FUNCTION public.is_period_member(p_period_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.period_members
    WHERE period_id = p_period_id AND user_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.join_period_via_qr(p_period_id uuid, p_full_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_phone_number TEXT;
BEGIN
  -- Get the current authenticated user's phone number
  SELECT raw_user_meta_data->>'phone' INTO v_phone_number 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- If not in metadata, try getting it from phone column
  IF v_phone_number IS NULL THEN
    SELECT phone INTO v_phone_number FROM auth.users WHERE id = auth.uid();
  END IF;

  -- Upsert into public.users
  INSERT INTO public.users (id, phone_number, full_name)
  VALUES (auth.uid(), v_phone_number, p_full_name)
  ON CONFLICT (id) DO UPDATE 
  SET full_name = EXCLUDED.full_name,
      phone_number = EXCLUDED.phone_number;

  -- Add to period_members with default role 'regular'
  INSERT INTO public.period_members (period_id, user_id, role)
  VALUES (p_period_id, auth.uid(), 'regular')
  ON CONFLICT (period_id, user_id) DO NOTHING;

  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_complaints_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;


