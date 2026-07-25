import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FormsAdminView } from "@/components/dashboard/FormsAdminView";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function FormsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile, error: profileErr } = await supabase
    .from('admin_profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profileErr || profile.status?.toLowerCase() !== 'active') {
    console.error("[Forms Auth Check Failed] User ID:", user.id, "| Error:", profileErr, "| Found Profile:", profile);
    redirect('/auth/login?error=unauthorized');
  }

  // Admin data fetching via authenticated session client
  const { data: fetchedReps } = await supabase
    .from('user_profiles')
    .select('user_id, region, system_role, users:user_id(full_name, phone_number)')
    .eq('system_role', 'representative');

  const { data: fetchedReports } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
    
  const { data: fetchedSchemas } = await supabase
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
