-- Enable realtime for scan_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_requests;

-- Allow anon users to create requests
CREATE POLICY "Allow anon insert to scan_requests"
ON public.scan_requests FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anon users to read requests (needed to receive realtime updates for their requests)
CREATE POLICY "Allow anon select on scan_requests"
ON public.scan_requests FOR SELECT
TO anon
USING (true);
