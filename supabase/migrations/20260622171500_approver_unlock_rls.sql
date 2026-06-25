-- Allow approvers to update self_assessments so they can unlock them
DROP POLICY IF EXISTS "Approvers can update self assessments" ON public.self_assessments;

CREATE POLICY "Approvers can update self assessments" ON public.self_assessments FOR UPDATE USING (
  public.get_period_role(period_id, auth.uid()) = 'approver'
) WITH CHECK (
  public.get_period_role(period_id, auth.uid()) = 'approver'
);
