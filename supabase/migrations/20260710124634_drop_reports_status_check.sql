-- Drop the restrictive status check constraint since the new UI uses 'submitted', 'reviewed', 'approved'
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_status_check;
