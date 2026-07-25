import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminHistoryView } from "@/components/dashboard/history/AdminHistoryView";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  let { data: profile, error: adminErr } = await supabaseAdmin
    .from('admin_profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || adminErr) {
    const { data: sessionProfile, error: sessionErr } = await supabase
      .from('admin_profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();
      
    if (sessionProfile && !sessionErr) {
      profile = sessionProfile;
    } else {
      console.error("[Reports History Auth Check Failed] User ID:", user.id, "| AdminErr:", adminErr, "| SessionErr:", sessionErr);
    }
  }

  if (!profile || profile.status?.toLowerCase() !== 'active') {
    console.error("[Reports History Unauthorized Redirect] User ID:", user.id, "| Found Profile:", profile);
    redirect('/auth/login?error=unauthorized');
  }

  // Fetch all submitted, reviewed, and approved reports
  const { data: reports } = await supabaseAdmin
    .from('reports')
    .select('*')
    .in('status', ['submitted', 'reviewed', 'approved'])
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });
    
  const { data: schemas } = await supabaseAdmin
    .from('form_schemas')
    .select('*')
    .order('id');
    
  const sortedSchemas = (schemas || []).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return (
    <DashboardLayout>
      <AdminHistoryView 
        initialReports={reports || []} 
        initialSchemas={sortedSchemas}
      />
    </DashboardLayout>
  );
}
