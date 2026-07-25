import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FormsAdminView } from "@/components/dashboard/FormsAdminView";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function FormsPage() {
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
      console.error("[Forms Auth Check Failed] User ID:", user.id, "| AdminErr:", adminErr, "| SessionErr:", sessionErr);
    }
  }

  if (!profile || profile.status?.toLowerCase() !== 'active') {
    console.error("[Forms Unauthorized Redirect] User ID:", user.id, "| Found Profile:", profile);
    redirect('/auth/login?error=unauthorized');
  }

  // Admin data fetching
  const { data: fetchedReps } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id, region, system_role, users:user_id(full_name, phone_number)')
    .eq('system_role', 'representative');

  const { data: fetchedReports } = await supabaseAdmin
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
    
  const { data: fetchedSchemas } = await supabaseAdmin
    .from('form_schemas')
    .select('*')
    .order('id');
    
  const sortedSchemas = (fetchedSchemas || []).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return (
    <DashboardLayout>
      <FormsAdminView 
        initialRepresentatives={fetchedReps || []} 
        initialReports={fetchedReports || []} 
        initialSchemas={sortedSchemas}
      />
    </DashboardLayout>
  );
}
